<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMangaRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        
        // Si no hay usuario, no autorizar
        if (!$user) {
            return false;
        }
        
        $manga = $this->route('manga');
        if (!$manga) {
            return false;
        }
        
        // El usuario debe ser el propietario o admin
        $isOwner = $manga->uploaded_by && $manga->uploaded_by === $user->id;
        $isAdmin = method_exists($user, 'isAdmin') && $user->isAdmin();
        
        return $isAdmin || $isOwner;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'titulo' => 'sometimes|required|string|max:255',
            'descripcion' => 'sometimes|required|string|max:1000',
            'autor' => 'sometimes|required|string|max:255',
            'genero' => 'sometimes|required|string|max:100',
            'pdf' => 'nullable|file|mimes:pdf|max:50000',
            'imagen' => 'nullable|image|mimes:jpeg,png,jpg|max:5000',
            'is_premium' => 'nullable|boolean',
            'tiene_derechos_autor' => 'nullable|boolean',
            'fecha_publicacion' => 'nullable|date',
            'popularidad' => 'nullable|integer|min:0|max:100',
            'delete_pdf' => 'nullable|boolean',
        ];
    }

    /**
     * Prepare the data for validation
     */
    protected function prepareForValidation(): void
    {
        // Convertir "true"/"false" strings a boolean
        if ($this->has('is_premium') && is_string($this->is_premium)) {
            $this->merge(['is_premium' => $this->is_premium === 'true']);
        }
        if ($this->has('tiene_derechos_autor') && is_string($this->tiene_derechos_autor)) {
            $this->merge(['tiene_derechos_autor' => $this->tiene_derechos_autor === 'true']);
        }
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

    /**
     * Handle failed authorization
     */
    public function failedAuthorization()
    {
        throw new \Illuminate\Auth\Access\AuthorizationException('No tienes permiso para editar este recurso');
    }
}
