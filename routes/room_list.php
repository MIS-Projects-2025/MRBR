<?php

use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\AuthMiddleware;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\RoomList\RoomListController;
use App\Http\Controllers\RoomList\ScheduleListController;

$app_name = env('APP_NAME', '');

Route::redirect('/', "/$app_name");

Route::prefix($app_name)->middleware(AuthMiddleware::class)->group(function () {

  Route::middleware(AdminMiddleware::class)->group(function () {
    Route::get("/room-list", [RoomListController::class, 'index'])->name('room.list.index');
    Route::post("/room-list-store", [RoomListController::class, 'store'])->name('room.list.store');
    Route::post("/room-list-update/{id}", [RoomListController::class, 'update'])->name('room.list.update');
    Route::delete("/room-list-destroy/{id}", [RoomListController::class, 'destroy'])->name('room.list.destroy');

    Route::get("/schedule-list", [ScheduleListController::class, 'index'])->name('schedule.list.index');
    Route::post("/schedule-list-store", [ScheduleListController::class, 'store'])->name('schedule.list.store');
    Route::put("/schedule-list-update/{id}", [ScheduleListController::class, 'update'])->name('schedule.list.update');
    Route::delete("/schedule-list-destroy/{id}", [ScheduleListController::class, 'destroy'])->name('schedule.list.destroy');
  });
});
