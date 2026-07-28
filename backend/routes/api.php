<?php
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\MusicController;
use App\Http\Controllers\AlbumController;
use App\Http\Controllers\SearchController;
use App\Http\Middleware\CheckAuthBlock;
use App\Http\Middleware\AuthUser;
use App\Http\Middleware\AuthArtist;

Route::middleware([CheckAuthBlock::class])->group(function () {
    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:auth.register');
    Route::post('/auth/verify-email', [AuthController::class, 'verifyEmail'])->middleware('throttle:auth.verify_otp');
    Route::post('/auth/resend-otp', [AuthController::class, 'resendOtp'])->middleware('throttle:auth.resend_otp');
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:auth.login');
});

// These routes should be accessible by both guests (forgot password) and authenticated users (reset from profile)
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->middleware('throttle:auth.forgot_password');
Route::post('/auth/verify-reset-otp', [AuthController::class, 'verifyResetOtp'])->middleware('throttle:auth.verify_otp');
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

Route::middleware([AuthUser::class, 'throttle:api.general'])->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});

Route::middleware([AuthUser::class, AuthArtist::class, 'throttle:api.general'])->group(function () {
    Route::post('/music/createMusic', [MusicController::class, 'createMusic']);
    Route::delete('/music/deleteMusic/{id}', [MusicController::class, 'deleteMusic']);
    
    // Album routes for authenticated artists
    Route::post('/album/createAlbum', [AlbumController::class, 'createAlbum']);
    Route::put('/album/{albumId}', [AlbumController::class, 'updateAlbum']);
    Route::delete('/album/{albumId}', [AlbumController::class, 'deleteAlbum']);
});

Route::middleware([AuthUser::class, 'throttle:api.general'])->group(function () {
    Route::get('/music', [MusicController::class, 'getAllMusics']);
    
    // Album public routes (authenticated users)
    Route::get('/album', [AlbumController::class, 'getAllAlbums']);
    Route::get('/album/{albumId}', [AlbumController::class, 'getAlbum']);
    
    // Global Search
    Route::get('/search', [SearchController::class, 'search'])->middleware('throttle:api.search');
});

use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminArtistController;
use App\Http\Controllers\Admin\AdminMusicController;
use App\Http\Controllers\Admin\AdminAlbumController;
use App\Http\Middleware\AdminAuthMiddleware;

Route::prefix('admin')->group(function () {
    Route::post('/auth/login', [AdminAuthController::class, 'login'])->middleware('throttle:auth.login');

    Route::middleware([AdminAuthMiddleware::class, 'throttle:api.admin'])->group(function () {
        Route::get('/auth/me', [AdminAuthController::class, 'me']);
        Route::post('/auth/logout', [AdminAuthController::class, 'logout']);

        Route::get('/dashboard', [AdminDashboardController::class, 'getStats']);

        Route::get('/users', [AdminUserController::class, 'index']);
        Route::get('/users/{id}', [AdminUserController::class, 'show']);
        Route::put('/users/{id}/block', [AdminUserController::class, 'block']);
        Route::put('/users/{id}/unblock', [AdminUserController::class, 'unblock']);
        Route::delete('/users/{id}', [AdminUserController::class, 'destroy']);

        Route::get('/artists', [AdminArtistController::class, 'index']);
        Route::get('/artists/{id}', [AdminArtistController::class, 'show']);
        Route::put('/artists/{id}/approve', [AdminArtistController::class, 'approve']);
        Route::put('/artists/{id}/suspend', [AdminArtistController::class, 'suspend']);
        Route::delete('/artists/{id}/reject', [AdminArtistController::class, 'reject']);

        Route::get('/music', [AdminMusicController::class, 'index']);
        Route::delete('/music/{id}', [AdminMusicController::class, 'destroy']);

        Route::get('/albums', [AdminAlbumController::class, 'index']);
        Route::delete('/albums/{id}', [AdminAlbumController::class, 'destroy']);
    });
});

