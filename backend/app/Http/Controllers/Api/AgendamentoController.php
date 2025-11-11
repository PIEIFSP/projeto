<?php
// app/Http/Controllers/Api/AgendamentoController.php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Agendamento;
use App\Models\Cliente;
use App\Models\Servico;
use App\Models\TransacaoFinanceira;
use Illuminate\Http\Request;

class AgendamentoController extends Controller {

    public function index(Request $request) {
        $query = Agendamento::with(['cliente', 'servico', 'usuario']);
        if ($request->has('usuario')) $query->where('ID_Usuario_FK', $request->usuario);
        if ($request->has('data')) $query->whereDate('Data_Hora_Inicio', $request->data);

        $agendamentos = $query->get();

        $agendamentosMapeados = $agendamentos->map(function ($agendamento) {

            return [
                'id_agendamento' => $agendamento->ID_Agendamento,
                'id_cliente' => $agendamento->ID_Cliente_FK,
                'id_usuario' => $agendamento->ID_Usuario_FK,
                'id_servico' => $agendamento->ID_Servico_FK,
                'data_hora_inicio' => $agendamento->Data_Hora_Inicio,
                'data_hora_fim' => $agendamento->Data_Hora_Fim,
                'status' => $agendamento->Status,
                'observacoes' => $agendamento->Observacao,
            ];
        });

        // 4. Retorne o novo array mapeado como JSON
        return response()->json($agendamentosMapeados);
    }

    public function store(Request $request) {
        $data = $request->validate([
            'ID_Usuario_FK'=>'required|exists:users,id',
            'ID_Cliente_FK'=>'required|exists:clientes,ID_Cliente',
            'ID_Servico_FK'=>'required|exists:servicos,ID_Servico',
            'Data_Hora_Inicio'=>'required|date'
        ]);
        $servico = Servico::findOrFail($data['ID_Servico_FK']);
        $inicio = new \DateTime($data['Data_Hora_Inicio']);
        $fim = (clone $inicio)->modify("+{$servico->Duracao_Minutos} minutes");

        // Verifica disponibilidade
        $conflito = Agendamento::where('ID_Usuario_FK', $data['ID_Usuario_FK'])
            ->where(function($q) use ($inicio, $fim) {
                $q->whereBetween('Data_Hora_Inicio', [$inicio, $fim])
                  ->orWhereBetween('Data_Hora_Fim', [$inicio, $fim]);
            })->exists();

        if ($conflito) return response()->json(['error'=>'Horário indisponível'], 409);

        $agendamento = Agendamento::create([
            ...$data,
            'Data_Hora_Fim'=>$fim,
            'Valor_Pago_Ajustado'=>$servico->Valor
        ]);
        return response()->json($agendamento, 201);
    }
    public function buscarPorCliente($id)
{
    // Busca o cliente pelo id
    $cliente = Cliente::find($id);

    if (!$cliente) {
        return response()->json(['message' => 'Cliente não encontrado.'], 404);
    }

    // Busca os agendamentos vinculados a esse cliente
    $agendamentos = Agendamento::where('ID_Cliente_FK', $cliente->ID_Cliente)
        ->with(['cliente', 'servico', 'usuario']) // se tiver relacionamentos configurados
        ->get();

    if ($agendamentos->isEmpty()) {
        return response()->json(['message' => 'Nenhum agendamento encontrado para este cliente.'], 404);
    }

    return response()->json($agendamentos);
}

   public function update(Request $request, $id)
{
    $validated = $request->validate([
        'ID_Usuario_FK' => 'required|exists:users,id',
        'ID_Cliente_FK' => 'required|exists:clientes,ID_Cliente',
        'ID_Servico_FK' => 'required|exists:servicos,ID_Servico',
        'Valor_Pago_Ajustado' => 'nullable|numeric',
        'Data_Hora_Inicio' => 'required|date',
        'Data_Hora_Fim' => 'required|date|after:Data_Hora_Inicio',
        'Status' => 'required|string',
        'Observacao' => 'nullable|string',
    ]);

    $agendamento = Agendamento::findOrFail($id);
    $agendamento->update($validated);

    return response()->json([
        'message' => 'Agendamento atualizado com sucesso!',
        'data' => $agendamento
    ]);
}


    public function concluir($id) {
        $agendamento = Agendamento::findOrFail($id);
        $agendamento->update(['Status'=>'Confirmado','Data_Registro_Pagamento'=>now()]);
        TransacaoFinanceira::create([
            'ID_Agendamento_FK'=>$agendamento->ID_Agendamento,
            'Tipo'=>'Receita',
            'Data'=>now(),
            'Valor'=>$agendamento->Valor_Pago_Ajustado,
            'Descricao'=>"Serviço {$agendamento->servico->Nome}",
            'Categoria'=>'Serviços'
        ]);
        return response()->json(['message'=>'Serviço concluído e registrado no financeiro']);
    }
}
