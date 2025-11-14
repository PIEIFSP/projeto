<?php
// database/migrations/2025_10_28_000002_create_servicos_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('servicos', function (Blueprint $table) {
            $table->id('ID_Servico');
            $table->string('Nome', 100);
            $table->decimal('Valor', 10, 2);
            $table->integer('Duracao_Minutos');
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('servicos');
    }
};
