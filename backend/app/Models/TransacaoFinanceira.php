<?php
// app/Models/TransacaoFinanceira.php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TransacaoFinanceira extends Model {
    use HasFactory;
    protected $table = 'transacoes_financeiras';
    protected $primaryKey = 'ID_Transacao';
    protected $fillable = ['ID_Agendamento_FK', 'Tipo', 'Data', 'Valor', 'Descricao', 'Categoria'];
}
