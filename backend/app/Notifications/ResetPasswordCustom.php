<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Notifications\Messages\MailMessage;

class ResetPasswordCustom extends ResetPassword
{
    public function toMail($notifiable)
    {
        // URL del frontend a donde se redirigirá al usuario
        // Por ejemplo: http://localhost:5173/reset-password?token=TOKEN&email=EMAIL
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:5173');
        $resetUrl = $frontendUrl . '/reset-password?token=' . $this->token . '&email=' . urlencode($notifiable->getEmailForPasswordReset());

        return (new MailMessage)
            ->subject('🔑 Recuperación de contraseña - BookHeaven')
            ->greeting('¡Hola ' . $notifiable->name . '!')
            ->line('Recibiste este correo porque solicitaste restablecer tu contraseña en BookHeaven.')
            ->action('Restablecer Mi Contraseña', $resetUrl)
            ->line('Este enlace de recuperación expirará en 60 minutos.')
            ->line('Si no solicitaste este cambio, puedes ignorar este correo de forma segura.')
            ->salutation('— El equipo de BookHeaven 📚');
    }
}
