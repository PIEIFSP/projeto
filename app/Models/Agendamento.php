<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agendamento extends Model
{
    use HasFactory;

    protected $table = 'agendamentos';

    protected $fillable = [
        'user_id',
        'nome_cliente',
        'servico',
        'valor_pago',
        'inicio',
        'fim',
        'status',
    ];

    // Relação com funcionário
    public function funcionario()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
