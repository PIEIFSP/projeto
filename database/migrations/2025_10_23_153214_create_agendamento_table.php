<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Executa as migrações.
     */
    public function up(): void
    {
        Schema::create('agendamentos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // funcionário responsável
            $table->string('nome_cliente');
            $table->string('servico'); // serviço a ser realizado
            $table->decimal('valor_pago', 10, 2)->nullable(); // valor pago
            $table->dateTime('inicio'); // início do agendamento
            $table->dateTime('fim');    // fim do agendamento
            $table->enum('status', ['agendado', 'concluido', 'cancelado'])->default('agendado');
            $table->timestamps();
        });
    }

    /**
     * Reverte as migrações.
     */
    public function down(): void
    {
        Schema::dropIfExists('agendamentos');
    }
};
