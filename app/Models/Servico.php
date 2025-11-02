<?php
// app/Models/Servico.php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Servico extends Model {
    use HasFactory;
    protected $table = 'servicos';
    protected $primaryKey = 'ID_Servico';
    protected $fillable = ['Nome', 'Valor', 'Duracao_Minutos'];
}
