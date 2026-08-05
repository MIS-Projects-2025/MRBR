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
        if (! session('emp_data')) {
            return redirect('/');
        }

        $empData = session('emp_data');

        // 🔒 ROLE-BASED ADMIN CHECK
        // Verify the user is present in the admin table AND has a valid admin role.
        // This prevents stale/legacy admin records (with null/other roles) from
        // retaining admin access.
        $admin = DB::connection('mysql')
            ->table('admin')
            ->where('emp_id', $empData['emp_id'])
            ->first();

        $validRoles = ['admin', 'superadmin'];

        if (! $admin || ! in_array($admin->emp_role, $validRoles, true)) {
            return redirect('/');
        }

        return $next($request);
    }
}
