<?php
// app/Http/Controllers/Api/ClienteController.php
namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use App\Models\Cliente;
use Illuminate\Http\Request;

class ClienteController extends Controller {
    public function store(Request $request) {
        $data = $request->validate(['Nome'=>'required', 'Telefone'=>'nullable']);
        return response()->json(Cliente::create($data), 201);
    }
    public function index() { return Cliente::all(); }
}
