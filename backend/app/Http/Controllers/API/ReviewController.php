<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Review;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class ReviewController extends Controller
{
    /**
     * Get recent reviews for a specific content.
     */
    public function index(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'content_type' => 'required|string|in:libro,manga,comic,audiobook',
            'content_id' => 'required|integer',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $reviews = Review::where('content_type', $request->content_type)
            ->where('content_id', $request->content_id)
            ->with('user:id,name,profile_photo_path') // Eager load minimal user data
            ->orderBy('created_at', 'desc')
            ->paginate($request->per_page ?? 10);

        // Calculate average rating
        $averageRating = Review::where('content_type', $request->content_type)
            ->where('content_id', $request->content_id)
            ->avg('rating');

        return response()->json([
            'reviews' => $reviews,
            'average_rating' => round($averageRating, 1),
            'total_reviews' => $reviews->total(),
        ]);
    }

    /**
     * Store a newly created review in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'content_type' => 'required|string|in:libro,manga,comic,audiobook',
            'content_id' => 'required|integer',
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Check if user already reviewed this content
        $existingReview = Review::where('user_id', $user->id)
            ->where('content_type', $request->content_type)
            ->where('content_id', $request->content_id)
            ->first();

        if ($existingReview) {
            return response()->json([
                'message' => 'Ya has enviado una reseña para este contenido.',
            ], 409); // Conflict
        }

        $review = Review::create([
            'user_id' => $user->id,
            'content_type' => $request->content_type,
            'content_id' => $request->content_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        // Log activity
        if (class_exists(ActivityLog::class)) {
            ActivityLog::log('review', $user, ucfirst($request->content_type), $request->content_id);
        }

        return response()->json([
            'message' => 'Reseña creada exitosamente',
            'review' => $review->load('user:id,name,profile_photo_path'),
        ], 201);
    }

    /**
     * Remove the specified review from storage.
     */
    public function destroy(Request $request, Review $review): JsonResponse
    {
        $user = $request->user();

        // Allow deletion if user owns the review or is admin
        if ($user->id !== $review->user_id && !$user->isAdmin()) {
            return response()->json([
                'message' => 'No tienes permiso para eliminar esta reseña',
            ], 403);
        }

        $review->delete();

        return response()->json([
            'message' => 'Reseña eliminada exitosamente',
        ]);
    }
}
