<?php
// database/migrations/2025_10_28_000003_create_agendamentos_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('agendamentos', function (Blueprint $table) {
            $table->id('ID_Agendamento');
            $table->foreignId('ID_Usuario_FK')->constrained('users', 'id')->onDelete('cascade');
            $table->foreignId('ID_Cliente_FK')->constrained('clientes', 'ID_Cliente')->onDelete('cascade');
            $table->foreignId('ID_Servico_FK')->constrained('servicos', 'ID_Servico')->onDelete('cascade');
            $table->decimal('Valor_Pago_Ajustado', 10, 2)->nullable();
            $table->date('Data_Registro_Pagamento')->nullable();
            $table->dateTime('Data_Hora_Inicio');
            $table->dateTime('Data_Hora_Fim');
            $table->enum('Status', ['Confirmado', 'Cancelado', 'Remarcado'])->default('Confirmado');
            $table->text('Observacao')->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('agendamentos');
    }
};
