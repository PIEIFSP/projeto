<?php
// database/migrations/2025_10_28_000001_create_clientes_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('clientes', function (Blueprint $table) {
            $table->id('ID_Cliente');
            $table->string('Nome', 100);
            $table->string('Telefone', 20)->nullable();
            $table->timestamps();
        });
    }
    public function down(): void {
        Schema::dropIfExists('clientes');
    }
};
