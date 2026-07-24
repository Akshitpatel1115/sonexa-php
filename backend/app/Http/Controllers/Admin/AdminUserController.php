<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\AuditLog;
use Carbon\Carbon;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::where('role', 'user');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('username', 'like', "%{$search}%");
        }

        $users = $query->orderBy('created_at', 'desc')->paginate(20);

        // Lazy cleanup of expired blocks
        $now = Carbon::now();
        foreach ($users as $user) {
            if ($user->authBlock && isset($user->authBlock['blockedUntil'])) {
                if (Carbon::parse($user->authBlock['blockedUntil'])->isPast()) {
                    $user->authBlock = null;
                    $user->save();
                }
            }
        }

        return response()->json([
            'message' => 'Users retrieved successfully',
            'users' => $users
        ]);
    }

    public function show($id)
    {
        $user = User::where('_id', $id)->where('role', 'user')->first();
        if (!$user) return response()->json(['message' => 'User not found'], 404);

        return response()->json([
            'message' => 'User retrieved successfully',
            'user' => $user
        ]);
    }

    public function block(Request $request, $id)
    {
        $admin = $request->get('admin');
        $user = User::where('_id', $id)->where('role', 'user')->first();
        if (!$user) return response()->json(['message' => 'User not found'], 404);

        // Permanent block for admin
        $user->authBlock = [
            'blockedUntil' => Carbon::now()->addYears(100),
            'reason' => 'Blocked by Administrator'
        ];
        $user->save();

        AuditLog::create([
            'admin_id' => $admin->_id,
            'action' => 'USER_BLOCK',
            'target_resource' => 'User: ' . $user->_id,
            'ip_address' => $request->ip()
        ]);

        return response()->json(['message' => 'User blocked successfully']);
    }

    public function unblock(Request $request, $id)
    {
        $admin = $request->get('admin');
        $user = User::where('_id', $id)->where('role', 'user')->first();
        if (!$user) return response()->json(['message' => 'User not found'], 404);

        $user->authBlock = null;
        $user->save();

        AuditLog::create([
            'admin_id' => $admin->_id,
            'action' => 'USER_UNBLOCK',
            'target_resource' => 'User: ' . $user->_id,
            'ip_address' => $request->ip()
        ]);

        return response()->json(['message' => 'User unblocked successfully']);
    }

    public function destroy(Request $request, $id)
    {
        $admin = $request->get('admin');
        $user = User::where('_id', $id)->where('role', 'user')->first();
        if (!$user) return response()->json(['message' => 'User not found'], 404);

        $user->delete();

        AuditLog::create([
            'admin_id' => $admin->_id,
            'action' => 'USER_DELETE',
            'target_resource' => 'User: ' . $id,
            'ip_address' => $request->ip()
        ]);

        return response()->json(['message' => 'User deleted successfully']);
    }
}
