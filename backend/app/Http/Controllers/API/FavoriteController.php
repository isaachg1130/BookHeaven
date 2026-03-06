<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\Libro;
use App\Models\Manga;
use App\Models\Comic;
use App\Models\Audiobook;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class FavoriteController extends Controller
{
    /**
     * Get all favorites for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $favorites = Favorite::where('user_id', $user->id)->get();

        $formattedFavorites = $favorites->map(function ($fav) {
            $content = $fav->content;
            if (!$content) return null;

            return [
                'id' => $content->id,
                'type' => $fav->content_type,
                'titulo' => $content->titulo ?? $content->title,
                'autor' => $content->autor ?? $content->author,
                'imagen' => $content->imagen ?? $content->poster,
                'addedAt' => $fav->created_at->toISOString(),
                'favorite_id' => $fav->id // Por si se necesita para eliminar directo
            ];
        })->filter()->values();

        return response()->json([
            'success' => true,
            'data' => $formattedFavorites
        ]);
    }

    /**
     * Add or remove a content from favorites (Toggle).
     */
    public function toggle(Request $request): JsonResponse
    {
        $request->validate([
            'content_type' => 'required|string|in:libro,manga,comic,audiobook',
            'content_id' => 'required|integer',
        ]);

        $user = $request->user();
        $type = $request->content_type;
        $id = $request->content_id;

        $favorite = Favorite::where('user_id', $user->id)
            ->where('content_type', $type)
            ->where('content_id', $id)
            ->first();

        if ($favorite) {
            $favorite->delete();
            return response()->json([
                'success' => true,
                'message' => 'Eliminado de favoritos',
                'action' => 'removed'
            ]);
        }

        // Verificar que el contenido exista antes de agregar
        $modelClass = match($type) {
            'libro' => Libro::class,
            'manga' => Manga::class,
            'comic' => Comic::class,
            'audiobook' => Audiobook::class,
            default => null,
        };

        if (!$modelClass || !$modelClass::find($id)) {
            return response()->json([
                'success' => false,
                'message' => 'El contenido no existe'
            ], 404);
        }

        Favorite::create([
            'user_id' => $user->id,
            'content_type' => $type,
            'content_id' => $id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Agregado a favoritos',
            'action' => 'added'
        ]);
    }

    /**
     * Specific delete method.
     */
    public function destroy(Request $request, $type, $id): JsonResponse
    {
        $user = $request->user();
        
        $favorite = Favorite::where('user_id', $user->id)
            ->where('content_type', $type)
            ->where('content_id', $id)
            ->first();

        if (!$favorite) {
            return response()->json(['message' => 'No encontrado en favoritos'], 404);
        }

        $favorite->delete();

        return response()->json([
            'success' => true,
            'message' => 'Eliminado de favoritos'
        ]);
    }
}
