<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\AuditLog;
use Carbon\Carbon;

class AdminArtistController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'artist');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('username', 'like', "%{$search}%");
        }

        $artists = $query->orderBy('created_at', 'desc')->paginate(20);

        // Lazy cleanup of expired blocks
        $now = Carbon::now();
        foreach ($artists as $artist) {
            if ($artist->authBlock && isset($artist->authBlock['blockedUntil'])) {
                if (Carbon::parse($artist->authBlock['blockedUntil'])->isPast()) {
                    $artist->authBlock = null;
                    $artist->save();
                }
            }
        }

        return response()->json([
            'message' => 'Artists retrieved successfully',
            'artists' => $artists
        ]);
    }

    public function show($id)
    {
        $artist = User::where('_id', $id)->where('role', 'artist')->first();
        if (!$artist) return response()->json(['message' => 'Artist not found'], 404);

        return response()->json([
            'message' => 'Artist retrieved successfully',
            'artist' => $artist
        ]);
    }

    // Concept: Using authBlock to suspend an artist, similar to User blocking.
    // Real implementation might have an `is_approved` boolean field in the future.
    public function approve(Request $request, $id)
    {
        // Approve unblocks them
        $admin = $request->get('admin');
        $artist = User::where('_id', $id)->where('role', 'artist')->first();
        if (!$artist) return response()->json(['message' => 'Artist not found'], 404);

        $artist->authBlock = null;
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

        $artist->authBlock = [
            'blockedUntil' => Carbon::now()->addYears(100),
            'reason' => 'Suspended by Administrator'
        ];
        $artist->save();

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
