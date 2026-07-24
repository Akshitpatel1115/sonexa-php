<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Music;
use App\Models\Album;
use App\Models\User;

class SearchController extends Controller
{
    public function search(Request $request)
    {
        $q = $request->query('q');
        
        if (!is_string($q)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid query format.'
            ], 400);
        }

        $q = trim($q);

        if (empty($q)) {
            return response()->json([
                'success' => true,
                'query' => $q,
                'results' => [
                    'music' => [],
                    'albums' => [],
                    'artists' => []
                ]
            ], 200); // Empty query returns empty results per requirements
        }

        if (strlen($q) > 100) {
            return response()->json([
                'success' => false,
                'message' => 'Query is too long.'
            ], 400);
        }

        // Escape regex special characters to prevent regex injection
        $safeQuery = preg_quote($q, '/');
        
        // MongoDB regex matching anywhere in the string, case-insensitively
        $regex = '/' . $safeQuery . '/i';

        // Limit results to maintain high performance
        $limit = 10;

        $music = Music::where('title', 'regexp', $regex)
            ->limit($limit)
            ->get();
            
        $albums = Album::where('title', 'regexp', $regex)
            ->limit($limit)
            ->get();
            
        $artists = User::where('role', 'artist')
            ->where('username', 'regexp', $regex)
            ->select('_id', 'username', 'role') // Exclude sensitive info
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'query' => $q,
            'results' => [
                'music' => $music,
                'albums' => $albums,
                'artists' => $artists
            ]
        ], 200);
    }
}
