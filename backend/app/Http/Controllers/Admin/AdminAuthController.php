<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Cookie;
use Firebase\JWT\Key;
use App\Models\Admin;
use App\Models\AuditLog;

class AdminAuthController extends Controller
{
    /**
     * Get a JWT via given credentials.
     */
    public function login(Request $request)
    {
        // Check if admin is already logged in
        $token = $request->cookie('admin_token') ?: ($request->cookie('token') ?: $request->bearerToken());
        if ($token) {
            try {
                $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
                if ($decoded->role === 'admin') {
                    $admin = Admin::find($decoded->id);
                    if ($admin && $admin->is_active) {
                        return response()->json(['success' => false, 'message' => 'You are already logged in.'], 400);
                    }
                }
            } catch (\Exception $e) {
                // Invalid token, proceed to login
            }
        }

        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $admin = Admin::where('email', $request->email)->first();

        if (!$admin || !Hash::check($request->password, $admin->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        if (!$admin->is_active) {
            return response()->json(['message' => 'Account suspended'], 403);
        }

        $token = JWT::encode([
            'id' => (string) $admin->_id,
            'role' => 'admin',
            'email' => $admin->email,
            'permissions' => $admin->permissions
        ], env('JWT_SECRET'), 'HS256');

        // Update last login
        $admin->last_login_at = now();
        $admin->save();

        // Create audit log
        AuditLog::create([
            'admin_id' => $admin->_id,
            'action' => 'ADMIN_LOGIN',
            'ip_address' => $request->ip()
        ]);

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'admin' => [
                'id' => $admin->_id,
                'name' => $admin->name,
                'email' => $admin->email,
                'permissions' => $admin->permissions
            ]
        ])->withCookie(Cookie::make('admin_token', $token, 7 * 24 * 60, null, null, true, true, false, 'None'));
    }

    /**
     * Get the authenticated Admin.
     */
    public function me(Request $request)
    {
        $admin = $request->get('admin');
        return response()->json([
            'admin' => [
                'id' => $admin->_id,
                'name' => $admin->name,
                'email' => $admin->email,
                'permissions' => $admin->permissions
            ]
        ]);
    }

    /**
     * Log the admin out.
     */
    public function logout(Request $request)
    {
        return response()->json(['message' => 'Successfully logged out'])
            ->withCookie(Cookie::forget('admin_token'))
            ->withCookie(Cookie::forget('token'));
    }
}
