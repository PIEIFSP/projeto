<?php
// database/migrations/2025_10_28_000004_create_transacoes_financeiras_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('transacoes_financeiras', function (Blueprint $table) {
            $table->id('ID_Transacao');
            $table->foreignId('ID_Agendamento_FK')->constrained('agendamentos', 'ID_Agendamento')->onDelete('cascade');
            $table->enum('Tipo', ['Receita', 'Despesa']);
            $table->date('Data');
            $table->decimal('Valor', 10, 2);
            $table->string('Descricao', 255)->nullable();
            $table->string('Categoria', 100)->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('transacoes_financeiras');
    }
};
