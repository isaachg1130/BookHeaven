<?php

namespace App\Http\Controllers;

use App\Models\Comic;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ComicController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Comic::all();
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:100',
            'descripcion' => 'required|string|max:255',
            'autor' => 'required|string|max:100',
            'imagen' => 'required|image|mimes:jpg,jpeg,png,webp|max:5120',
            'pdf' => 'required|mimes:pdf|max:20480',
        ]);

        $rutaImagen = $request->file('imagen')->store('portadas', 'public');
        $rutaPdf = $request->file('pdf')->store('pdfs', 'public');

        Comic::create([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'autor' => $request->autor,
            'imagen' => $rutaImagen,
            'pdf' => $rutaPdf,
        ]);

        return response()->json(['message' => 'comic creado con éxito'], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Comic $comic)
    {
        $comic = Comic::findOrFail($comic);
        return response()->json($comic, 200);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Comic $comic)
    {
        return $comic;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Comic $comic)
    {

        $request->validate([
            'nombre' => 'sometimes|filled|string|max:100',
            'descripcion' => 'sometimes|filled|string|max:255',
            'autor' => 'sometimes|filled|string|max:100',
            'imagen' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'pdf' => 'nullable|mimes:pdf|max:20480',
        ]);

        // Actualizar campos simples solo si vienen
        if ($request->has('nombre')) {
            $comic->nombre = $request->nombre;
        }
        if ($request->has('descripcion')) {
            $comic->descripcion = $request->descripcion;
        }
        if ($request->has('autor')) {
            $comic->autor = $request->autor;
        }

        // Actualizar imagen si viene
        if ($request->hasFile('imagen')) {
            if ($comic->imagen && Storage::disk('public')->exists($comic->imagen)) {
                Storage::disk('public')->delete($comic->imagen);
            }
            $comic->imagen = $request->file('imagen')->store('portadas', 'public');
        }

        // Actualizar PDF si viene
        if ($request->hasFile('pdf')) {
            if ($comic->pdf && Storage::disk('public')->exists($comic->pdf)) {
                Storage::disk('public')->delete($comic->pdf);
            }
            $comic->pdf = $request->file('pdf')->store('pdfs', 'public');
        }

        $comic->save();

        return response()->json([
            'message' => 'Comic actualizado con éxito',
            'comic'   => $comic
        ], 200);;
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Comic $comic)
    {
        if ($comic->imagen && Storage::disk('public')->exists($comic->imagen)) {
            Storage::disk('public')->delete($comic->imagen);
        }
        if ($comic->pdf && Storage::disk('public')->exists($comic->pdf)) {
            Storage::disk('public')->delete($comic->pdf);
        }

        $comic->delete();

        return response()->json(['message' => 'comic eliminado con éxito'], 200);
    }
}
