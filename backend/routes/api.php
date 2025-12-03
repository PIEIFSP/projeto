<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\ServicoController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ClienteController;
use App\Http\Controllers\Api\AgendamentoController;

Route::get('/health', function () {
    return 'ok';
});

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/{user}', [UserController::class, 'show']);
    Route::get('/profissionais', [UserController::class, 'index']);

    Route::apiResource('clientes', ClienteController::class)->only(['index','store']);

    Route::get('/agendamentos', [AgendamentoController::class, 'index']);
    Route::get('/agendamentos/cliente/{id}', [AgendamentoController::class, 'buscarPorCliente']);
    Route::post('/agendamentos', [AgendamentoController::class, 'store']);
    Route::post('/agendamentos/{id}', [AgendamentoController::class, 'update']);
    Route::post('/agendamentos/{id}/cancelar', [AgendamentoController::class, 'cancelar']);
    Route::post('/agendamentos/{id}/concluir', [AgendamentoController::class, 'concluir']);

    Route::get('/servicos', [ServicoController::class, 'index']);

    Route::get('/clientes', [ClienteController::class, 'index']);
});
