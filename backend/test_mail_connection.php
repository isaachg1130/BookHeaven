<?php
/**
 * Script para probar la configuración de correo
 */

require __DIR__ . '/vendor/autoload.php';

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Mail;
use Illuminate\Mail\Message;

echo "═══════════════════════════════════════════\n";
echo "   🧪 PRUEBA DE CONFIGURACIÓN DE CORREO\n";
echo "═══════════════════════════════════════════\n\n";

// 1. Verificar configuración
$mailConfig = config('mail');
echo "📧 Configuración actual:\n";
echo "   Mailer por defecto: " . $mailConfig['default'] . "\n";
echo "   Host SMTP: " . config('mail.mailers.smtp.host', 'No configurado') . "\n";
echo "   Puerto: " . config('mail.mailers.smtp.port', 'No configurado') . "\n";
echo "   Usuario: " . config('mail.from.address', 'No configurado') . "\n";
echo "   Nombre: " . config('mail.from.name', 'No configurado') . "\n\n";

// 2. Intentar enviar un correo de prueba
echo "🚀 Intentando enviar correo de prueba...\n\n";

try {
    Mail::raw('Este es un correo de prueba de BookHeaven.', function (Message $message) {
        $message->to('zcripta@gmail.com')
                ->subject('🧪 Prueba de correo - BookHeaven');
    });
    
    echo "✅ ¡ÉXITO! El correo se envió correctamente.\n";
    echo "   (Si el mailer es 'log', verifica storage/logs/laravel.log)\n\n";
    
} catch (\Exception $e) {
    echo "❌ ERROR AL ENVIAR CORREO:\n";
    echo "   Clase: " . get_class($e) . "\n";
    echo "   Mensaje: " . $e->getMessage() . "\n";
    echo "   Línea: " . $e->getLine() . "\n";
    echo "   Archivo: " . $e->getFile() . "\n\n";
    
    // Sugerencias
    echo "💡 POSIBLES SOLUCIONES:\n";
    if (strpos($e->getMessage(), 'Connection could not be established') !== false ||
        strpos($e->getMessage(), 'SMTP') !== false) {
        echo "   • Verifica que la contraseña de aplicación Gmail es correcta\n";
        echo "   • Verifica que tu conexión a internet es estable\n";
        echo "   • Prueba con MAIL_MAILER=log para usar el filesystem en desarrollo\n";
    }
    if (strpos($e->getMessage(), 'authentication failed') !== false) {
        echo "   • Las credenciales Gmail pueden haber expirado\n";
        echo "   • Ve a https://myaccount.google.com/apppasswords y genera una nueva\n";
    }
    echo "\n";
}

// 3. Sugerencia para desarrollo
echo "═══════════════════════════════════════════\n";
echo "💡 RECOMENDACIÓN PARA DESARROLLO:\n";
echo "───────────────────────────────────────────\n";
echo "Para no tener problemas con correos en desarrollo,\n";
echo "puedes cambiar en .env:\n\n";
echo "   MAIL_MAILER=log\n\n";
echo "Luego los correos aparecerán en:\n";
echo "   storage/logs/laravel.log\n\n";
echo "Para producción, mantén MAIL_MAILER=smtp\n";
echo "═══════════════════════════════════════════\n";
