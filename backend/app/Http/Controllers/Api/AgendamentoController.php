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
        $query->where('Status', '!=', 'Cancelado');
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

    public function store(Request $request)
{
    // Converte o formato do front para o do banco
    $data = [
        'ID_Usuario_FK'    => $request->input('id_usuario'),
        'ID_Cliente_FK'    => $request->input('id_cliente'),
        'ID_Servico_FK'    => $request->input('id_servico'),
        'Data_Hora_Inicio' => $request->input('data_hora_inicio'),
        'Data_Hora_Fim'    => $request->input('data_hora_fim'),
        'Status'           => ucfirst(strtolower($request->input('status', 'Confirmado'))),
    ];

    //  Validação
    $validated = validator($data, [
        'ID_Usuario_FK'    => 'required|exists:users,id',
        'ID_Cliente_FK'    => 'required|exists:clientes,ID_Cliente',
        'ID_Servico_FK'    => 'required|exists:servicos,ID_Servico',
        'Data_Hora_Inicio' => 'required|date',
        'Data_Hora_Fim'    => 'required|date|after:Data_Hora_Inicio',
        'Status'           => 'required|in:Confirmado,Cancelado,Remarcado',
    ])->validate();

    // Converte datas ISO (2025-11-11T00:54:00.000Z → 2025-11-11 00:54:00)
    $validated['Data_Hora_Inicio'] = date('Y-m-d H:i:s', strtotime($validated['Data_Hora_Inicio']));
    $validated['Data_Hora_Fim']    = date('Y-m-d H:i:s', strtotime($validated['Data_Hora_Fim']));

    // Verifica conflito de horário
    $conflito = Agendamento::where('ID_Usuario_FK', $validated['ID_Usuario_FK'])
        ->where(function ($q) use ($validated) {
            $q->whereBetween('Data_Hora_Inicio', [$validated['Data_Hora_Inicio'], $validated['Data_Hora_Fim']])
              ->orWhereBetween('Data_Hora_Fim', [$validated['Data_Hora_Inicio'], $validated['Data_Hora_Fim']]);
        })
        ->exists();

    if ($conflito) {
        return response()->json(['error' => 'Horário indisponível'], 409);
    }

    //  Cria o agendamento
    $agendamento = Agendamento::create($validated);

    return response()->json([
        'message' => 'Agendamento criado com sucesso!',
        'data' => [
            'id_agendamento'   => $agendamento->ID_Agendamento,
            'id_cliente'       => $agendamento->ID_Cliente_FK,
            'id_usuario'       => $agendamento->ID_Usuario_FK,
            'id_servico'       => $agendamento->ID_Servico_FK,
            'data_hora_inicio' => $agendamento->Data_Hora_Inicio,
            'data_hora_fim'    => $agendamento->Data_Hora_Fim,
            'status'           => $agendamento->Status,
            'observacoes'      => $agendamento->Observacao,
        ]
    ], 201);
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
public function cancelar($id)
    {
        $agendamento = Agendamento::find($id);

        if (!$agendamento) {
            return response()->json(['message' => 'Agendamento não encontrado.'], 404);
        }

        if ($agendamento->Status === 'Cancelado') {
            return response()->json(['message' => 'Este agendamento já está cancelado.'], 400);
        }

        $agendamento->update(['Status' => 'Cancelado']);

        return response()->json([
            'message' => 'Agendamento cancelado com sucesso!',
            'data' => $agendamento
        ]);
    }


   public function update(Request $request, $id)
{
    // Converte os campos do front para os campos do banco
    $data = [
        'ID_Usuario_FK'    => $request->input('id_usuario'),
        'ID_Cliente_FK'    => $request->input('id_cliente'),
        'ID_Servico_FK'    => $request->input('id_servico'),
        'Data_Hora_Inicio' => $request->input('data_hora_inicio'),
        'Data_Hora_Fim'    => $request->input('data_hora_fim'),
        'Status'           => $request->input('status'),
        'Observacao'       => $request->input('observacoes'),
        'Valor_Pago_Ajustado' => $request->input('valor_pago_ajustado'),
    ];

    // Valida os campos já convertidos
    $validated = validator($data, [
        'ID_Usuario_FK' => 'required|exists:users,id',
        'ID_Cliente_FK' => 'required|exists:clientes,ID_Cliente',
        'ID_Servico_FK' => 'required|exists:servicos,ID_Servico',
        'Data_Hora_Inicio' => 'required|date',
        'Data_Hora_Fim' => 'required|date|after:Data_Hora_Inicio',
        'Status' => 'required|string',
        'Observacao' => 'nullable|string',
        'Valor_Pago_Ajustado' => 'nullable|numeric',
    ])->validate();

    // Ajuste de datas
    $validated['Data_Hora_Inicio'] = date('Y-m-d H:i:s', strtotime($validated['Data_Hora_Inicio']));
    $validated['Data_Hora_Fim']    = date('Y-m-d H:i:s', strtotime($validated['Data_Hora_Fim']));

    // Atualização
    $agendamento = Agendamento::findOrFail($id);
    $agendamento->update($validated);

    return response()->json([
        'message' => 'Agendamento atualizado com sucesso!',
        'data' => $agendamento
    ]);
}



    public function concluir($id) {
        $agendamento = Agendamento::findOrFail($id);

         if ($agendamento->Status === 'Cancelado') {
            return response()->json([
                'message' => 'Não é possível concluir um agendamento cancelado.'
            ], 400);
        }
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
