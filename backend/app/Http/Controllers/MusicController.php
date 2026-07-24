<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Music;
use ImageKit\ImageKit;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class MusicController extends Controller
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

    public function createMusic(Request $request)
    {
        $request->validate(['title' => 'nullable|string', 'music' => 'required|file']);
        try {
            $user = Auth::user() ?? $request->user;
            $title = $request->title ?: $request->file('music')->getClientOriginalName();
            
            $audioUpload = $this->getImageKit()->uploadFile([
                'file' => base64_encode(file_get_contents($request->file('music')->path())),
                'fileName' => time() . '_' . $request->file('music')->getClientOriginalName(),
                'folder' => '/musics'
            ]);
            
            $music = Music::create([
                'title' => $title,
                'uri' => $audioUpload->result->url,
                'artist' => (string)$user->_id
            ]);
            
            return response()->json([
                'message' => 'Music create successfuly.',
                'music' => [
                    'id' => $music->_id,
                    'uri' => $music->uri,
                    'title' => $music->title,
                    'artist' => $music->artist
                ]
            ], 201);
        } catch (\Exception $e) { 
            return response()->json(['message' => 'Internal Server Error', 'error' => $e->getMessage()], 500); 
        }
    }

    public function getAllMusics()
    {
        try { 
            // In Node it fetched all and populated artist (username email)
            $musics = Music::with('artistRef:username,email')->get();
            // To match exactly, we want "artist" to contain the populated object, but Eloquent puts it in artistRef
            // So we manually map it.
            $musics = $musics->map(function ($music) {
                $music->artist = $music->artistRef;
                unset($music->artistRef);
                return $music;
            });
            
            return response()->json([
                'message' => 'Musics fetched successfuly.', 
                'musics' => $musics
            ], 200); 
        } catch (\Exception $e) { 
            return response()->json(['message' => 'Internal Server Error'], 500); 
        }
    }

    public function deleteMusic($id)
    {
        try {
            $user = Auth::user() ?? request()->user;
            $music = Music::find($id);
            if (!$music) return response()->json(['message' => 'Music not found'], 404);
            if ($music->artist !== (string) $user->_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            
            $albums = \App\Models\Album::where('musics', $id)->get();
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
            return response()->json(['message' => 'Music deleted successfully'], 200);
        } catch (\Exception $e) { return response()->json(['message' => 'Internal Server Error'], 500); }
    }
}
