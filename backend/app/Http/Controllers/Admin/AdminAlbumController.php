<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Album;
use App\Models\AuditLog;

class AdminAlbumController extends Controller
{
    public function index(Request $request)
    {
        $query = Album::with('artistRef:_id,username,email');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%");
        }

        $albums = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'message' => 'Albums retrieved successfully',
            'albums' => $albums
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $admin = $request->get('admin');
        $album = Album::find($id);
        
        if (!$album) return response()->json(['message' => 'Album not found'], 404);

        $album->delete();

        AuditLog::create([
            'admin_id' => $admin->_id,
            'action' => 'ALBUM_DELETE',
            'target_resource' => 'Album: ' . $id,
            'ip_address' => $request->ip()
        ]);

        return response()->json(['message' => 'Album deleted successfully']);
    }
}
