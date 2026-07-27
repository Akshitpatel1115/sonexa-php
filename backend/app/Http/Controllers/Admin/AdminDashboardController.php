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
        
        $activeArtists = User::where('role', 'artist')->where('status', 'active')->count();
        $pendingArtists = User::where('role', 'artist')->where('status', 'pending')->count();

        $totalSongs = Music::count();
        $totalAlbums = Album::count();

        return response()->json([
            'message' => 'Stats retrieved successfully',
            'stats' => [
                'totalUsers' => $totalUsers,
                'totalArtists' => $totalArtists,
                'verifiedArtists' => $activeArtists,
                'pendingArtists' => $pendingArtists,
                'totalSongs' => $totalSongs,
                'totalAlbums' => $totalAlbums,
            ]
        ]);
    }
}
