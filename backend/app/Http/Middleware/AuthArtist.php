<?php
namespace App\Http\Middleware;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class AuthArtist
{
    public function handle(Request $request, Closure $next): Response
    {
        try {
            $user = Auth::user() ?? $request->user;
            if (!$user || $user->role !== 'artist') {
                return response()->json(['success' => false, 'message' => 'You are not authorized to perform this action.'], 403);
            }
            return $next($request);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('JWT Auth Error: ' . $e->getMessage());
            return response()->json(['success' => false, 'message' => 'Invalid or expired token.'], 401);
        }
    }
}
