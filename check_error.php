<?php
$context = stream_context_create([
    'http' => [
        'ignore_errors' => true
    ],
    'ssl' => [
        'verify_peer' => false,
        'verify_peer_name' => false
    ]
]);
$response = file_get_contents('https://api.digitalcoreapp.com/api/debug/auth', false, $context);
echo $response;
