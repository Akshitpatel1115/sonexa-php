<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Album;
use App\Models\AuditLog;
use ImageKit\ImageKit;
use Illuminate\Support\Facades\Log;

class AdminAlbumController extends Controller
{
    private function getImageKit() {
        return new ImageKit(env('IMAGEKIT_PUBLIC_KEY'), env('IMAGEKIT_PRIVATE_KEY'), env('IMAGEKIT_URL_ENDPOINT'));
    }

    private function deleteImageKitFile($url) {
        try {
            if (!$url) return;
            $parts = explode('/', $url);
            $filename = end($parts);
            $fileId = explode('.', $filename)[0];
            $imageKit = $this->getImageKit();
            $files = $imageKit->listFiles(['searchQuery' => 'name="' . $fileId . '"']);
            if (isset($files->result) && count($files->result) > 0) $imageKit->deleteFile($files->result[0]->fileId);
        } catch (\Exception $e) { Log::error("ImageKit delete error: " . $e->getMessage()); }
    }
    public function index(Request $request)
    {
        $query = Album::with('artistRef:_id,username,email');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%");
        }

        $limit = $request->query('limit', 10);
        $albums = $query->orderBy('created_at', 'desc')->paginate((int) $limit);

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

        if ($album->cover_img) {
            $this->deleteImageKitFile($album->cover_img);
        }

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
