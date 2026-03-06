<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Foundation\Auth\EmailVerificationRequest;
use App\Models\User;

Route::get('/', function () {
    return view('welcome');
});

// 📧 RUTAS DE VERIFICACIÓN DE EMAIL
// Ruta para verificar el email usando el enlace del correo
Route::get('/verify-email/{id}/{hash}', function (EmailVerificationRequest $request) {
    $request->fulfill();
    
    // Redirigir al frontend con un mensaje de éxito
    $redirectUrl = env('FRONTEND_URL', 'http://localhost:5173');
    return redirect($redirectUrl . '?verified=true&message=Tu+email+ha+sido+verificado+correctamente');
})->middleware(['signed', 'throttle:6,1'])->name('verification.verify');

// Ruta para reenviar el email de verificación (necesita autenticación)
Route::post('/email/verification-notification', function (Illuminate\Http\Request $request) {
    $request->user()->sendEmailVerificationNotification();
    
    return response()->json([
        'message' => 'Email de verificación reenviado correctamente'
    ]);
})->middleware('auth:sanctum')->name('verification.send');
