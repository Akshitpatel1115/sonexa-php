<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\AuditLog;
use App\Models\AuthSecurity;
use Carbon\Carbon;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = User::with('authSecurity')->where('role', 'user');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where('username', 'like', "%{$search}%");
        }

        $limit = $request->query('limit', 10);
        $users = $query->orderBy('created_at', 'desc')->paginate((int) $limit);

        // Map authBlock back for frontend compatibility
        foreach ($users as $user) {
            if ($user->authSecurity && $user->authSecurity->auth_block_until) {
                if (Carbon::parse($user->authSecurity->auth_block_until)->isPast()) {
                    $user->authSecurity->auth_block_until = null;
                    $user->authSecurity->save();
                    $user->authBlock = null;
                } else {
                    $user->authBlock = [
                        'blockedUntil' => $user->authSecurity->auth_block_until
                    ];
                }
            } else {
                $user->authBlock = null;
            }
        }

        return response()->json([
            'message' => 'Users retrieved successfully',
            'users' => $users
        ]);
    }

    public function show($id)
    {
        $user = User::with('authSecurity')->where('_id', $id)->where('role', 'user')->first();
        if (!$user) return response()->json(['message' => 'User not found'], 404);

        if ($user->authSecurity && $user->authSecurity->auth_block_until && Carbon::parse($user->authSecurity->auth_block_until)->isFuture()) {
            $user->authBlock = [
                'blockedUntil' => $user->authSecurity->auth_block_until
            ];
        } else {
            $user->authBlock = null;
        }

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

        $security = AuthSecurity::firstOrCreate(['user_id' => $user->_id], ['username' => $user->username]);
        $security->auth_block_until = Carbon::now()->addYears(100);
        $security->save();

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

        $security = AuthSecurity::where('user_id', $user->_id)->first();
        if ($security) {
            $security->auth_block_until = null;
            $security->save();
        }

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

        // Delete related models manually just in case
        AuthSecurity::where('user_id', $user->_id)->delete();
        \App\Models\EmailOtp::where('user_id', $user->_id)->delete();

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
