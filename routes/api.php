<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\AgendamentoController;

Route::get('/health', function () {
    return 'ok';
});

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/{user}', [UserController::class, 'show']);
    Route::apiResource('clientes', ClienteController::class)->only(['index','store']);
    Route::get('/agendamentos/cliente/{nome}', [AgendamentoController::class, 'buscarPorCliente']);
    Route::post('/agendamentos', [AgendamentoController::class, 'store']);
    Route::put('/agendamentos/{id}', [AgendamentoController::class, 'update']);
    Route::post('/agendamentos/{id}/concluir', [AgendamentoController::class, 'concluir']);
});
