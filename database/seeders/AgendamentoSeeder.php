<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Agendamento;
use App\Models\User;
use Carbon\Carbon;

class AgendamentoSeeder extends Seeder
{
    public function run(): void
    {
        $usuarios = User::all(); // todos os usuários são funcionários

        foreach ($usuarios as $usuario) {
            Agendamento::create([
                'user_id' => $usuario->id,
                'nome_cliente' => 'Cliente Teste 1',
                'servico' => 'Corte de cabelo',
                'inicio' => Carbon::now()->addDay()->setHour(9)->setMinute(0),
                'fim' => Carbon::now()->addDay()->setHour(10)->setMinute(0),
                'valor_pago' => null,
            ]);

            Agendamento::create([
                'user_id' => $usuario->id,
                'nome_cliente' => 'Cliente Teste 2',
                'servico' => 'Manicure',
                'inicio' => Carbon::now()->addDay()->setHour(10)->setMinute(30),
                'fim' => Carbon::now()->addDay()->setHour(11)->setMinute(30),
                'valor_pago' => null,
            ]);
        }
    }
}
