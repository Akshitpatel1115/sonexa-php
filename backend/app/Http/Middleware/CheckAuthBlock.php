<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Models\User;

class CheckAuthBlock
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->cookie('token') ?: $request->bearerToken();
        if ($token) {
            try {
                $decoded = JWT::decode($token, new Key(env('JWT_SECRET'), 'HS256'));
                $user = User::find($decoded->id);
                if ($user) {
                    return response()->json(['success' => false, 'message' => 'You are already logged in.'], 400);
                }
            } catch (\Exception $e) {}
        }
        return $next($request);
    }
}
