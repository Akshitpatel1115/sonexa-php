<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\PendingUser;
use App\Models\Admin;
use App\Models\AuditLog;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;
use App\Mail\PasswordResetMail;
use Firebase\JWT\JWT;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cookie;
// Removed RateLimiter because we handle brute force via MongoDB directly

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'email' => 'required|email', 
            'username' => 'required|string', 
            'password' => [
                'required',
                'string',
                'min:8',
                'regex:/[a-z]/',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
                'regex:/[^A-Za-z0-9]/'
            ]
        ]);
        
        if (User::where('email', $request->email)->orWhere('username', $request->username)->first()) {
            return response()->json(['success' => false, 'message' => 'User already exists. Please log in.'], 409);
        }
        if (PendingUser::where('email', $request->email)->first()) {
            return response()->json(['success' => false, 'message' => 'Registration is pending. Please verify your OTP to continue.'], 409);
        }
        $otp = random_int(100000, 999999);
        PendingUser::create([
            'email' => $request->email,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'otp' => Hash::make((string) $otp),
            'role' => $request->role ?? 'user',
            'otpExpiresAt' => Carbon::now()->addMinutes(10),
            'resendAvailableAt' => Carbon::now()->addMinutes(2),
            'expiresAt' => Carbon::now()->addMinutes(30)
        ]);
        try {
            Mail::to($request->email)->send(new OtpMail($otp));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Email delivery failed for OTP: " . $otp . " Error: " . $e->getMessage());
        }
        return response()->json(['success' => true, 'message' => 'Registration step 1 complete. OTP sent to your email.'], 201);
    }

    public function verifyEmail(Request $request)
    {
        $request->validate(['email' => 'required|email', 'otp' => 'required']);
        
        $pendingUser = PendingUser::where('email', $request->email)->first();
        if (!$pendingUser) return response()->json(['success' => false, 'message' => 'No pending registration found.'], 404);

        if ($pendingUser->authBlock && isset($pendingUser->authBlock['blockedUntil'])) {
            if (Carbon::parse($pendingUser->authBlock['blockedUntil'])->isFuture()) {
                return response()->json(['success' => false, 'message' => 'Too many failed attempts. Please try again later.'], 423);
            } else {
                $pendingUser->unset('authBlock');
            }
        }

        if (Carbon::now()->greaterThan($pendingUser->otpExpiresAt)) {
            $pendingUser->delete();
            return response()->json(['success' => false, 'message' => 'OTP has expired.'], 400);
        }

        if (!Hash::check((string) $request->otp, $pendingUser->otp)) {
            $pendingUser->otpAttempts = ($pendingUser->otpAttempts ?? 0) + 1;
            if ($pendingUser->otpAttempts >= 5) {
                $pendingUser->authBlock = [
                    'blockedUntil' => Carbon::now()->addMinutes(5),
                    'reason' => 'Too many OTP attempts'
                ];
                $pendingUser->otpAttempts = 0;
            }
            $pendingUser->save();
            return response()->json(['success' => false, 'message' => 'Invalid verification code.'], 401);
        }
        
        $status = ($pendingUser->role === 'artist') ? 'pending' : 'active';
        $user = User::create(['username' => $pendingUser->username, 'email' => $pendingUser->email, 'password' => $pendingUser->password, 'role' => $pendingUser->role, 'status' => $status]);
        $pendingUser->delete();

        if ($status === 'pending') {
            return response()->json(['success' => true, 'message' => 'OTP verified successfully. Your artist account is pending admin approval.'], 200);
        }
        return response()->json(['success' => true, 'message' => 'OTP verified successfully. You can now login.'], 200);
    }

    public function resendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        
        $pendingUser = PendingUser::where('email', $request->email)->first();
        if (!$pendingUser) return response()->json(['success' => false, 'message' => 'No pending registration found.'], 404);

        if ($pendingUser->authBlock && isset($pendingUser->authBlock['blockedUntil'])) {
            if (Carbon::parse($pendingUser->authBlock['blockedUntil'])->isFuture()) {
                return response()->json(['success' => false, 'message' => 'Too many failed attempts. Please try again later.'], 423);
            } else {
                $pendingUser->unset('authBlock');
            }
        }

        if ($pendingUser->resendAvailableAt && Carbon::now()->lessThan($pendingUser->resendAvailableAt)) {
            return response()->json(['success' => false, 'message' => 'Please wait before requesting a new OTP.'], 429);
        }
        $otp = random_int(100000, 999999);
        $pendingUser->update(['otp' => Hash::make((string) $otp), 'otpExpiresAt' => Carbon::now()->addMinutes(10), 'resendAvailableAt' => Carbon::now()->addMinutes(2)]);
        try {
            Mail::to($request->email)->send(new OtpMail($otp));
        } catch (\Exception $e) {}
        return response()->json(['success' => true, 'message' => 'A new verification code has been sent to your email.'], 200);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required_without:username|email',
            'username' => 'required_without:email|string',
            'password' => 'required'
        ]);
        
        $identifier = $request->email ?: $request->username;
        $admin = Admin::where('email', $identifier)->first();
        if ($admin && Hash::check($request->password, $admin->password)) {
            if (!$admin->is_active) {
                return response()->json(['success' => false, 'message' => 'Account suspended.'], 403);
            }

            $token = JWT::encode([
                'id' => (string) $admin->_id,
                'role' => 'admin',
                'email' => $admin->email,
                'permissions' => $admin->permissions
            ], env('JWT_SECRET'), 'HS256');

            $admin->last_login_at = now();
            $admin->save();

            AuditLog::create([
                'admin_id' => $admin->_id,
                'action' => 'ADMIN_LOGIN',
                'ip_address' => $request->ip()
            ]);

            $adminData = [
                '_id' => (string) $admin->_id,
                'id' => (string) $admin->_id,
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => 'admin',
                'permissions' => $admin->permissions
            ];

            return response()->json([
                'success' => true,
                'message' => 'Login successful.',
                'data' => [
                    'user' => $adminData,
                    'token' => $token
                ]
            ], 200)
            ->withCookie(Cookie::make('token', $token, 7 * 24 * 60, null, null, true, true, false, 'None'))
            ->withCookie(Cookie::make('admin_token', $token, 7 * 24 * 60, null, null, true, true, false, 'None'));
        }

        $query = User::query();
        if ($request->email) $query->where('email', $request->email);
        else $query->where('username', $request->username);
        $user = $query->first();

        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Invalid credentials.'], 401);
        }

        if (isset($user->status) && $user->status === 'pending') {
            return response()->json(['success' => false, 'message' => 'Your artist account is pending admin approval.'], 403);
        }

        // Check for active authBlock from DB
        if ($user->authBlock && isset($user->authBlock['blockedUntil'])) {
            if (Carbon::parse($user->authBlock['blockedUntil'])->isFuture()) {
                $message = ($user->authBlock['reason'] ?? '') === 'Too many login attempts' 
                    ? 'Too many failed login attempts. Please try again after sometime.' 
                    : 'Your account is suspended. Please contact support.';
                return response()->json(['success' => false, 'message' => $message], 403);
            } else {
                $user->unset('authBlock');
            }
        } elseif ($user->authBlock) {
             return response()->json(['success' => false, 'message' => 'Your account is suspended. Please contact support.'], 403);
        }

        if (!Hash::check($request->password, $user->password)) {
            $user->loginAttempts = ($user->loginAttempts ?? 0) + 1;
            if ($user->loginAttempts >= 5) {
                $user->authBlock = [
                    'blockedUntil' => Carbon::now()->addMinutes(15),
                    'reason' => 'Too many login attempts'
                ];
                $user->loginAttempts = 0;
            }
            $user->save();
            return response()->json(['success' => false, 'message' => 'Invalid credentials.'], 401);
        }

        if (isset($user->loginAttempts) && $user->loginAttempts > 0) {
            $user->unset('loginAttempts');
        }

        $token = JWT::encode(['id' => (string) $user->_id, 'role' => $user->role], env('JWT_SECRET'), 'HS256');
        return response()->json(['success' => true, 'message' => 'Login successful.', 'data' => ['user' => $user, 'token' => $token]], 200)->withCookie(Cookie::make('token', $token, 7 * 24 * 60, null, null, true, true, false, 'None'));
    }

    public function logout()
    {
        return response()->json(['success' => true, 'message' => 'Logged out successfully.'], 200)->withCookie(Cookie::forget('token'));
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        
        $user = User::where('email', $request->email)->first();
        if (!$user) return response()->json(['success' => true, 'message' => 'If an account exists, a password reset code has been sent to your email.'], 200);

        // Check for active authBlock from DB
        if ($user->authBlock && isset($user->authBlock['blockedUntil'])) {
            if (Carbon::parse($user->authBlock['blockedUntil'])->isFuture()) {
                return response()->json(['success' => false, 'message' => 'Your account is suspended. Please contact support.'], 403);
            } else {
                $user->unset('authBlock');
            }
        } elseif ($user->authBlock) {
             return response()->json(['success' => false, 'message' => 'Your account is suspended. Please contact support.'], 403);
        }

        if ($user->resetPasswordResendAvailableAt && Carbon::now()->lessThan($user->resetPasswordResendAvailableAt)) {
            return response()->json(['success' => false, 'message' => 'Please wait before requesting a new OTP.'], 429);
        }
        $otp = random_int(100000, 999999);
        $user->update(['resetPasswordOTP' => Hash::make((string) $otp), 'resetPasswordOTPExpiresAt' => Carbon::now()->addMinutes(10), 'resetPasswordResendAvailableAt' => Carbon::now()->addMinutes(2), 'resetPasswordVerified' => false]);
        try {
            Mail::to($user->email)->send(new PasswordResetMail($otp));
        } catch (\Exception $e) {}
        return response()->json(['success' => true, 'message' => 'If an account exists, a password reset code has been sent to your email.'], 200);
    }

    public function verifyResetOtp(Request $request)
    {
        $request->validate(['email' => 'required|email', 'otp' => 'required']);
        
        $user = User::where('email', $request->email)->first();
        if (!$user) return response()->json(['success' => false, 'message' => 'User not found.'], 404);

        if ($user->authBlock && isset($user->authBlock['blockedUntil'])) {
            if (Carbon::parse($user->authBlock['blockedUntil'])->isFuture()) {
                return response()->json(['success' => false, 'message' => 'Too many failed attempts. Please try again later.'], 423);
            } else {
                $user->unset('authBlock');
            }
        }

        if (!$user->resetPasswordOTP || Carbon::now()->greaterThan($user->resetPasswordOTPExpiresAt)) return response()->json(['success' => false, 'message' => 'OTP has expired.'], 400);
        
        if (!Hash::check((string) $request->otp, $user->resetPasswordOTP)) {
            $user->resetPasswordOtpAttempts = ($user->resetPasswordOtpAttempts ?? 0) + 1;
            if ($user->resetPasswordOtpAttempts >= 5) {
                $user->authBlock = [
                    'blockedUntil' => Carbon::now()->addMinutes(5),
                    'reason' => 'Too many OTP attempts'
                ];
                $user->resetPasswordOtpAttempts = 0;
            }
            $user->save();
            return response()->json(['success' => false, 'message' => 'Invalid verification code.'], 401);
        }

        if (isset($user->resetPasswordOtpAttempts) && $user->resetPasswordOtpAttempts > 0) {
            $user->unset('resetPasswordOtpAttempts');
        }

        $user->update(['resetPasswordVerified' => true]);
        return response()->json(['success' => true, 'message' => 'OTP verified successfully.'], 200);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email', 
            'newPassword' => [
                'required',
                'string',
                'min:8',
                'regex:/[a-z]/',
                'regex:/[A-Z]/',
                'regex:/[0-9]/',
                'regex:/[^A-Za-z0-9]/'
            ]
        ]);
        
        $user = User::where('email', $request->email)->first();

        if ($user && $user->authBlock && isset($user->authBlock['blockedUntil']) && Carbon::parse($user->authBlock['blockedUntil'])->isFuture()) {
             return response()->json(['success' => false, 'message' => 'Your account is suspended.'], 403);
        }

        if (!$user || !$user->resetPasswordVerified || !$user->resetPasswordOTPExpiresAt || Carbon::now()->greaterThan($user->resetPasswordOTPExpiresAt)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized password reset attempt or OTP expired.'], 401);
        }
        $user->update(['password' => Hash::make($request->newPassword), 'resetPasswordOTP' => null, 'resetPasswordOTPExpiresAt' => null, 'resetPasswordResendAvailableAt' => null, 'resetPasswordVerified' => false]);
        return response()->json(['success' => true, 'message' => 'Password reset successfully.'], 200);
    }
}
