<?php
// app/Models/Cliente.php
namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Cliente extends Model {
    use HasFactory;
    protected $table = 'clientes';
    protected $primaryKey = 'ID_Cliente';
    protected $fillable = ['Nome', 'Telefone'];
}
