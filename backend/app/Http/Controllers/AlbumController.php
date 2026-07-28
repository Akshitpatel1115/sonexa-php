<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Album;
use App\Models\Music;
use ImageKit\ImageKit;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class AlbumController extends Controller
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

    public function createAlbum(Request $request)
    {
        $request->validate([
            'title' => 'required|string', 
            'musics' => 'required|array', 
            'cover_img' => 'nullable|file|image|max:500'
        ]);
        try {
            $user = Auth::user() ?? $request->user;
            
            // Validate all tracks belong to artist
            $validTracks = Music::whereIn('_id', $request->musics)->where('artist', (string)$user->_id)->count();
            if ($validTracks !== count($request->musics)) {
                return response()->json([
                    'message' => 'Validation failed: You can only add tracks that you have published.'
                ], 403);
            }

            $coverUrl = null;
            if ($request->hasFile('cover_img')) {
                $coverUpload = $this->getImageKit()->uploadFile([
                    'file' => base64_encode(file_get_contents($request->file('cover_img')->path())),
                    'fileName' => time() . '_album_cover_' . $request->file('cover_img')->getClientOriginalName(),
                    'folder' => '/covers'
                ]);
                $coverUrl = $coverUpload->result->url;
            }

            $album = Album::create([
                'title' => $request->title,
                'musics' => $request->musics,
                'cover_img' => $coverUrl,
                'artist' => (string)$user->_id
            ]);
            
            return response()->json([
                'message' => 'Album created successfully.', 
                'album' => [
                    'id' => $album->_id,
                    'title' => $album->title,
                    'cover_img' => $album->cover_img,
                    'musics' => $album->musics,
                    'artist' => $album->artist
                ]
            ], 201);
        } catch (\Exception $e) { return response()->json(['message' => 'Internal Server Error', 'error' => $e->getMessage()], 500); }
    }

    public function getAllAlbums(Request $request)
    {
        try { 
            $limit = $request->query('limit', 20);
            $albums = Album::with('artistRef:username,email')
                ->select('_id', 'title', 'cover_img', 'musics', 'artist', 'created_at')
                ->orderBy('created_at', 'desc')
                ->paginate((int) $limit);

            $albums->getCollection()->transform(function ($album) {
                $album->artist = $album->artistRef;
                unset($album->artistRef);
                return $album;
            });

            return response()->json(['message' => 'Albums fetch successfuly.', 'albums' => $albums], 200); 
        } catch (\Exception $e) { 
            return response()->json(['message' => 'Internal Server Error', 'error' => $e->getMessage()], 500); 
        }
    }

    public function getAlbum($albumId)
    {
        try {
            $album = Album::with('artistRef:username,email')->find($albumId);
            if (!$album) return response()->json(['message' => 'Album not found'], 404);
            
            $album->artist = $album->artistRef;
            unset($album->artistRef);
            
            // Populate musics
            $populatedMusics = Music::whereIn('_id', $album->musics ?? [])->get();
            $album->musics = $populatedMusics;
            
            return response()->json(['message' => 'Albums fetch successfuly.', 'albums' => $album], 200);
        } catch (\Exception $e) { return response()->json(['message' => 'Internal Server Error'], 500); }
    }

    public function updateAlbum(Request $request, $albumId)
    {
        $request->validate([
            'title' => 'sometimes|string', 
            'musics' => 'sometimes|array', 
            'cover_img' => 'nullable|file|image|max:500'
        ]);
        try {
            $user = Auth::user() ?? $request->user;
            $album = Album::find($albumId);
            
            if (!$album) return response()->json(['message' => 'Album not found'], 404);
            
            if ($album->artist !== (string)$user->_id) {
                return response()->json(['message' => 'Unauthorized: You can only update your own albums.'], 403);
            }

            if ($request->has('musics')) {
                // Validate all tracks belong to artist
                $validTracks = Music::whereIn('_id', $request->musics)->where('artist', (string)$user->_id)->count();
                if ($validTracks !== count($request->musics)) {
                    return response()->json([
                        'message' => 'Validation failed: You can only add tracks that you have published.'
                    ], 403);
                }
                $album->musics = $request->musics;
            }

            if ($request->has('title')) {
                $album->title = $request->title;
            }

            if ($request->hasFile('cover_img')) {
                // Delete old cover if exists
                if ($album->cover_img) {
                    $this->deleteImageKitFile($album->cover_img);
                }
                
                $coverUpload = $this->getImageKit()->uploadFile([
                    'file' => base64_encode(file_get_contents($request->file('cover_img')->path())),
                    'fileName' => time() . '_album_cover_' . $request->file('cover_img')->getClientOriginalName(),
                    'folder' => '/covers'
                ]);
                $album->cover_img = $coverUpload->result->url;
            }

            $album->save();
            
            return response()->json([
                'message' => 'Album updated successfully.', 
                'album' => $album
            ], 200);
        } catch (\Exception $e) { return response()->json(['message' => 'Internal Server Error', 'error' => $e->getMessage()], 500); }
    }

    public function deleteAlbum(Request $request, $albumId)
    {
        try {
            $user = Auth::user() ?? $request->user;
            $album = Album::find($albumId);
            
            if (!$album) return response()->json(['message' => 'Album not found'], 404);
            
            if ($album->artist !== (string)$user->_id) {
                return response()->json(['message' => 'Unauthorized: You can only delete your own albums.'], 403);
            }

            if ($album->cover_img) {
                $this->deleteImageKitFile($album->cover_img);
            }

            $album->delete();
            
            return response()->json(['message' => 'Album deleted successfully.'], 200);
        } catch (\Exception $e) { return response()->json(['message' => 'Internal Server Error'], 500); }
    }
}
