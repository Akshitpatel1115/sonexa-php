<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Admin;
use App\Models\AuditLog;
use App\Models\EmailOtp;
use App\Models\AuthSecurity;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;
use App\Mail\PasswordResetMail;
use Firebase\JWT\JWT;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cookie;

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
        
        $existingUser = User::where('email', $request->email)->orWhere('username', $request->username)->first();
        if ($existingUser) {
            if ($existingUser->status === 'unverified') {
                return response()->json(['success' => false, 'message' => 'Registration is pending. Please verify your OTP to continue.'], 409);
            }
            return response()->json(['success' => false, 'message' => 'User already exists. Please log in.'], 409);
        }

        $otp = random_int(100000, 999999);
        
        $user = User::create([
            'email' => $request->email,
            'username' => $request->username,
            'password' => Hash::make($request->password),
            'role' => $request->role ?? 'user',
            'status' => 'unverified',
            'avatar' => $request->avatar ?: '1.jpg',
        ]);

        EmailOtp::create([
            'user_id' => $user->_id,
            'email' => $request->email,
            'otp' => Hash::make((string) $otp),
            'type' => 'registration',
            'expires_at' => Carbon::now()->addMinutes(10),
            'resend_available_at' => Carbon::now()->addMinutes(2)
        ]);

        AuthSecurity::create([
            'user_id' => $user->_id,
            'username' => $user->username,
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
        
        $user = User::where('email', $request->email)->where('status', 'unverified')->first();
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'No pending registration found.'], 404);
        }

        $security = AuthSecurity::firstOrCreate(['user_id' => $user->_id], ['username' => $user->username]);

        if ($security->auth_block_until && Carbon::parse($security->auth_block_until)->isFuture()) {
            return response()->json(['success' => false, 'message' => 'Too many failed attempts. Please try again later.'], 423);
        } elseif ($security->auth_block_until) {
            $security->auth_block_until = null;
            $security->save();
        }

        $emailOtp = EmailOtp::where('user_id', $user->_id)->where('type', 'registration')->first();
        if (!$emailOtp || Carbon::now()->greaterThan($emailOtp->expires_at)) {
            // Delete user if OTP completely expired (to free up email for re-registration)
            $user->delete();
            $security->delete();
            if ($emailOtp) $emailOtp->delete();
            return response()->json(['success' => false, 'message' => 'OTP has expired. Please register again.'], 400);
        }

        if (!Hash::check((string) $request->otp, $emailOtp->otp)) {
            $security->otp_attempts = ($security->otp_attempts ?? 0) + 1;
            if ($security->otp_attempts >= 5) {
                $security->auth_block_until = Carbon::now()->addMinutes(5);
                $security->otp_attempts = 0;
            }
            $security->save();
            return response()->json(['success' => false, 'message' => 'Invalid verification code.'], 401);
        }
        
        $status = ($user->role === 'artist') ? 'pending' : 'active';
        $user->update([
            'status' => $status,
            'email_verified_at' => Carbon::now()
        ]);
        
        // Clean up registration OTP
        $emailOtp->delete();
        $security->otp_attempts = 0;
        $security->save();

        if ($status === 'pending') {
            return response()->json(['success' => true, 'message' => 'OTP verified successfully. Your artist account is pending admin approval.'], 200);
        }
        return response()->json(['success' => true, 'message' => 'OTP verified successfully. You can now login.'], 200);
    }

    public function resendOtp(Request $request)
    {
        $request->validate(['email' => 'required|email']);
        
        $user = User::where('email', $request->email)->where('status', 'unverified')->first();
        if (!$user) return response()->json(['success' => false, 'message' => 'No pending registration found.'], 404);

        $security = AuthSecurity::firstOrCreate(['user_id' => $user->_id], ['username' => $user->username]);

        if ($security->auth_block_until && Carbon::parse($security->auth_block_until)->isFuture()) {
            return response()->json(['success' => false, 'message' => 'Too many failed attempts. Please try again later.'], 423);
        }

        $emailOtp = EmailOtp::where('user_id', $user->_id)->where('type', 'registration')->first();
        if (!$emailOtp) {
            $emailOtp = new EmailOtp([
                'user_id' => $user->_id,
                'email' => $user->email,
                'type' => 'registration'
            ]);
        }

        if ($emailOtp->resend_available_at && Carbon::now()->lessThan($emailOtp->resend_available_at)) {
            return response()->json(['success' => false, 'message' => 'Please wait before requesting a new OTP.'], 429);
        }

        $otp = random_int(100000, 999999);
        $emailOtp->otp = Hash::make((string) $otp);
        $emailOtp->expires_at = Carbon::now()->addMinutes(10);
        $emailOtp->resend_available_at = Carbon::now()->addMinutes(2);
        $emailOtp->save();

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

        if ($user->status === 'unverified') {
            return response()->json(['success' => false, 'message' => 'Your account is not verified. Please verify your email.'], 403);
        }

        if ($user->status === 'pending') {
            return response()->json(['success' => false, 'message' => 'Your artist account is pending admin approval.'], 403);
        }

        $security = AuthSecurity::firstOrCreate(['user_id' => $user->_id], ['username' => $user->username]);

        // Check for active authBlock
        if ($security->auth_block_until && Carbon::parse($security->auth_block_until)->isFuture()) {
            return response()->json(['success' => false, 'message' => 'Your account is temporarily suspended. Please try again later or contact support.'], 403);
        } elseif ($security->auth_block_until) {
            $security->auth_block_until = null;
            $security->save();
        }

        if (!Hash::check($request->password, $user->password)) {
            $security->login_attempts = ($security->login_attempts ?? 0) + 1;
            $security->last_failed_login_at = Carbon::now();
            if ($security->login_attempts >= 5) {
                $security->auth_block_until = Carbon::now()->addMinutes(15);
                $security->login_attempts = 0;
            }
            $security->save();
            return response()->json(['success' => false, 'message' => 'Invalid credentials.'], 401);
        }

        // Successful login resets attempts and logs ip
        $security->login_attempts = 0;
        $security->last_login_at = Carbon::now();
        $security->last_login_ip = $request->ip();
        $security->last_login_user_agent = $request->header('User-Agent');
        $security->save();
        
        $user->last_login_at = Carbon::now();
        $user->save();

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

        $security = AuthSecurity::firstOrCreate(['user_id' => $user->_id], ['username' => $user->username]);

        if ($security->auth_block_until && Carbon::parse($security->auth_block_until)->isFuture()) {
            return response()->json(['success' => false, 'message' => 'Your account is suspended. Please contact support.'], 403);
        }

        $emailOtp = EmailOtp::where('user_id', $user->_id)->where('type', 'forgot_password')->first();
        if (!$emailOtp) {
            $emailOtp = new EmailOtp([
                'user_id' => $user->_id,
                'email' => $user->email,
                'type' => 'forgot_password'
            ]);
        }

        if ($emailOtp->resend_available_at && Carbon::now()->lessThan($emailOtp->resend_available_at)) {
            return response()->json(['success' => false, 'message' => 'Please wait before requesting a new OTP.'], 429);
        }

        $otp = random_int(100000, 999999);
        $emailOtp->otp = Hash::make((string) $otp);
        $emailOtp->expires_at = Carbon::now()->addMinutes(10);
        $emailOtp->resend_available_at = Carbon::now()->addMinutes(2);
        $emailOtp->verified_at = null;
        $emailOtp->save();

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

        $security = AuthSecurity::firstOrCreate(['user_id' => $user->_id], ['username' => $user->username]);

        if ($security->auth_block_until && Carbon::parse($security->auth_block_until)->isFuture()) {
            return response()->json(['success' => false, 'message' => 'Too many failed attempts. Please try again later.'], 423);
        }

        $emailOtp = EmailOtp::where('user_id', $user->_id)->where('type', 'forgot_password')->first();

        if (!$emailOtp || Carbon::now()->greaterThan($emailOtp->expires_at)) {
            return response()->json(['success' => false, 'message' => 'OTP has expired.'], 400);
        }
        
        if (!Hash::check((string) $request->otp, $emailOtp->otp)) {
            $security->forgot_password_attempts = ($security->forgot_password_attempts ?? 0) + 1;
            if ($security->forgot_password_attempts >= 5) {
                $security->auth_block_until = Carbon::now()->addMinutes(5);
                $security->forgot_password_attempts = 0;
            }
            $security->save();
            return response()->json(['success' => false, 'message' => 'Invalid verification code.'], 401);
        }

        $security->forgot_password_attempts = 0;
        $security->save();

        $emailOtp->verified_at = Carbon::now();
        $emailOtp->save();

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
        if (!$user) return response()->json(['success' => false, 'message' => 'User not found.'], 404);

        $security = AuthSecurity::firstOrCreate(['user_id' => $user->_id], ['username' => $user->username]);

        if ($security->auth_block_until && Carbon::parse($security->auth_block_until)->isFuture()) {
             return response()->json(['success' => false, 'message' => 'Your account is suspended.'], 403);
        }

        $emailOtp = EmailOtp::where('user_id', $user->_id)->where('type', 'forgot_password')->first();

        if (!$emailOtp || !$emailOtp->verified_at || Carbon::now()->greaterThan($emailOtp->expires_at)) {
            return response()->json(['success' => false, 'message' => 'Unauthorized password reset attempt or OTP expired.'], 401);
        }

        $user->update(['password' => Hash::make($request->newPassword)]);
        
        // Cleanup OTP
        $emailOtp->delete();

        return response()->json(['success' => true, 'message' => 'Password reset successfully.'], 200);
    }

    public function me(Request $request)
    {
        if (!$request->user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        $user = User::find($request->user->_id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }
        return response()->json([
            'success' => true,
            'data' => [
                'user' => $user
            ]
        ], 200);
    }

    public function updateProfile(Request $request)
    {
        if (!$request->user) {
            return response()->json(['success' => false, 'message' => 'Unauthorized'], 401);
        }
        $user = User::find($request->user->_id);
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found'], 404);
        }

        $request->validate([
            'username' => 'nullable|string|min:3|max:50',
            'avatar' => 'nullable|string'
        ]);

        if ($request->has('username')) {
            $user->username = $request->username;
        }

        if ($request->has('avatar')) {
            $user->avatar = $request->avatar;
        }

        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully.',
            'data' => [
                'user' => $user
            ]
        ], 200);
    }
}
