<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!session('emp_data')) {
            return redirect('/');
        }

        $exists = DB::connection('mysql')->table('admin')
            ->where('emp_id', session('emp_data')['emp_id'])
            ->exists();

        if (!$exists) {
            return redirect('/');
        }

        return $next($request);
    }
}
