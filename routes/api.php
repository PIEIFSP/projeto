<?php
use App\Http\Controllers\Api\AgendamentoController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::get('/health', function () {
    return 'ok';
});

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user/{user}', [UserController::class, 'show']);
    Route::post('/agendamentos', [AgendamentoController::class, 'criar']);
    Route::post('/agendamentos/{agendamento}/cancelar', [AgendamentoController::class, 'cancelar']);
    Route::post('/agendamentos/{agendamento}/remarcar', [AgendamentoController::class, 'remarcar']);
    Route::get('/agendamentos/agenda/{user}', [AgendamentoController::class, 'agenda']);
    Route::post('/agendamentos/{agendamento}/entrada', [AgendamentoController::class, 'registrarEntrada']);
});




