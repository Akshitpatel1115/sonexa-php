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
        // General API limits (temporarily disabled, original: 60 per minute per user/IP)
        RateLimiter::for('api.general', function (Request $request) {
            return Limit::none();
        });

        // Admin API limits (temporarily disabled, original: 120 per minute per admin/IP)
        RateLimiter::for('api.admin', function (Request $request) {
            return Limit::none();
        });

        // Registration spam protection (temporarily disabled, original: 5 per 10 minutes)
        RateLimiter::for('auth.register', function (Request $request) {
            return Limit::none();
        });

        // Login abuse protection (temporarily disabled, original: 5 per 15 minutes)
        RateLimiter::for('auth.login', function (Request $request) {
            return Limit::none();
        });

        // Forgot password abuse (temporarily disabled, original: 3 per 15 minutes)
        RateLimiter::for('auth.forgot_password', function (Request $request) {
            return Limit::none();
        });

        // OTP resend abuse (temporarily disabled, original: 5 per 15 minutes)
        RateLimiter::for('auth.resend_otp', function (Request $request) {
            return Limit::none();
        });

        // OTP verification spam (temporarily disabled, original: 5 per 5 minutes)
        RateLimiter::for('auth.verify_otp', function (Request $request) {
            return Limit::none();
        });

        // Global search rate limit (temporarily disabled, original: 60 per minute per IP)
        RateLimiter::for('api.search', function (Request $request) {
            return Limit::none();
        });
    }
}
