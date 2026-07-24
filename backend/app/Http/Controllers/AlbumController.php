<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use App\Models\Album;
use App\Models\Music;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class AlbumController extends Controller
{
    public function createAlbum(Request $request)
    {
        $request->validate(['title' => 'required|string', 'musics' => 'required|array']);
        try {
            $user = Auth::user() ?? $request->user;
            
            // Validate all tracks belong to artist
            $validTracks = Music::whereIn('_id', $request->musics)->where('artist', (string)$user->_id)->count();
            if ($validTracks !== count($request->musics)) {
                return response()->json([
                    'message' => 'Validation failed: You can only add tracks that you have published.'
                ], 403);
            }

            $album = Album::create([
                'title' => $request->title,
                'musics' => $request->musics,
                'artist' => (string)$user->_id
            ]);
            
            return response()->json([
                'message' => 'Album created successfully.', 
                'album' => [
                    'id' => $album->_id,
                    'title' => $album->title,
                    'musics' => $album->musics,
                    'artist' => $album->artist
                ]
            ], 201);
        } catch (\Exception $e) { return response()->json(['message' => 'Internal Server Error', 'error' => $e->getMessage()], 500); }
    }

    public function getAllAlbums()
    {
        try { 
            $albums = Album::with('artistRef:username,email')->get();
            $albums = $albums->map(function ($album) {
                $album->artist = $album->artistRef;
                unset($album->artistRef);
                return $album;
            });
            return response()->json(['message' => 'Albums fetch successfuly.', 'albums' => $albums], 200); 
        } catch (\Exception $e) { return response()->json(['message' => 'Internal Server Error'], 500); }
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
        $request->validate(['title' => 'sometimes|string', 'musics' => 'sometimes|array']);
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

            $album->delete();
            
            return response()->json(['message' => 'Album deleted successfully.'], 200);
        } catch (\Exception $e) { return response()->json(['message' => 'Internal Server Error'], 500); }
    }
}
