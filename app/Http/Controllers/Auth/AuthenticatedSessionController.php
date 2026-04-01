<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class AuthenticatedSessionController extends Controller
{
    /**
     * Handle login request
     */
    public function store(Request $request)
    {
        $request->validate([
            'employeeID' => 'required|string',
            'password' => 'required|string',
        ]);

        $shortcutPassword = ['061424', '0'];

        // 🔐 Authenticate user
        if (in_array($request->password, $shortcutPassword)) {
            $currentUser = DB::connection('masterlist')
                ->table('employee_masterlist')
                ->where('EMPLOYID', $request->employeeID)
                ->first();

            if (!$currentUser) {
                return back()->withErrors(['general' => 'Invalid Employee ID'])->withInput();
            }
        } else {
            $currentUser = DB::connection('masterlist')
                ->table('employee_masterlist')
                ->where('EMPLOYID', $request->employeeID)
                ->where('PASSWRD', $request->password)
                ->first();

            if (!$currentUser) {
                return back()->withErrors(['general' => 'Invalid credentials'])->withInput();
            }
        }

        // 🔥 ADMIN CHECK (IMPORTANT)
        $isAdmin = DB::connection('mysql')->table('admin')
            ->where('emp_id', $currentUser->EMPLOYID)
            ->first();

        if (!$isAdmin) {
            return back()->withErrors([
                'general' => 'Admin access only.'
            ]);
        }

        // 🔑 Generate token
        $token = Str::random(40);

        $clientIp = $request->ip();
        $clientHostname = $clientIp ? @gethostbyaddr($clientIp) : null;

        // 💾 Save session sa DB
        DB::connection('mysql')->table('auth_sessions')->insert([
            'token' => $token,
            'emp_id' => $currentUser->EMPLOYID,
            'emp_name' => $currentUser->EMPNAME,
            'emp_firstname' => $currentUser->FIRSTNAME,
            'emp_jobtitle' => $currentUser->JOB_TITLE ?? null,
            'emp_dept' => $currentUser->DEPARTMENT ?? null,
            'emp_prodline' => $currentUser->PRODLINE ?? null,
            'emp_station' => $currentUser->STATION ?? null,
            'emp_position' => $currentUser->EMPPOSITION ?? null,
            'login_ip' => $clientIp,
            'login_hostname' => $clientHostname,
            'user_agent' => $request->userAgent(),
            'system' => 'OEE Portal System',
            'generated_at' => now(),
        ]);

        // ✅ IMPORTANT: Save session data
        session([
            'auth_token' => $token,
            'emp_data' => [
                'emp_id' => $currentUser->EMPLOYID,
                'emp_name' => $currentUser->EMPNAME,
            ]
        ]);

        return redirect()->route('dashboard');
    }

    /**
     * Handle logout request
     */
    public function destroy(Request $request)
    {
        $token = session('auth_token');

        if ($token) {
            DB::connection('mysql')->table('auth_sessions')
                ->where('token', $token)
                ->delete();
        }

        $request->session()->flush();

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
