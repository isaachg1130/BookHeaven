<?php

namespace App\Notifications;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;

class VerifyEmailCustom extends VerifyEmail
{
    protected function verificationUrl($notifiable)
    {
        // Generar la URL de backend con firma temporal
        $url = URL::temporarySignedRoute(
            'verification.verify',
            Carbon::now()->addMinutes(60),
            [
                'id' => $notifiable->getKey(),
                'hash' => sha1($notifiable->getEmailForVerification()),
            ]
        );
        
        return $url;
    }

    public function toMail($notifiable)
    {
        return (new MailMessage)
            ->subject('✅ Registro exitoso en BookHeaven')
            ->greeting('¡Bienvenido/a ' . $notifiable->name . '!')
            ->line('Tu registro fue exitoso. ¡Gracias por unirte a BookHeaven!')
            ->line('Para activar tu cuenta y acceder a todas nuestras funciones, confirma tu correo electrónico haciendo clic en el botón de abajo.')
            ->action('Confirmar mi correo electrónico', $this->verificationUrl($notifiable))
            ->line('Si no creaste esta cuenta, puedes ignorar este correo de forma segura.')
            ->line('Este enlace de verificación expirará en 60 minutos.')
            ->salutation('— El equipo de BookHeaven 📚');
    }
}
