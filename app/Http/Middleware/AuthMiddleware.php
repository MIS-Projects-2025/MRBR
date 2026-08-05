<?php

namespace App\Http\Middleware;

use Carbon\Carbon;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class AuthMiddleware
{
    /**
     * Idle session timeout in minutes.
     * Configurable via env SESSION_IDLE_TIMEOUT, defaults to 480 (8 hours).
     */
    protected int $idleTimeoutMinutes;

    public function __construct()
    {
        $this->idleTimeoutMinutes = (int) env('SESSION_IDLE_TIMEOUT', 480);
    }

    public function handle(Request $request, Closure $next): Response
    {
        $token = session('auth_token');

        if (! $token) {
            return redirect()->route('login');
        }

        // Check if session exists in DB
        $session = DB::connection('mysql')->table('auth_sessions')
            ->where('token', $token)
            ->first();

        if (! $session) {
            session()->forget('auth_token');
            session()->forget('emp_data');

            return redirect()->route('login');
        }

        // 🔒 IDLE SESSION TIMEOUT — if last activity exceeds threshold, expire session
        $lastActivity = $session->generated_at
            ? Carbon::parse($session->generated_at)
            : Carbon::now();

        if ($lastActivity->lt(Carbon::now()->subMinutes($this->idleTimeoutMinutes))) {
            // Expire the token in DB and clear session
            DB::connection('mysql')->table('auth_sessions')
                ->where('token', $token)
                ->delete();

            session()->forget('auth_token');
            session()->forget('emp_data');

            return redirect()->route('login')
                ->with('error', 'Your session has expired. Please log in again.');
        }

        // Refresh the last-activity timestamp on the session (rolling timeout)
        DB::connection('mysql')->table('auth_sessions')
            ->where('token', $token)
            ->update(['generated_at' => now()]);

        // Get role from admin table
        $adminData = DB::connection('mysql')->table('admin')
            ->where('emp_id', $session->emp_id)
            ->first();

        // Merge admin role with session data
        $empData = (array) $session;
        $empData['emp_role'] = $adminData->emp_role ?? null;

        // Save to session
        session(['emp_data' => $empData]);

        // Role-based access check
        $role = $empData['emp_role'];
        $empId = $empData['emp_id'];

        // if (
        //     session('emp_data') &&
        //     !in_array(session('emp_data')['emp_dept'], ['Equipment Engineering']) &&
        //     !in_array(session('emp_data')['emp_role'], ['admin', 'superadmin'])
        // ) {
        //     // User is not authorized
        //     session()->forget('auth_token');
        //     session()->forget('emp_data');

        //     return redirect()->route('unauthorized');
        // }

        return $next($request);
    }
}
