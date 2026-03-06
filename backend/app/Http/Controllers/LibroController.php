<?php

namespace App\Http\Controllers;

use App\Models\Libro;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class LibroController extends Controller
{
    public function index()
    {
        return Libro::all();
    }

    public function create()
    {
        //
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'required|string|max:255',
            'autor' => 'required|string|max:100',
            'imagen' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
            'pdf' => 'required|mimes:pdf|max:20480',
        ]);

        $rutaImagen = $request->file('imagen')->store('libros', 'public');
        $rutaPdf = $request->file('pdf')->store('pdfs', 'public');

        Libro::create([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'autor' => $request->autor,
            'imagen' => $rutaImagen,
            'pdf' => $rutaPdf,
        ]);

        return response()->json(['message' => 'Libro creado con éxito'], 201);
    }

    public function show(Libro $libro)
    {
        $libro = Libro::findOrFail($libro); 
        return response()->json($libro, 200);
    }

    /**
     * Show the form for editing the specified resource.
     * En APIs normalmente basta con devolver el libro.
     */
    public function edit(Libro $libro)
    {
        return $libro;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Libro $libro)
    {
        $request->validate([
            'nombre' => 'sometimes|required|string|max:100',
            'descripcion' => 'sometimes|required|string|max:255',
            'autor' => 'sometimes|required|string|max:100',
            'imagen' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'pdf' => 'nullable|mimes:pdf|max:20480',
        ]);

        // Actualizar campos simples
        $libro->nombre = $request->nombre ?? $libro->nombre;
        $libro->descripcion = $request->descripcion ?? $libro->descripcion;
        $libro->autor = $request->autor ?? $libro->autor;

        // Actualizar imagen si viene
        if ($request->hasFile('imagen')) {
            // Borrar la anterior
            if ($libro->imagen && Storage::disk('public')->exists($libro->imagen)) {
                Storage::disk('public')->delete($libro->imagen);
            }
            $libro->imagen = $request->file('imagen')->store('portadas', 'public');
        }

        // Actualizar PDF si viene
        if ($request->hasFile('pdf')) {
            if ($libro->pdf && Storage::disk('public')->exists($libro->pdf)) {
                Storage::disk('public')->delete($libro->pdf);
            }
            $libro->pdf = $request->file('pdf')->store('pdfs', 'public');
        }

        $libro->save();

        return response()->json(['message' => 'Libro actualizado con éxito', 'libro' => $libro], 200);
    }

    public function destroy(Libro $libro)
    {
        if ($libro->imagen && Storage::disk('public')->exists($libro->imagen)) {
            Storage::disk('public')->delete($libro->imagen);
        }
        if ($libro->pdf && Storage::disk('public')->exists($libro->pdf)) {
            Storage::disk('public')->delete($libro->pdf);
        }

        $libro->delete();

        return response()->json(['message' => 'Libro eliminado con éxito'], 200);
    }
}
