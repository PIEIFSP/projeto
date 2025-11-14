<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Cliente;

class ClienteSeeder extends Seeder
{
    public function run(): void
    {
        $clientes = [
            ['Nome' => 'Maria Silva', 'Telefone' => '11987654321'],
            ['Nome' => 'João Pereira', 'Telefone' => '11912345678'],
            ['Nome' => 'Ana Souza', 'Telefone' => '11955554444'],
            ['Nome' => 'Carlos Lima', 'Telefone' => '11999998888'],
            ['Nome' => 'Beatriz Santos', 'Telefone' => '11977776666'],
        ];

        foreach ($clientes as $cliente) {
            Cliente::create($cliente);
        }
    }
}
