<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLibroRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        return $user && ($user->isAdmin() || $user->isPremium());
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string|max:1000',
            'autor' => 'required|string|max:255',
            'genero' => 'required|string|max:100',
            'pdf' => 'required|file|mimes:pdf|max:50000',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg|max:5000',
            'is_premium' => 'nullable|boolean',
            'tiene_derechos_autor' => 'nullable|boolean',
            'fecha_publicacion' => 'nullable|date',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'titulo.required' => 'El título es requerido',
            'titulo.max' => 'El título no puede exceder 255 caracteres',
            'descripcion.required' => 'La descripción es requerida',
            'autor.required' => 'El autor es requerido',
            'genero.required' => 'El género es requerido',
            'pdf.required' => 'Se requiere un archivo PDF',
            'pdf.mimes' => 'El archivo debe ser un PDF válido',
            'pdf.max' => 'El PDF no puede exceder 50MB',
            'imagen.image' => 'La imagen debe ser un archivo de imagen válido',
            'imagen.max' => 'La imagen no puede exceder 5MB',
            'fecha_publicacion.date' => 'La fecha debe ser válida',
        ];
    }
}
