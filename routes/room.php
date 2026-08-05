<?php

use App\Http\Controllers\BookNowController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\RoomController;
use App\Http\Controllers\ReservationController;
use App\Http\Middleware\AuthMiddleware;


/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES (NO LOGIN REQUIRED)
|--------------------------------------------------------------------------
*/

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
Route::post('/reservations-store-bulk', [RoomController::class, 'storeBulk']);

Route::delete('/reservations-delete/{id}', [RoomController::class, 'destroy']);

Route::post('/reservations-cancel', [ReservationController::class, 'cancel']);

Route::post('/reservations-update/{id}', [ReservationController::class, 'updateDate']);



Route::get('/rooms/booknow', [BookNowController::class, 'index'])->name('rooms.booknow.index');

Route::delete('/reservation-delete', [BookNowController::class, 'destroy']);

Route::post('/reservation-update', [BookNowController::class, 'updateReservation']);

Route::get('/maintenance', function () {
  return Inertia::render('maintenance');
})->name('maintenance');
