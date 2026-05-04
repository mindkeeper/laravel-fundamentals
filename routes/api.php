<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ResourceController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;



Route::prefix('v1')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    })->middleware('auth:sanctum');

    Route::post('/login', [AuthController::class, 'login']);
    Route::get('/resources',[ResourceController::class, 'index']);
    Route::get('/resources/{id}',[ResourceController::class, 'show']);
     Route::middleware('auth:sanctum')->group(function () {
        Route::post('/resources', [ResourceController::class, 'store']);
        Route::put('/resources/{resource}', [ResourceController::class, 'update']);
        Route::delete('/resources/{resource}', [ResourceController::class, 'destroy']);
    });
});
