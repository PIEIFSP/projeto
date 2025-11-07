<?php

use Illuminate\Support\Facades\Route;

Route::get('/{any?}', function () {
    $angularIndex = public_path('index.html');
    if (file_exists($angularIndex)) {
        return file_get_contents($angularIndex);
    }
    // Fallback caso o build não tenha sido feito
    return 'App Angular não encontrado. Execute o build do frontend.';
})->where('any', '^(?!api|storage).*$');
