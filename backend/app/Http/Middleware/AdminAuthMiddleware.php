<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Models\Admin;

class AdminAuthMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->cookie('admin_token') ?: $request->bearerToken();
        if (!$token) {
            return response()->json(['message' => 'Please login to access this route.'], 401);
        }

        try {
            $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
            
            if ($decoded->role !== 'admin') {
                return response()->json(['message' => 'Not Found'], 404);
            }

            $admin = Admin::find($decoded->id);

            if (!$admin) {
                return response()->json(['message' => 'Admin not found'], 404);
            }

            if (!$admin->is_active) {
                return response()->json(['message' => 'Account suspended'], 403);
            }

            $request->attributes->set('admin', $admin);
            
        } catch (\Exception $e) {
            return response()->json(['message' => 'Not Found'], 404);
        }

        return $next($request);
    }
}
