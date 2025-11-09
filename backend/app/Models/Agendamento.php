<?php
// app/Models/Agendamento.php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Agendamento extends Model {
    use HasFactory;
    protected $table = 'agendamentos';
    protected $primaryKey = 'ID_Agendamento';
    protected $fillable = [
        'ID_Usuario_FK', 'ID_Cliente_FK', 'ID_Servico_FK',
        'Valor_Pago_Ajustado', 'Data_Registro_Pagamento',
        'Data_Hora_Inicio', 'Data_Hora_Fim', 'Status', 'Observacao'
    ];
    public function cliente() { return $this->belongsTo(Cliente::class, 'ID_Cliente_FK'); }
    public function servico() { return $this->belongsTo(Servico::class, 'ID_Servico_FK'); }
    public function usuario() { return $this->belongsTo(User::class, 'ID_Usuario_FK'); }
}
