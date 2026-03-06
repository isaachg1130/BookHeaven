<?php

namespace App\Http\Controllers\API;

use App\Models\User;
use App\Models\Libro;
use App\Models\Manga;
use App\Models\Comic;
use App\Models\Audiobook;
use App\Models\ActivityLog;
use App\Services\ContentService;
use App\Http\Requests\StoreLibroRequest;
use App\Http\Requests\UpdateLibroRequest;
use App\Http\Requests\UpdateComicRequest;
use App\Http\Requests\UpdateMangaRequest;
use App\Http\Requests\StoreMangaRequest;
use App\Http\Requests\StoreComicRequest;
use App\Http\Requests\StoreAudiobookRequest;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class ContentController
{
    protected ContentService $contentService;

    public function __construct(ContentService $contentService)
    {
        $this->contentService = $contentService;
    }

    /**
     * Obtener contenido unificado de todas las categorías
     * 
     * Ejemplo: GET /api/content/unified?categories[]=libro&categories[]=manga&per_page=20
     */
    public function getUnified(Request $request): JsonResponse
    {
        $user = $request->user();

        try {
            $params = [
                'categories' => $request->input('categories', ['libro', 'manga', 'comic', 'audiobook']),
                'genres' => $request->input('genres', []),
                'search' => $request->input('search'),
                'per_page' => $request->input('per_page', 20),
                'page' => $request->input('page', 1),
                'sort_by' => $request->input('sort_by', 'created_at'),
                'sort_order' => $request->input('sort_order', 'desc'),
            ];

            $content = $this->contentService->getUnifiedContent($user, $params);

            return response()->json($content);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener contenido',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener solo contenido PREMIUM (Admin only)
     * 
     * GET /api/admin/content/premium?per_page=20&sort_by=created_at
     */
    public function getPremiumContent(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Cargar relación role si no está cargada
        if ($user && !$user->relationLoaded('role')) {
            $user->load('role');
        }

        // Validar que sea admin
        if (!$user || !$user->isAdmin()) {
            return response()->json([
                'message' => 'Solo administradores pueden acceder a contenido premium',
            ], 403);
        }

        try {
            $params = [
                'categories' => $request->input('categories', ['libro', 'manga', 'comic', 'audiobook']),
                'genres' => $request->input('genres', []),
                'search' => $request->input('search'),
                'per_page' => $request->input('per_page', 20),
                'page' => $request->input('page', 1),
                'sort_by' => $request->input('sort_by', 'created_at'),
                'sort_order' => $request->input('sort_order', 'desc'),
                'premium_only' => true, // Flag para obtener solo premium
            ];

            // Construir query para contenido premium
            $libros = Libro::where('is_premium', true)
                ->select(['id', 'titulo', 'descripcion', 'autor', 'imagen', 'genero', 'is_premium', 'popularidad', 'created_at', 'uploaded_by'])
                ->with(['uploader:id,name,profile_photo_path'])
                ->orderBy($params['sort_by'], $params['sort_order'])
                ->paginate($params['per_page']);

            $count = [
                'libros_premium' => Libro::where('is_premium', true)->count(),
                'mangas_premium' => Manga::where('is_premium', true)->count(),
                'comics_premium' => Comic::where('is_premium', true)->count(),
                'audiobooks_premium' => Audiobook::where('is_premium', true)->count(),
            ];

            return response()->json([
                'message' => 'Contenido premium obtenido exitosamente',
                'data' => $libros->items(),
                'counts' => $count,
                'pagination' => [
                    'total' => $libros->total(),
                    'per_page' => $libros->perPage(),
                    'current_page' => $libros->currentPage(),
                    'last_page' => $libros->lastPage(),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al obtener contenido premium',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Crear un nuevo libro
     */
    public function createLibro(StoreLibroRequest $request): JsonResponse
    {
        $user = $request->user();
        
        // StoreLibroRequest valida autorización automáticamente (via authorize())
        $validated = $request->validated();

        try {
            $pdfPath = $request->file('pdf')->store('pdfs/libros', 'public_direct');
            $imagenPath = null;

            if ($request->hasFile('imagen')) {
                $imagenPath = $request->file('imagen')->store('images/libros', 'public_direct');
            }

            $libro = Libro::create([
                'titulo' => $validated['titulo'],
                'descripcion' => $validated['descripcion'],
                'autor' => $validated['autor'],
                'genero' => $validated['genero'],
                'pdf' => $pdfPath,
                'imagen' => $imagenPath,
                'is_premium' => $validated['is_premium'] ?? false,
                'tiene_derechos_autor' => $validated['tiene_derechos_autor'] ?? false,
                'fecha_publicacion' => $validated['fecha_publicacion'] ?? now(),
                'uploaded_by' => $user->id,
            ]);

            // Log de actividad
            ActivityLog::log('create', $user, 'Libro', $libro->id);

            return response()->json([
                'message' => 'Libro creado exitosamente',
                'book' => $libro,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear el libro',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener todos los libros disponibles (OPTIMIZADO PARA LOCAL)
     * 
     * Optimizaciones:
     * - Select solo campos necesarios
     * - Busqueda simple sin FULL TEXT (para local sin índices)
     * - Límite máximo de 20 por defecto en local
     * - Cache implícita mediante paginación eficiente
     * - Cache HTTP con headers para navegadores
     */
    public function getLibros(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Select solo campos necesarios para mejorar rendimiento
        $query = Libro::select([
            'id', 'titulo', 'descripcion', 'autor', 'imagen', 'genero', 
            'is_premium', 'popularidad', 'created_at', 'uploaded_by'
        ]);

        // Filtro por género
        if ($request->has('genre') && $request->input('genre')) {
            $query->where('genero', $request->input('genre'));
        }

        // Búsqueda optimizada (funciona sin índices FULL TEXT)
        if ($request->has('search') && $request->input('search')) {
            $search = trim($request->input('search'));
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('titulo', 'like', "%{$search}%")
                      ->orWhere('autor', 'like', "%{$search}%");
                });
            }
        }

        // Validar parámetros de ordenamiento
        $allowedOrderBy = ['created_at', 'titulo', 'autor', 'popularidad'];
        $orderBy = in_array($request->input('sort_by'), $allowedOrderBy) ? $request->input('sort_by') : 'created_at';
        $order = strtolower($request->input('sort_order')) === 'asc' ? 'asc' : 'desc';

        // NO cargar relaciones por defecto (mejora rendimiento)
        // Solo si se solicita explícitamente
        if ($request->boolean('include_uploader', false)) {
            $query->with('uploader:id,name,profile_photo_path');
        }

        // Aplicar ordenamiento
        $query->orderBy($orderBy, $order);

        // Paginar con límite máximo (12 por defecto en local, 50 máximo)
        $perPage = min((int) $request->input('per_page', 12), 50);
        $libros = $query->paginate($perPage);

        // Optimización adicional: solo enviar campos necesarios en datos relacionados
        $libros->getCollection()->transform(function ($libro) {
            return [
                'id' => $libro->id,
                'titulo' => $libro->titulo,
                'descripcion' => $libro->descripcion,
                'autor' => $libro->autor,
                'imagen' => $libro->imagen,
                'genero' => $libro->genero,
                'is_premium' => $libro->is_premium,
                'popularidad' => $libro->popularidad,
                'created_at' => $libro->created_at,
            ];
        });

        // Agregar headers de cache HTTP para optimizar carga
        $etag = md5(json_encode($libros->items()) . $perPage . $request->input('page', 1));
        
        return response()->json($libros)
            ->header('Cache-Control', 'public, max-age=300') // 5 minutos
            ->header('ETag', $etag)
            ->header('X-Content-Type-Options', 'nosniff');
    }

    /**
     * Obtener un libro específico
     */
    public function getLibro(Request $request, Libro $libro): JsonResponse
    {
        $user = $request->user();

        // Verificar permisos: solo admin y premium pueden ver contenido premium
        if ($libro->is_premium) {
            if (!$user || (!$user->isAdmin() && !$user->isPremium())) {
                return response()->json([
                    'message' => 'Acceso denegado. Contenido solo para usuarios premium.',
                ], 403);
            }
        }

        // Incrementar popularidad
        $libro->incrementPopularity();

        // Log de actividad
        if ($user) {
            ActivityLog::log('view', $user, 'Libro', $libro->id);
        }

        return response()->json([
            'book' => $libro->load('uploader'),
        ]);
    }

    /**
     * Servir PDF de forma segura
     * Retorna JSON con información de acceso o el archivo PDF
     */
    public function servePDF(Request $request, string $type, int $id)
    {
        $user = $request->user();
        
        // Cargar relación role si no está cargada
        if ($user && !$user->relationLoaded('role')) {
            $user->load('role');
        }

        $model = match ($type) {
            'libro' => Libro::findOrFail($id),
            'manga' => Manga::findOrFail($id),
            'comic' => Comic::findOrFail($id),
            default => abort(404),
        };

        // Verificar permisos para contenido premium
        if ($model->is_premium) {
            if (!$user) {
                // Usuario no autenticado
                return response()->json([
                    'success' => false,
                    'code' => 'NOT_AUTHENTICATED',
                    'message' => 'Debes iniciar sesión para acceder a contenido premium',
                    'type' => $type,
                    'content_id' => $id,
                    'content_title' => $model->titulo,
                    'is_premium' => true,
                ], 403);
            }

            if (!$user->isAdmin() && !$user->isPremium()) {
                // Usuario autenticado pero no premium
                return response()->json([
                    'success' => false,
                    'code' => 'REQUIRES_PREMIUM',
                    'message' => 'Necesitas una suscripción premium para acceder a este contenido',
                    'type' => $type,
                    'content_id' => $id,
                    'content_title' => $model->titulo,
                    'is_premium' => true,
                    'user_role' => $user->role?->name ?? 'unknown',
                ], 403);
            }
        }

        // Log de actividad
        if ($user) {
            ActivityLog::log('download', $user, ucfirst($type), $id);
        }

        // Obtener la ruta correcta del PDF desde el disco público
        $relativePath = $model->pdf;
        $disk = Storage::disk('public_direct');
        $path = $disk->path($relativePath);

        if (!file_exists($path)) {
            // Intentar encontrar el archivo en la estructura 'media/' (fallback)
            // Estructura alternativa: media/{tipo}s/pdfs/{archivo}
            $filename = basename($relativePath);
            $typeFolder = match($type) {
                'libro' => 'libros',
                'manga' => 'mangas',
                'comic' => 'comics',
                default => $type . 's'
            };
            
            // Intento 1: media/libros/pdfs/filename.pdf
            $altPath1 = "media/{$typeFolder}/pdfs/{$filename}";
            if ($disk->exists($altPath1)) {
                return response()->file($disk->path($altPath1));
            }
            
            // Intento 2: media/pdfs/filename.pdf
             $altPath2 = "media/pdfs/{$filename}";
            if ($disk->exists($altPath2)) {
                return response()->file($disk->path($altPath2));
            }
            
            // Intento 3: Si la ruta en DB ya incluye 'pdfs/', intentar prefijar con 'media/'
            // Ejemplo: DB='pdfs/libros/1.pdf' -> probar 'media/pdfs/libros/1.pdf'
            $altPath3 = "media/" . $relativePath;
             if ($disk->exists($altPath3)) {
                return response()->file($disk->path($altPath3));
            }

            return response()->json([
                'success' => false,
                'code' => 'FILE_NOT_FOUND',
                'message' => 'Archivo de PDF no encontrado',
                'debug_path' => $relativePath // Ayuda debug
            ], 404);
        }

        return response()->file($path);
    }

    /**
     * Actualizar un libro
     */
    public function updateLibro(UpdateLibroRequest $request, Libro $libro): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'message' => 'No autenticado',
            ], 401);
        }

        // Si uploaded_by es null, solo admin puede editar
        // Si tienen propietario, solo admin o propietario pueden editar
        $isOwner = $libro->uploaded_by && $libro->uploaded_by === $user->id;
        $isAdmin = method_exists($user, 'isAdmin') && $user->isAdmin();

        if (!$isAdmin && !$isOwner) {
            return response()->json([
                'message' => 'No tienes permiso para editar este libro',
            ], 403);
        }

        try {
            // Debug: Log de lo que recibe laravel
            Log::info('UPDATE_LIBRO_REQUEST', [
                'has_imagen' => $request->hasFile('imagen'),
                'imagen_original' => $request->file('imagen')?->getClientOriginalName(),
                'imagen_size' => $request->file('imagen')?->getSize(),
                'content_type' => $request->header('Content-Type'),
                'all_files' => $request->files->keys(),
            ]);

            // Usar validación del Form Request
            $validated = $request->validated();

            // Manejar carga de imagen
            if ($request->hasFile('imagen')) {
                try {
                    Log::info('PROCESANDO_IMAGEN_LIBRO', ['libro_id' => $libro->id]);
                    
                    // Eliminar imagen anterior si existe
                    if ($libro->imagen) {
                        Log::info('BORRANDO_IMAGEN_ANTERIOR', ['imagen' => $libro->imagen]);
                        if (Storage::disk('public_direct')->exists($libro->imagen)) {
                            Storage::disk('public_direct')->delete($libro->imagen);
                            Log::info('IMAGEN_ANTERIOR_ELIMINADA');
                        }
                    }

                    // Guardar nueva imagen en public/storage/images/libros/
                    $file = $request->file('imagen');
                    $originalName = $file->getClientOriginalName();
                    $fileSize = $file->getSize();
                    
                    // Usar un nombre único basado en timestamp
                    $fileName = time() . '_' . uniqid() . '_' . basename($originalName);
                    $imagenPath = $file->storeAs('images/libros', $fileName, 'public_direct');
                    
                    // Verificar que se guardó correctamente
                    $fullPath = public_path('storage/' . $imagenPath);
                    $fileExists = file_exists($fullPath);
                    $diskExists = Storage::disk('public_direct')->exists($imagenPath);
                    
                    Log::info('IMAGEN_GUARDADA', [
                        'original_name' => $originalName,
                        'file_size' => $fileSize,
                        'stored_name' => $fileName,
                        'stored_path' => $imagenPath,
                        'disk_path' => $fullPath,
                        'file_exists' => $fileExists,
                        'disk_exists' => $diskExists,
                    ]);
                    
                    if ($fileExists && $diskExists) {
                        $validated['imagen'] = $imagenPath;
                        Log::info('IMAGEN_VALIDADA', ['path' => $imagenPath]);
                    } else {
                        Log::error('IMAGEN_NO_SE_GUARDÓ', [
                            'file_exists' => $fileExists,
                            'disk_exists' => $diskExists,
                            'path' => $imagenPath,
                        ]);
                        throw new \Exception('No se pudo guardar la imagen en el disco');
                    }
                } catch (\Exception $e) {
                    Log::error('ERROR_AL_GUARDAR_IMAGEN', [
                        'error' => $e->getMessage(),
                        'line' => $e->getLine(),
                    ]);
                    throw $e;
                }
            }

            // Manejar eliminación de PDF
            if ($request->has('delete_pdf') && $request->input('delete_pdf')) {
                if ($libro->pdf && Storage::disk('public_direct')->exists($libro->pdf)) {
                    Storage::disk('public_direct')->delete($libro->pdf);
                }
                $validated['pdf'] = null;
            }
            // Manejar carga de nuevo PDF
            elseif ($request->hasFile('pdf')) {
                // Eliminar PDF anterior si existe
                if ($libro->pdf && Storage::disk('public_direct')->exists($libro->pdf)) {
                    Storage::disk('public_direct')->delete($libro->pdf);
                }

                // Guardar nuevo PDF en public/storage/pdfs/libros/
                $pdfPath = $request->file('pdf')->store('pdfs/libros', 'public_direct');
                $validated['pdf'] = $pdfPath;
            }

            $libro->update($validated);

            // Log de actividad
            ActivityLog::log('update', $user, 'Libro', $libro->id, $validated);

            return response()->json([
                'message' => 'Libro actualizado exitosamente',
                'data' => $libro->fresh(),
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar el libro',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Eliminar un libro
     */
    public function deleteLibro(Request $request, Libro $libro): JsonResponse
    {
        $user = $request->user();

        // Solo el propietario o admin puede eliminar
        if ($libro->uploaded_by !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'message' => 'No tienes permiso para eliminar este libro',
            ], 403);
        }

        // Eliminar archivos
        if ($libro->pdf) {
            Storage::disk('secure')->delete($libro->pdf);
        }
        if ($libro->imagen) {
            Storage::disk('public')->delete($libro->imagen);
        }

        // Log de actividad
        ActivityLog::log('delete', $user, 'Libro', $libro->id);

        $libro->delete();

        return response()->json([
            'message' => 'Libro eliminado exitosamente',
        ]);
    }

    /**
     * Crear audiolibro
     */
    public function createAudiobook(Request $request): JsonResponse
    {
        $user = $request->user();

        // Solo admin y premium
        if (!$user->isAdmin() && !$user->isPremium()) {
            return response()->json([
                'message' => 'Solo administradores y usuarios premium pueden crear audiolibros',
            ], 403);
        }

        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'autor' => 'required|string|max:255',
            'narrador' => 'sometimes|string|max:255',
            'genero' => 'required|string|max:100',
            'audio' => 'required|file|mimes:mp3,wav,aac,flac|max:500000',
            'duracion_segundos' => 'required|integer|min:1',
            'imagen' => 'sometimes|image|max:5000000',
            'is_premium' => 'sometimes|boolean',
            'tiene_derechos_autor' => 'sometimes|boolean',
            'fecha_publicacion' => 'sometimes|date',
        ]);

        try {
            $audioPath = $request->file('audio')->store('audios/audiobooks', 'public_direct');
            $imagenPath = null;

            if ($request->hasFile('imagen')) {
                $imagenPath = $request->file('imagen')->store('images/audiobooks', 'public_direct');
            }

            $audiobook = Audiobook::create([
                'titulo' => $validated['titulo'],
                'descripcion' => $validated['descripcion'],
                'autor' => $validated['autor'],
                'narrador' => $validated['narrador'] ?? null,
                'genero' => $validated['genero'],
                'archivo_audio' => $audioPath,
                'duracion_segundos' => $validated['duracion_segundos'],
                'imagen' => $imagenPath,
                'is_premium' => $validated['is_premium'] ?? false,
                'tiene_derechos_autor' => $validated['tiene_derechos_autor'] ?? false,
                'fecha_publicacion' => $validated['fecha_publicacion'] ?? now(),
                'uploaded_by' => $user->id,
            ]);

            // Log de actividad
            ActivityLog::log('create', $user, 'Audiobook', $audiobook->id);

            return response()->json([
                'message' => 'Audiolibro creado exitosamente',
                'audiobook' => $audiobook,
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al crear el audiolibro',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Obtener todos los audiolibros disponibles (OPTIMIZADO PARA LOCAL)
     */
    public function getAudiobooks(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Select solo campos necesarios
        $query = Audiobook::select([
            'id', 'titulo', 'descripcion', 'autor', 'narrador', 'imagen', 'genero',
            'is_premium', 'popularidad', 'duracion_segundos', 'created_at', 'uploaded_by'
        ]);

        // Filtro por género
        if ($request->has('genre') && $request->input('genre')) {
            $query->where('genero', $request->input('genre'));
        }

        // Búsqueda optimizada (sin FULL TEXT para local)
        if ($request->has('search') && $request->input('search')) {
            $search = trim($request->input('search'));
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('titulo', 'like', "%{$search}%")
                      ->orWhere('autor', 'like', "%{$search}%")
                      ->orWhere('narrador', 'like', "%{$search}%");
                });
            }
        }

        // Validar ordenamiento
        $allowedOrderBy = ['created_at', 'titulo', 'autor', 'narrador', 'popularidad', 'duracion_segundos'];
        $orderBy = in_array($request->input('sort_by'), $allowedOrderBy) ? $request->input('sort_by') : 'created_at';
        $order = strtolower($request->input('sort_order')) === 'asc' ? 'asc' : 'desc';

        if ($request->boolean('include_uploader', false)) {
            $query->with('uploader:id,name,profile_photo_path');
        }

        $perPage = min((int) $request->input('per_page', 12), 50);
        $audiobooks = $query->orderBy($orderBy, $order)->paginate($perPage);

        return response()->json($audiobooks);
    }

    /**
     * Servir audio de forma segura
     */
    public function serveAudio(Request $request, int $id): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        $user = $request->user();
        $audiobook = Audiobook::findOrFail($id);

        // Verificar permisos: Solo si NO es premium, o si el usuario es admin/premium
        if ($audiobook->is_premium) {
            if (!$user) {
                abort(403, 'Debes iniciar sesión para acceder a contenido premium');
            }
            if (!$user->isAdmin() && !$user->isPremium()) {
                abort(403, 'No tienes acceso a este contenido premium');
            }
        }

        // Log de actividad
        if ($user) {
            ActivityLog::log('stream', $user, 'Audiobook', $id);
        }

        $path = Storage::disk('public_direct')->path($audiobook->archivo_audio);

        if (!file_exists($path)) {
            abort(404, 'Audio no encontrado');
        }

        return response()->file($path);
    }

    /**
     * Obtener estadísticas de contenido (optimizado)
     */
    public function getContentStats(Request $request): JsonResponse
    {
        $request->user()->isAdmin() || abort(403);

        // Obtener conteos en variables para reutilizar
        $librosTotal = Libro::count();
        $librosPremium = Libro::where('is_premium', true)->count();
        $mangasTotal = Manga::count();
        $mangasPremium = Manga::where('is_premium', true)->count();
        $comicsTotal = Comic::count();
        $comicsPremium = Comic::where('is_premium', true)->count();
        $audiobooksTotal = Audiobook::count();
        $audiobooksPremium = Audiobook::where('is_premium', true)->count();

        return response()->json([
            'total_content' => $librosTotal + $mangasTotal + $comicsTotal + $audiobooksTotal,
            'libros' => [
                'total' => $librosTotal,
                'premium' => $librosPremium,
            ],
            'mangas' => [
                'total' => $mangasTotal,
                'premium' => $mangasPremium,
            ],
            'comics' => [
                'total' => $comicsTotal,
                'premium' => $comicsPremium,
            ],
            'audiobooks' => [
                'total' => $audiobooksTotal,
                'premium' => $audiobooksPremium,
            ],
            'most_viewed_overall' => [
                'libros' => Libro::orderBy('popularidad', 'desc')->select('id', 'titulo', 'popularidad')->limit(3)->get(),
                'audiobooks' => Audiobook::orderBy('popularidad', 'desc')->select('id', 'titulo', 'popularidad')->limit(3)->get(),
            ],
        ]);
    }

    /**
     * Obtener todos los mangas disponibles
     */
    /**
     * Obtener todos los mangas disponibles (OPTIMIZADO PARA LOCAL)
     */
    public function getMangas(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Select solo campos necesarios
        $query = Manga::select([
            'id', 'titulo', 'descripcion', 'autor', 'imagen', 'genero', 
            'is_premium', 'popularidad', 'created_at', 'uploaded_by'
        ]);

        if ($request->has('genre') && $request->input('genre')) {
            $query->where('genero', $request->input('genre'));
        }

        if ($request->has('search') && $request->input('search')) {
            $search = trim($request->input('search'));
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('titulo', 'like', "%{$search}%")
                      ->orWhere('autor', 'like', "%{$search}%");
                });
            }
        }

        $orderBy = in_array($request->input('sort_by'), ['created_at', 'titulo', 'autor', 'popularidad']) ? $request->input('sort_by') : 'created_at';
        $order = strtolower($request->input('sort_order')) === 'asc' ? 'asc' : 'desc';

        if ($request->boolean('include_uploader', false)) {
            $query->with('uploader:id,name,profile_photo_path');
        }

        $perPage = min((int) $request->input('per_page', 12), 50);
        $mangas = $query->orderBy($orderBy, $order)->paginate($perPage);
        
        // Agregar headers de cache HTTP
        $etag = md5(json_encode($mangas->items()) . $perPage . $request->input('page', 1));
        
        return response()->json($mangas)
            ->header('Cache-Control', 'public, max-age=300')
            ->header('ETag', $etag)
            ->header('X-Content-Type-Options', 'nosniff');
    }

    /**
     * Obtener un manga específico
     */
    public function getManga(Request $request, Manga $manga): JsonResponse
    {
        $user = $request->user();

        if ($manga->is_premium && (!$user || (!$user->isAdmin() && !$user->isPremium()))) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $manga->incrementPopularity();
        if ($user) {
            ActivityLog::log('view', $user, 'Manga', $manga->id);
        }

        return response()->json(['manga' => $manga->load('uploader')]);
    }

    /**
     * Crear un nuevo manga
     */
    public function createManga(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isAdmin() && !$user->isPremium()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'autor' => 'required|string|max:255',
            'genero' => 'required|string|max:100',
            'pdf' => 'required|file|mimes:pdf|max:50000',
            'imagen' => 'sometimes|image|mimes:jpeg,png,jpg|max:5000',
        ]);

        try {
            $pdfPath = $request->file('pdf')->store('pdfs/mangas', 'public_direct');
            $imagenPath = $request->hasFile('imagen') 
                ? $request->file('imagen')->store('images/mangas', 'public_direct') 
                : null;

            $manga = Manga::create([
                'titulo' => $validated['titulo'],
                'descripcion' => $validated['descripcion'],
                'autor' => $validated['autor'],
                'genero' => $validated['genero'],
                'pdf' => $pdfPath,
                'imagen' => $imagenPath,
                'is_premium' => false,
                'uploaded_by' => $user->id,
            ]);

            ActivityLog::log('create', $user, 'Manga', $manga->id);

            return response()->json(['message' => 'Manga creado', 'manga' => $manga], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al crear manga', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Actualizar manga
     */
    public function updateManga(UpdateMangaRequest $request, Manga $manga): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        // Si uploaded_by es null, solo admin puede editar
        // Si tienen propietario, solo admin o propietario pueden editar
        $isOwner = $manga->uploaded_by && $manga->uploaded_by === $user->id;
        $isAdmin = method_exists($user, 'isAdmin') && $user->isAdmin();

        if (!$isAdmin && !$isOwner) {
            return response()->json(['message' => 'No tienes permiso para editar este manga'], 403);
        }

        try {
            // Usar validación del Form Request
            $validated = $request->validated();

            // Convertir valores 0/1 a booleanos si es necesario
            if (isset($validated['is_premium'])) {
                $validated['is_premium'] = (bool) $validated['is_premium'];
            }
            if (isset($validated['tiene_derechos_autor'])) {
                $validated['tiene_derechos_autor'] = (bool) $validated['tiene_derechos_autor'];
            }

            // Manejar carga de imagen
            if ($request->hasFile('imagen')) {
                try {
                    Log::info('PROCESANDO_IMAGEN_MANGA', ['manga_id' => $manga->id]);
                    
                    // Eliminar imagen anterior si existe
                    if ($manga->imagen) {
                        Log::info('BORRANDO_IMAGEN_ANTERIOR', ['imagen' => $manga->imagen]);
                        if (Storage::disk('public_direct')->exists($manga->imagen)) {
                            Storage::disk('public_direct')->delete($manga->imagen);
                            Log::info('IMAGEN_ANTERIOR_ELIMINADA');
                        }
                    }

                    // Guardar nueva imagen en public/storage/images/mangas/
                    $file = $request->file('imagen');
                    $originalName = $file->getClientOriginalName();
                    $fileSize = $file->getSize();
                    $fileName = time() . '_' . uniqid() . '_' . basename($originalName);
                    $imagenPath = $file->storeAs('images/mangas', $fileName, 'public_direct');
                    
                    $fullPath = public_path('storage/' . $imagenPath);
                    $fileExists = file_exists($fullPath);
                    $diskExists = Storage::disk('public_direct')->exists($imagenPath);
                    
                    Log::info('IMAGEN_GUARDADA', [
                        'original_name' => $originalName,
                        'file_size' => $fileSize,
                        'stored_name' => $fileName,
                        'stored_path' => $imagenPath,
                        'disk_path' => $fullPath,
                        'file_exists' => $fileExists,
                        'disk_exists' => $diskExists,
                    ]);
                    
                    if ($fileExists && $diskExists) {
                        $validated['imagen'] = $imagenPath;
                    } else {
                        Log::error('IMAGEN_NO_SE_GUARDÓ', [
                            'file_exists' => $fileExists,
                            'disk_exists' => $diskExists,
                        ]);
                        throw new \Exception('No se pudo guardar la imagen en el disco');
                    }
                } catch (\Exception $e) {
                    Log::error('ERROR_AL_GUARDAR_IMAGEN_MANGA', [
                        'error' => $e->getMessage(),
                        'line' => $e->getLine(),
                    ]);
                    throw $e;
                }
            }

            // Manejar eliminación de PDF
            if ($request->has('delete_pdf') && $request->input('delete_pdf')) {
                if ($manga->pdf && Storage::disk('public_direct')->exists($manga->pdf)) {
                    Storage::disk('public_direct')->delete($manga->pdf);
                }
                $validated['pdf'] = null;
            }
            // Manejar carga de nuevo PDF
            elseif ($request->hasFile('pdf')) {
                // Eliminar PDF anterior si existe
                if ($manga->pdf && Storage::disk('public_direct')->exists($manga->pdf)) {
                    Storage::disk('public_direct')->delete($manga->pdf);
                }

                // Guardar nuevo PDF en public/storage/pdfs/mangas/
                $pdfPath = $request->file('pdf')->store('pdfs/mangas', 'public_direct');
                $validated['pdf'] = $pdfPath;
            }

            $manga->update($validated);
            ActivityLog::log('update', $user, 'Manga', $manga->id);
            return response()->json([
                'message' => 'Manga actualizado',
                'data' => $manga->fresh()
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar manga
     */
    public function deleteManga(Request $request, Manga $manga): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        try {
            ActivityLog::log('delete', $user, 'Manga', $manga->id);
            $manga->delete();
            return response()->json(['message' => 'Manga eliminado']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al eliminar', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Obtener todos los cómics disponibles (OPTIMIZADO PARA LOCAL)
     */
    public function getComics(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Select solo campos necesarios
        $query = Comic::select([
            'id', 'titulo', 'descripcion', 'autor', 'imagen', 'genero', 
            'is_premium', 'popularidad', 'created_at', 'uploaded_by'
        ]);

        if ($request->has('genre') && $request->input('genre')) {
            $query->where('genero', $request->input('genre'));
        }

        if ($request->has('search') && $request->input('search')) {
            $search = trim($request->input('search'));
            if (!empty($search)) {
                $query->where(function ($q) use ($search) {
                    $q->where('titulo', 'like', "%{$search}%")
                      ->orWhere('autor', 'like', "%{$search}%");
                });
            }
        }

        $orderBy = in_array($request->input('sort_by'), ['created_at', 'titulo', 'autor', 'popularidad']) ? $request->input('sort_by') : 'created_at';
        $order = strtolower($request->input('sort_order')) === 'asc' ? 'asc' : 'desc';

        if ($request->boolean('include_uploader', false)) {
            $query->with('uploader:id,name,profile_photo_path');
        }

        $perPage = min((int) $request->input('per_page', 12), 50);
        $comics = $query->orderBy($orderBy, $order)->paginate($perPage);
        
        // Agregar headers de cache HTTP
        $etag = md5(json_encode($comics->items()) . $perPage . $request->input('page', 1));
        
        return response()->json($comics)
            ->header('Cache-Control', 'public, max-age=300')
            ->header('ETag', $etag)
            ->header('X-Content-Type-Options', 'nosniff');
    }

    /**
     * Obtener un cómic específico
     */
    public function getComic(Request $request, Comic $comic): JsonResponse
    {
        $user = $request->user();

        if ($comic->is_premium && (!$user || (!$user->isAdmin() && !$user->isPremium()))) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $comic->incrementPopularity();
        if ($user) {
            ActivityLog::log('view', $user, 'Comic', $comic->id);
        }

        return response()->json(['comic' => $comic->load('uploader')]);
    }

    /**
     * Crear un nuevo cómic
     */
    public function createComic(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isAdmin() && !$user->isPremium()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'titulo' => 'required|string|max:255',
            'descripcion' => 'required|string',
            'autor' => 'required|string|max:255',
            'genero' => 'required|string|max:100',
            'pdf' => 'required|file|mimes:pdf|max:50000',
            'imagen' => 'sometimes|image|mimes:jpeg,png,jpg|max:5000',
        ]);

        try {
            $pdfPath = $request->file('pdf')->store('pdfs/comics', 'public_direct');
            $imagenPath = $request->hasFile('imagen') 
                ? $request->file('imagen')->store('images/comics', 'public_direct') 
                : null;

            $comic = Comic::create([
                'titulo' => $validated['titulo'],
                'descripcion' => $validated['descripcion'],
                'autor' => $validated['autor'],
                'genero' => $validated['genero'],
                'pdf' => $pdfPath,
                'imagen' => $imagenPath,
                'is_premium' => false,
                'uploaded_by' => $user->id,
            ]);

            ActivityLog::log('create', $user, 'Comic', $comic->id);

            return response()->json(['message' => 'Cómic creado', 'comic' => $comic], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al crear cómic', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Actualizar cómic
     */
    public function updateComic(UpdateComicRequest $request, Comic $comic): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'No autenticado'], 401);
        }

        // Si uploaded_by es null, solo admin puede editar
        // Si tienen propietario, solo admin o propietario pueden editar
        $isOwner = $comic->uploaded_by && $comic->uploaded_by === $user->id;
        $isAdmin = method_exists($user, 'isAdmin') && $user->isAdmin();

        if (!$isAdmin && !$isOwner) {
            return response()->json(['message' => 'No tienes permiso para editar este cómic'], 403);
        }

        try {
            // Usar validación del Form Request
            $validated = $request->validated();

            // Convertir valores 0/1 a booleanos si es necesario
            if (isset($validated['is_premium'])) {
                $validated['is_premium'] = (bool) $validated['is_premium'];
            }
            if (isset($validated['tiene_derechos_autor'])) {
                $validated['tiene_derechos_autor'] = (bool) $validated['tiene_derechos_autor'];
            }

            // Manejar carga de imagen
            if ($request->hasFile('imagen')) {
                try {
                    Log::info('PROCESANDO_IMAGEN_COMIC', ['comic_id' => $comic->id]);
                    
                    // Eliminar imagen anterior si existe
                    if ($comic->imagen) {
                        Log::info('BORRANDO_IMAGEN_ANTERIOR', ['imagen' => $comic->imagen]);
                        if (Storage::disk('public_direct')->exists($comic->imagen)) {
                            Storage::disk('public_direct')->delete($comic->imagen);
                            Log::info('IMAGEN_ANTERIOR_ELIMINADA');
                        }
                    }

                    // Guardar nueva imagen en public/storage/images/comics/
                    $file = $request->file('imagen');
                    $originalName = $file->getClientOriginalName();
                    $fileSize = $file->getSize();
                    $fileName = time() . '_' . uniqid() . '_' . basename($originalName);
                    $imagenPath = $file->storeAs('images/comics', $fileName, 'public_direct');
                    
                    $fullPath = public_path('storage/' . $imagenPath);
                    $fileExists = file_exists($fullPath);
                    $diskExists = Storage::disk('public_direct')->exists($imagenPath);
                    
                    Log::info('IMAGEN_GUARDADA', [
                        'original_name' => $originalName,
                        'file_size' => $fileSize,
                        'stored_name' => $fileName,
                        'stored_path' => $imagenPath,
                        'disk_path' => $fullPath,
                        'file_exists' => $fileExists,
                        'disk_exists' => $diskExists,
                    ]);
                    
                    if ($fileExists && $diskExists) {
                        $validated['imagen'] = $imagenPath;
                    } else {
                        Log::error('IMAGEN_NO_SE_GUARDÓ', [
                            'file_exists' => $fileExists,
                            'disk_exists' => $diskExists,
                        ]);
                        throw new \Exception('No se pudo guardar la imagen en el disco');
                    }
                } catch (\Exception $e) {
                    Log::error('ERROR_AL_GUARDAR_IMAGEN_COMIC', [
                        'error' => $e->getMessage(),
                        'line' => $e->getLine(),
                    ]);
                    throw $e;
                }
            }

            // Manejar eliminación de PDF
            if ($request->has('delete_pdf') && $request->input('delete_pdf')) {
                if ($comic->pdf && Storage::disk('public_direct')->exists($comic->pdf)) {
                    Storage::disk('public_direct')->delete($comic->pdf);
                }
                $validated['pdf'] = null;
            }
            // Manejar carga de nuevo PDF
            elseif ($request->hasFile('pdf')) {
                // Eliminar PDF anterior si existe
                if ($comic->pdf && Storage::disk('public_direct')->exists($comic->pdf)) {
                    Storage::disk('public_direct')->delete($comic->pdf);
                }

                // Guardar nuevo PDF en public/storage/pdfs/comics/
                $pdfPath = $request->file('pdf')->store('pdfs/comics', 'public_direct');
                $validated['pdf'] = $pdfPath;
            }

            $comic->update($validated);
            ActivityLog::log('update', $user, 'Comic', $comic->id);
            return response()->json([
                'message' => 'Cómic actualizado',
                'data' => $comic->fresh()
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors(),
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error al actualizar',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Eliminar cómic
     */
    public function deleteComic(Request $request, Comic $comic): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        try {
            ActivityLog::log('delete', $user, 'Comic', $comic->id);
            $comic->delete();
            return response()->json(['message' => 'Cómic eliminado']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al eliminar', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Obtener un audiolibro específico
     */
    public function getAudiobook(Request $request, Audiobook $audiobook): JsonResponse
    {
        $user = $request->user();

        if ($audiobook->is_premium && (!$user || (!$user->isAdmin() && !$user->isPremium()))) {
            return response()->json(['message' => 'Acceso denegado'], 403);
        }

        $audiobook->incrementPopularity();
        if ($user) {
            ActivityLog::log('view', $user, 'Audiobook', $audiobook->id);
        }

        return response()->json(['audiobook' => $audiobook->load('uploader')]);
    }

    /**
     * Actualizar audiolibro
     */
    public function updateAudiobook(Request $request, Audiobook $audiobook): JsonResponse
    {
        $user = $request->user();
        
        Log::info('🎧 UPDATE AUDIOBOOK START:', [
            'user_id' => $user?->id,
            'audiobook_id' => $audiobook->id,
            'audiobook_titulo_actual' => $audiobook->titulo,
            'uploaded_by' => $audiobook->uploaded_by,
            'request_all' => $request->all(),
            'request_keys' => array_keys($request->all()),
            'has_files' => $request->hasFile('audio') || $request->hasFile('imagen')
        ]);
        
        if (!$user || (!$user->isAdmin() && $audiobook->uploaded_by !== $user->id)) {
            Log::warning('❌ NOT AUTHORIZED for audiobook update', [
                'user_id' => $user?->id,
                'audiobook_uploaded_by' => $audiobook->uploaded_by,
                'is_admin' => $user?->isAdmin()
            ]);
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'titulo' => 'sometimes|string|max:255',
            'descripcion' => 'sometimes|string',
            'autor' => 'sometimes|string|max:255',
            'narrador' => 'sometimes|string|max:255',
            'genero' => 'sometimes|string|max:100',
            'duracion_segundos' => 'sometimes|integer|min:1',
            'audio' => 'sometimes|file|mimes:mp3,wav,aac,flac|max:500000',
            'imagen' => 'sometimes|image|max:5000000',
            'is_premium' => 'sometimes|boolean',
        ]);

        Log::info('✅ Validated data RECEIVED:', [
            'titulo' => $validated['titulo'] ?? 'NO CHANGE',
            'descripcion' => $validated['descripcion'] ?? 'NO CHANGE',
            'autor' => $validated['autor'] ?? 'NO CHANGE',
            'has_audio' => isset($validated['audio']),
            'has_imagen' => isset($validated['imagen']),
            'validated_keys' => array_keys($validated),
        ]);

        try {
            // Manejar carga de audio
            if ($request->hasFile('audio')) {
                Log::info('🎵 Updating audio file');
                // Eliminar audio anterior si existe
                if ($audiobook->archivo_audio && Storage::disk('public_direct')->exists($audiobook->archivo_audio)) {
                    Storage::disk('public_direct')->delete($audiobook->archivo_audio);
                    Log::info('Deleted old audio: ' . $audiobook->archivo_audio);
                }
                $audioPath = $request->file('audio')->store('audios/audiobooks', 'public_direct');
                $validated['archivo_audio'] = $audioPath;
                Log::info('New audio path: ' . $audioPath);
            }

            // Manejar carga de imagen
            if ($request->hasFile('imagen')) {
                Log::info('🖼️  Updating image file');
                // Eliminar imagen anterior si existe
                if ($audiobook->imagen && Storage::disk('public_direct')->exists($audiobook->imagen)) {
                    Storage::disk('public_direct')->delete($audiobook->imagen);
                    Log::info('Deleted old image: ' . $audiobook->imagen);
                }
                $imagenPath = $request->file('imagen')->store('images/audiobooks', 'public_direct');
                $validated['imagen'] = $imagenPath;
                Log::info('New image path: ' . $imagenPath);
            }

            Log::info('📝 About to UPDATE database with:', $validated);
            Log::info('📝 Audiobook state BEFORE update:', [
                'titulo' => $audiobook->titulo,
                'descripcion' => $audiobook->descripcion,
            ]);
            
            $audiobook->update($validated);
            
            Log::info('📝 Audiobook state AFTER update (before refresh):', [
                'titulo' => $audiobook->titulo,
                'descripcion' => $audiobook->descripcion,
            ]);
            
            ActivityLog::log('update', $user, 'Audiobook', $audiobook->id);
            $audiobook->refresh();
            
            Log::info('✅ UPDATE SUCCESS - AFTER REFRESH:', [
                'audiobook_id' => $audiobook->id,
                'titulo' => $audiobook->titulo,
                'descripcion' => $audiobook->descripcion,
                'updated_at' => $audiobook->updated_at
            ]);
            
            return response()->json(['message' => 'Audiolibro actualizado exitosamente', 'audiobook' => $audiobook]);
        } catch (\Exception $e) {
            Log::error('❌ UPDATE ERROR:', [
                'audiobook_id' => $audiobook->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Error al actualizar', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * Eliminar audiolibro
     */
    public function deleteAudiobook(Request $request, Audiobook $audiobook): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isAdmin()) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        try {
            ActivityLog::log('delete', $user, 'Audiobook', $audiobook->id);
            $audiobook->delete();
            return response()->json(['message' => 'Audiolibro eliminado']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error al eliminar', 'error' => $e->getMessage()], 500);
        }
    }
}
