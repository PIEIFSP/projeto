<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\Request;

class ClienteController extends Controller {
    public function store(Request $request) {
        $data = $request->validate(['Nome'=>'required', 'Telefone'=>'nullable']);
        return response()->json(Cliente::create($data), 201);
    }

    /**
     * Exibe uma lista de todos os serviços.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index() {
        $clientes = Cliente::all();

        $clientesMapeados = $clientes->map(function ($cliente) {
            return [
                'id_cliente' => $cliente->ID_Cliente,
                'nome' => $cliente->Nome,
                'telefone' => $cliente->Telefone,
            ];
        });

        return response()->json($clientesMapeados);
    }
}
