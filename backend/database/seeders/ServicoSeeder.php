<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Servico;

class ServicoSeeder extends Seeder
{
    public function run(): void
    {
        $servicos = [
            [
                'Nome' => 'Corte de Cabelo',
                'Valor' => 50.00,
                'Duracao_Minutos' => 30,
            ],
            [
                'Nome' => 'Barba',
                'Valor' => 30.00,
                'Duracao_Minutos' => 20,
            ],
            [
                'Nome' => 'Hidratação Capilar',
                'Valor' => 70.00,
                'Duracao_Minutos' => 45,
            ],
            [
                'Nome' => 'Luzes e Tintura',
                'Valor' => 120.00,
                'Duracao_Minutos' => 90,
            ],
            [
                'Nome' => 'Sobrancelha',
                'Valor' => 25.00,
                'Duracao_Minutos' => 15,
            ],
        ];

        foreach ($servicos as $servico) {
            Servico::create($servico);
        }
    }
}
