<?php

use App\Http\Controllers\Resources\ResourceDataController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::prefix('resources')->group(function () {
        Route::get('/', function () {
            return Inertia::render('resources/index');
        })->name('resources');

        Route::get('/data/list', [ResourceDataController::class, 'index'])->name('resources.data');
        Route::post('/data', [ResourceDataController::class, 'store'])->name('resources.data.store');
        Route::get('/data/{resource}', [ResourceDataController::class, 'show'])->name('resources.data.show');
        Route::put('/data/{resource}', [ResourceDataController::class, 'update'])->name('resources.data.update');
        Route::delete('/data/{resource}', [ResourceDataController::class, 'destroy'])->name('resources.data.destroy');

        Route::get('/create', function () {
            return Inertia::render('resources/create');
        })->name('resources.create');

        Route::get('/{id}', function ($id) {
            return Inertia::render('resources/show', [
                'id' => $id,
            ]);
        })->name('resources.show');

        Route::get('/{id}/edit', function ($id) {
            return Inertia::render('resources/edit', [
                'id' => $id,
            ]);
        })->name('resources.edit');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
