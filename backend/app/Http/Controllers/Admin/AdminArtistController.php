<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\AuditLog;
use App\Models\AuthSecurity;
use Carbon\Carbon;

class AdminArtistController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('authSecurity')->where('role', 'artist');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('username', 'like', "%{$search}%");
        }

        $artists = $query->orderBy('created_at', 'desc')->paginate(20);

        // Map authBlock back for frontend compatibility
        foreach ($artists as $artist) {
            if ($artist->authSecurity && $artist->authSecurity->auth_block_until) {
                if (Carbon::parse($artist->authSecurity->auth_block_until)->isPast()) {
                    $artist->authSecurity->auth_block_until = null;
                    $artist->authSecurity->save();
                    $artist->authBlock = null;
                } else {
                    $artist->authBlock = [
                        'blockedUntil' => $artist->authSecurity->auth_block_until
                    ];
                }
            } else {
                $artist->authBlock = null;
            }
        }

        return response()->json([
            'message' => 'Artists retrieved successfully',
            'artists' => $artists
        ]);
    }

    public function show($id)
    {
        $artist = User::with('authSecurity')->where('_id', $id)->where('role', 'artist')->first();
        if (!$artist) return response()->json(['message' => 'Artist not found'], 404);

        if ($artist->authSecurity && $artist->authSecurity->auth_block_until && Carbon::parse($artist->authSecurity->auth_block_until)->isFuture()) {
            $artist->authBlock = [
                'blockedUntil' => $artist->authSecurity->auth_block_until
            ];
        } else {
            $artist->authBlock = null;
        }

        return response()->json([
            'message' => 'Artist retrieved successfully',
            'artist' => $artist
        ]);
    }

    public function approve(Request $request, $id)
    {
        $admin = $request->get('admin');
        $artist = User::where('_id', $id)->where('role', 'artist')->first();
        if (!$artist) return response()->json(['message' => 'Artist not found'], 404);

        $security = AuthSecurity::where('user_id', $artist->_id)->first();
        if ($security) {
            $security->auth_block_until = null;
            $security->save();
        }

        $artist->status = 'active';
        $artist->save();

        AuditLog::create([
            'admin_id' => $admin->_id,
            'action' => 'ARTIST_APPROVE',
            'target_resource' => 'Artist: ' . $artist->_id,
            'ip_address' => $request->ip()
        ]);

        return response()->json(['message' => 'Artist approved successfully']);
    }

    public function suspend(Request $request, $id)
    {
        $admin = $request->get('admin');
        $artist = User::where('_id', $id)->where('role', 'artist')->first();
        if (!$artist) return response()->json(['message' => 'Artist not found'], 404);

        $security = AuthSecurity::firstOrCreate(['user_id' => $artist->_id], ['username' => $artist->username]);
        $security->auth_block_until = Carbon::now()->addYears(100);
        $security->save();

        AuditLog::create([
            'admin_id' => $admin->_id,
            'action' => 'ARTIST_SUSPEND',
            'target_resource' => 'Artist: ' . $artist->_id,
            'ip_address' => $request->ip()
        ]);

        return response()->json(['message' => 'Artist suspended successfully']);
    }

    public function reject(Request $request, $id)
    {
        $admin = $request->get('admin');
        $artist = User::where('_id', $id)->where('role', 'artist')->first();
        if (!$artist) return response()->json(['message' => 'Artist not found'], 404);

        if ($artist->status !== 'pending') {
            return response()->json(['message' => 'Only pending artists can be rejected'], 400);
        }

        AuthSecurity::where('user_id', $artist->_id)->delete();
        \App\Models\EmailOtp::where('user_id', $artist->_id)->delete();
        $artist->delete();

        AuditLog::create([
            'admin_id' => $admin->_id,
            'action' => 'ARTIST_REJECT',
            'target_resource' => 'Artist: ' . $id,
            'ip_address' => $request->ip()
        ]);

        return response()->json(['message' => 'Artist registration rejected and deleted']);
    }
}
