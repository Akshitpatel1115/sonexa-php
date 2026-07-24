<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Music;
use App\Models\Album;
use App\Models\AuditLog;
use Carbon\Carbon;

class AdminDashboardController extends Controller
{
    public function getStats(Request $request)
    {
        $admin = $request->get('admin');

        $totalUsers = User::where('role', 'user')->count();
        
        $totalArtists = User::where('role', 'artist')->count();
        // Since there is no "verified" vs "pending" artist in the current schema (just 'authBlock'),
        // we'll count active artists vs blocked artists for now.

        $now = Carbon::now();

        $activeArtists = User::where('role', 'artist')->where(function($q) use ($now) {
            $q->whereNull('authBlock.blockedUntil')
              ->orWhere('authBlock.blockedUntil', '<', $now);
        })->count();

        $blockedArtists = User::where('role', 'artist')
            ->whereNotNull('authBlock.blockedUntil')
            ->where('authBlock.blockedUntil', '>=', $now)
            ->count();

        $totalSongs = Music::count();
        $totalAlbums = Album::count();

        // Let's create an audit log for viewing dashboard (optional, maybe too noisy)

        return response()->json([
            'message' => 'Stats retrieved successfully',
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalArtists' => $totalArtists,
                'verifiedArtists' => $activeArtists, // using active for now
                'pendingArtists' => $blockedArtists, // using blocked for now
                'totalSongs' => $totalSongs,
                'totalAlbums' => $totalAlbums,
            ]
        ]);
    }
}
