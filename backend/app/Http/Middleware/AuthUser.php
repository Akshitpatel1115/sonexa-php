<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AuthUser
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->cookie('token') ?: $request->bearerToken();
        if (!$token) {
            return response()->json(['success' => false, 'message' => 'Please login to access this route.'], 401);
        }
        try {
            $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
            $user = User::find($decoded->id);
            if (!$user) {
                return response()->json(['success' => false, 'message' => 'User not found.'], 401);
            }
            Auth::login($user);
            $request->merge(['user' => $user]);
            return $next($request);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('JWT Auth Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Invalid or expired token.'], 401);
        }
    }
}
