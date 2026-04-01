<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\ReservationController;

/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES (NO LOGIN REQUIRED)
|--------------------------------------------------------------------------
*/

// Home → redirect to rooms
Route::get('/', function () {
  return redirect()->route('rooms.index');
});

// Rooms list (cards)
Route::get('/rooms/list', [RoomController::class, 'index'])
  ->name('rooms.index');

// Room calendar view
Route::get('/room/{id}', [RoomController::class, 'show'])
  ->name('rooms.show');

// Book reservation
Route::post('/reservations', [ReservationController::class, 'store'])
  ->name('reservations.store');

// Check availability (optional)
Route::get('/reservations/check', [ReservationController::class, 'check'])
  ->name('reservations.check');

Route::post('/reservations-store', [RoomController::class, 'store']);

Route::delete('/reservations-delete/{id}', [RoomController::class, 'destroy']);
