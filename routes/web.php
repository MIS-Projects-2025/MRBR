<?php

use Illuminate\Support\Facades\Route;

// Authentication routes (optional kung gagamit ka pa login)
require __DIR__ . '/auth.php';

// Other routes
require __DIR__ . '/general.php';

// Room routes
require __DIR__ . '/room.php';

// Admin routes
require __DIR__ . '/room_list.php';


/**
 * ✅ Fallback (404)
 */
Route::fallback(function () {
    return redirect()->route('dashboard');
})->name('404');
