<?php

namespace App\Http\Controllers\Api;

use App\Models\Servico;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class ServicoController extends Controller
{
    /**
     * Exibe uma lista de todos os serviços.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        $servicos = Servico::all();

        $servicosMapeados = $servicos->map(function ($servico) {
            return [
                'id_servico' => $servico->ID_Servico,
                'nome' => $servico->Nome,
                'valor' => $servico->Valor,
                'duracao' => $servico->Duracao_Minutos,
            ];
        });

        return response()->json($servicosMapeados);
    }
}
