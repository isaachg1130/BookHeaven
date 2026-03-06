<?php

namespace App\Http\Controllers;

use App\Models\Manga;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MangaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $mangas = Manga::all()->map(function ($manga) {
            $manga->imagen_url = $manga->imagen ? asset('storage/' . $manga->imagen) : null;
            $manga->pdf_url = $manga->pdf ? asset('storage/' . $manga->pdf) : null;
            return $manga;
        });

        return response()->json($mangas);
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

        $manga = Manga::create([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'autor' => $request->autor,
            'imagen' => $rutaImagen,
            'pdf' => $rutaPdf,
        ]);

        return response()->json([
            'message' => 'Manga creado con éxito',
            'manga' => [
                'id' => $manga->id,
                'nombre' => $manga->nombre,
                'descripcion' => $manga->descripcion,
                'autor' => $manga->autor,
                'imagen_url' => asset('storage/' . $manga->imagen),
                'pdf_url' => asset('storage/' . $manga->pdf),
            ]
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $manga = Manga::findOrFail($id);

            $manga->imagen_url = $manga->imagen ? asset('storage/' . $manga->imagen) : null;
            $manga->pdf_url = $manga->pdf ? asset('storage/' . $manga->pdf) : null;

            return response()->json($manga, 200);
        } catch (\Exception $e) {
            return response()->json([
                "message" => "Manga no encontrado",
                "error" => $e->getMessage()
            ], 404);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Manga $manga)
    {
        return $manga;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Manga $manga)
    {
        $request->validate([
            'nombre' => 'sometimes|required|string|max:100',
            'descripcion' => 'sometimes|required|string|max:255',
            'autor' => 'sometimes|required|string|max:100',
            'imagen' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:5120',
            'pdf' => 'nullable|mimes:pdf|max:20480',
        ]);

        if ($request->hasFile('imagen')) {
            $rutaImagen = $request->file('imagen')->store('portadas', 'public');
            $manga->imagen = $rutaImagen;
        }

        if ($request->hasFile('pdf')) {
            $rutaPdf = $request->file('pdf')->store('pdfs', 'public');
            $manga->pdf = $rutaPdf;
        }

        if ($request->filled('nombre')) {
            $manga->nombre = $request->nombre;
        }
        if ($request->filled('descripcion')) {
            $manga->descripcion = $request->descripcion;
        }
        if ($request->filled('autor')) {
            $manga->autor = $request->autor;
        }

        $manga->save();

        return response()->json([
            'message' => 'Manga actualizado con éxito',
            'manga' => [
                'id' => $manga->id,
                'nombre' => $manga->nombre,
                'descripcion' => $manga->descripcion,
                'autor' => $manga->autor,
                'imagen_url' => $manga->imagen ? asset('storage/' . $manga->imagen) : null,
                'pdf_url' => $manga->pdf ? asset('storage/' . $manga->pdf) : null,
            ]
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Manga $manga)
    {
        if ($manga->imagen && Storage::disk('public')->exists($manga->imagen)) {
            Storage::disk('public')->delete($manga->imagen);
        }
        if ($manga->pdf && Storage::disk('public')->exists($manga->pdf)) {
            Storage::disk('public')->delete($manga->pdf);
        }

        $manga->delete();

        return response()->json(['message' => 'Manga eliminado con éxito'], 200);
    }
}
