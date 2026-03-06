<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMangaRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && ($user->isAdmin() || $user->isPremium());
    }

    public function rules(): array
    {
        return [
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string|max:1000',
            'autor' => 'required|string|max:255',
            'genero' => 'required|string|max:100',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg|max:5000',
            'is_premium' => 'nullable|boolean',
            'tiene_derechos_autor' => 'nullable|boolean',
            'fecha_publicacion' => 'nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'titulo.required' => 'El título es requerido',
            'descripcion.required' => 'La descripción es requerida',
            'autor.required' => 'El autor es requerido',
            'genero.required' => 'El género es requerido',
        ];
    }
}
