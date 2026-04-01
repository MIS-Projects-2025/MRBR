<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuthTokenMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $token = session('auth_token');

        // ❌ walang token → redirect sa root
        if (!$token) {
            return redirect('/');
        }

        $session = DB::connection('mysql')->table('auth_sessions')
            ->where('token', $token)
            ->first();

        // ❌ invalid token → clear + redirect
        if (!$session) {
            $request->session()->flush();
            return redirect('/');
        }

        return $next($request);
    }
}
