<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Music;
use App\Models\Album;
use App\Models\AuditLog;
use ImageKit\ImageKit;

class AdminMusicController extends Controller
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
        } catch (\Exception $e) { \Illuminate\Support\Facades\Log::error("ImageKit delete error: " . $e->getMessage()); }
    }

    public function index(Request $request)
    {
        $query = Music::with('artistRef:_id,username,email');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('title', 'like', "%{$search}%");
        }

        $limit = $request->query('limit', 10);
        $musics = $query->orderBy('created_at', 'desc')->paginate((int) $limit);

        return response()->json([
            'message' => 'Music retrieved successfully',
            'musics' => $musics
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $admin = $request->get('admin');
        $music = Music::find($id);
        
        if (!$music) return response()->json(['message' => 'Music not found'], 404);

        // Cascading deletion
        $albums = Album::where('musics', $id)->get();
        foreach($albums as $album) {
            $musicsArray = $album->musics ?? [];
            $musicsArray = array_values(array_diff($musicsArray, [$id]));
            if (empty($musicsArray)) {
                $album->delete();
            } else {
                $album->musics = $musicsArray;
                $album->save();
            }
        }

        $this->deleteImageKitFile($music->uri);
        $music->delete();

        AuditLog::create([
            'admin_id' => $admin->_id,
            'action' => 'MUSIC_DELETE',
            'target_resource' => 'Music: ' . $id,
            'ip_address' => $request->ip()
        ]);

        return response()->json(['message' => 'Music deleted successfully']);
    }
}
