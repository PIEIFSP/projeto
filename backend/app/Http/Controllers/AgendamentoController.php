<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Agendamento;
use App\Models\User;
use Carbon\Carbon;

class AgendamentoController extends Controller
{
    // Criar agendamento manual
    public function criar(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'nome_cliente' => 'required|string',
            'servico' => 'required|string',
            'inicio' => 'required|date',
            'fim' => 'required|date|after:inicio',
        ]);

        // Verifica disponibilidade do funcionário
        $conflito = Agendamento::where('user_id', $request->user_id)
            ->where(function ($q) use ($request) {
                $q->whereBetween('inicio', [$request->inicio, $request->fim])
                  ->orWhereBetween('fim', [$request->inicio, $request->fim]);
            })
            ->exists();

        if ($conflito) {
            return response()->json(['erro' => 'Horário indisponível'], 400);
        }

        $agendamento = Agendamento::create($request->all());

        return response()->json($agendamento, 201);
    }

    // Cancelar agendamento
    public function cancelar(Agendamento $agendamento)
    {
        $agendamento->status = 'cancelado';
        $agendamento->save();
        return response()->json($agendamento);
    }

    // Remarcar agendamento
    public function remarcar(Request $request, Agendamento $agendamento)
    {
        $request->validate([
            'inicio' => 'required|date',
            'fim' => 'required|date|after:inicio',
        ]);

        // Verifica disponibilidade do funcionário
        $conflito = Agendamento::where('user_id', $agendamento->user_id)
            ->where('id', '!=', $agendamento->id)
            ->where(function ($q) use ($request) {
                $q->whereBetween('inicio', [$request->inicio, $request->fim])
                  ->orWhereBetween('fim', [$request->inicio, $request->fim]);
            })
            ->exists();

        if ($conflito) {
            return response()->json(['erro' => 'Horário indisponível'], 400);
        }

        $agendamento->inicio = $request->inicio;
        $agendamento->fim = $request->fim;
        $agendamento->status = 'agendado';
        $agendamento->save();

        return response()->json($agendamento);
    }

    // Visualizar agenda por funcionário e por dia/semana
    public function agenda(Request $request, User $user)
    {
        $query = Agendamento::where('user_id', $user->id);

        if ($request->filled('data')) {
            $data = Carbon::parse($request->data);
            $query->whereDate('inicio', $data);
        }

        if ($request->filled('semana')) {
            $data = Carbon::parse($request->semana);
            $query->whereBetween('inicio', [$data->startOfWeek(), $data->endOfWeek()]);
        }

        $agendamentos = $query->orderBy('inicio')->get();

        return response()->json($agendamentos);
    }

    // Registrar entrada / pagamento
    public function registrarEntrada(Request $request, Agendamento $agendamento)
    {
        $request->validate([
            'valor_pago' => 'required|numeric|min:0',
        ]);

        $agendamento->valor_pago = $request->valor_pago;
        $agendamento->status = 'concluido';
        $agendamento->save();

        return response()->json($agendamento);
    }
}
