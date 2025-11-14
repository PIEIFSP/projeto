<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Agendamento;
use App\Models\Cliente;
use App\Models\User;
use App\Models\Servico;

class AgendamentoSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::first(); // usa o usuário de teste
        $clientes = Cliente::all();
        $servicos = Servico::all(); // assume que os serviços já existem

        $agendamentos = [
            [
                'ID_Cliente_FK' => $clientes[0]->ID_Cliente,
                'ID_Servico_FK' => $servicos[0]->ID_Servico,
                'Data_Hora_Inicio' => '2025-11-01 10:00:00',
                'Data_Hora_Fim' => '2025-11-01 10:30:00',
                'Valor_Pago_Ajustado' => 50.00,
                'Status' => 'Confirmado',
                'Observacao' => 'Cliente prefere atendimento rápido',
            ],
            [
                'ID_Cliente_FK' => $clientes[1]->ID_Cliente,
                'ID_Servico_FK' => $servicos[1]->ID_Servico,
                'Data_Hora_Inicio' => '2025-11-01 11:00:00',
                'Data_Hora_Fim' => '2025-11-01 11:45:00',
                'Valor_Pago_Ajustado' => 70.00,
                'Status' => 'Confirmado',
                'Observacao' => null,
            ],
            [
                'ID_Cliente_FK' => $clientes[2]->ID_Cliente,
                'ID_Servico_FK' => $servicos[2]->ID_Servico,
                'Data_Hora_Inicio' => '2025-11-01 12:00:00',
                'Data_Hora_Fim' => '2025-11-01 12:40:00',
                'Valor_Pago_Ajustado' => 30.00,
                'Status' => 'Remarcado',
                'Observacao' => 'Cliente pediu remarcação',
            ],
        ];

        foreach ($agendamentos as $ag) {
            Agendamento::create(array_merge($ag, ['ID_Usuario_FK' => $user->id]));
        }
    }
}
