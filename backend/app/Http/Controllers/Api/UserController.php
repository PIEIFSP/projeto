<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Exibe uma lista de todos os serviços.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(): JsonResponse
    {
        $user = User::all();

        $userMapeados = $user->map(function ($user) {
            return [
                'id_usuario' => $user->id,
                'nome' => $user->name,
            ];
        });

        return response()->json($userMapeados);
    }

    /**
     * Exibe o usuário especificado.
     *
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show(User $user)
    {
        return response()->json($user);
    }
}
