<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Log;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        // General API limits (60 per minute per user/IP)
        RateLimiter::for('api.general', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->_id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    Log::warning('General API rate limit exceeded', ['ip' => $request->ip()]);
                    // Response formatting handled in global exception handler
                });
        });

        // Admin API limits (120 per minute per admin/IP)
        RateLimiter::for('api.admin', function (Request $request) {
            return Limit::perMinute(120)->by($request->get('admin')?->_id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    Log::warning('Admin API rate limit exceeded', ['ip' => $request->ip()]);
                });
        });

        // Registration spam protection (5 per 10 minutes)
        RateLimiter::for('auth.register', function (Request $request) {
            return Limit::perMinutes(10, 5)->by($request->ip())
                ->response(function (Request $request, array $headers) {
                    Log::warning('Registration rate limit exceeded', ['ip' => $request->ip()]);
                });
        });

        // Login abuse protection (5 per 15 minutes)
        RateLimiter::for('auth.login', function (Request $request) {
            $identifier = $request->input('email') ?: $request->input('username');
            return [
                Limit::perMinutes(15, 5)->by($request->ip()),
                Limit::perMinutes(15, 5)->by($identifier)
            ];
        });

        // Forgot password abuse (3 per 15 minutes)
        RateLimiter::for('auth.forgot_password', function (Request $request) {
            return Limit::perMinutes(15, 3)->by($request->ip())
                ->response(function (Request $request, array $headers) {
                    Log::warning('Forgot password rate limit exceeded', ['ip' => $request->ip()]);
                });
        });

        // OTP resend abuse (5 per 15 minutes)
        RateLimiter::for('auth.resend_otp', function (Request $request) {
            return Limit::perMinutes(15, 5)->by($request->ip());
        });

        // OTP verification spam (5 per 5 minutes)
        RateLimiter::for('auth.verify_otp', function (Request $request) {
            return Limit::perMinutes(5, 5)->by($request->ip());
        });

        // Global search rate limit (60 per minute per IP)
        RateLimiter::for('api.search', function (Request $request) {
            return Limit::perMinute(60)->by($request->user()?->_id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    Log::warning('Search API rate limit exceeded', ['ip' => $request->ip()]);
                });
        });
    }
}
