<?php
// Quick route debugger

$routes = [
    'GET /content/audiolibros' => 'getAudiobooks',
    'GET /content/audiolibros/{id}' => 'getAudiobook',
    'POST /content/audiolibros' => 'createAudiobook',
    'PUT /content/audiolibros/{id}' => 'updateAudiobook',
    'DELETE /content/audiolibros/{id}' => 'deleteAudiobook',
];

echo "✅ Routes configuration:\n";
foreach ($routes as $route => $method) {
    echo "  ✓ $route → $method\n";
}

echo "\n🔍 Frontend should call:\n";
echo "  PUT /api/content/audiolibros/6\n";
echo "  (with FormData containing title, image, audio, etc)\n";

echo "\n📝 If calling /content/audiobooks (old URL) → 404 error\n";
?>
