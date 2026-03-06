<?php
$token = "7|TA6zYLntTnZxnOZB10YbGODKHNLDxcxCw7T0t4nT70421b54";

echo "=== Testing User Management API ===\n\n";

// 1. GET /api/admin/users - Listing users
echo "1. GET /api/admin/users - Listing users\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/admin/users?per_page=5');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: $httpCode\n";
if ($httpCode === 200) {
    $data = json_decode($response, true);
    echo "Users Count: " . count($data['data']['data']) . "\n";
    echo "Total: " . $data['data']['total'] . "\n";
    echo "First User: " . $data['data']['data'][0]['name'] . " (" . $data['data']['data'][0]['email'] . ")\n";
} else {
    echo "Error: " . $response . "\n";
}

echo "\n---\n\n";

// 2. GET /api/admin/roles - Get available roles
echo "2. GET /api/admin/roles - Get available roles\n";
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/admin/roles');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: $httpCode\n";
if ($httpCode === 200) {
    $data = json_decode($response, true);
    echo "Roles Available:\n";
    foreach ($data['data'] as $role) {
        echo "  - {$role['display_name']} (ID: {$role['id']})\n";
    }
} else {
    echo "Error: " . $response . "\n";
}

echo "\n---\n\n";

// 3. POST /api/admin/users - Create new user
echo "3. POST /api/admin/users - Create new user\n";
$newUser = [
    'name' => 'Test User ' . date('H:i:s'),
    'email' => 'test' . time() . '@example.com',
    'password' => 'password123',
    'role_id' => 3, // Standard role
    'bio' => 'Test user created from API'
];

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'http://localhost:8000/api/admin/users');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $token,
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($newUser));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "Status: $httpCode\n";
$data = json_decode($response, true);
if ($httpCode === 201) {
    echo "✅ User created: " . $data['data']['name'] . " (ID: " . $data['data']['id'] . ")\n";
    $newUserId = $data['data']['id'];
} else {
    echo "Error: " . json_encode($data, JSON_PRETTY_PRINT) . "\n";
}

echo "\n---\n\n";

// 4. GET /api/admin/users/{id} - Get specific user
if (isset($newUserId)) {
    echo "4. GET /api/admin/users/{$newUserId} - Get specific user\n";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/api/admin/users/{$newUserId}");
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "Status: $httpCode\n";
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        echo "User: " . $data['data']['name'] . "\n";
        echo "Email: " . $data['data']['email'] . "\n";
    } else {
        echo "Error: " . $response . "\n";
    }

    echo "\n---\n\n";

    // 5. PUT /api/admin/users/{id} - Update user
    echo "5. PUT /api/admin/users/{$newUserId} - Update user\n";
    $updateData = [
        'name' => 'Updated ' . $newUser['name'],
        'bio' => 'Updated biography'
    ];

    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/api/admin/users/{$newUserId}");
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Content-Type: application/json',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'PUT');
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($updateData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "Status: $httpCode\n";
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        echo "✅ User updated: " . $data['data']['name'] . "\n";
    } else {
        echo "Error: " . $response . "\n";
    }

    echo "\n---\n\n";

    // 6. DELETE /api/admin/users/{id} - Delete user
    echo "6. DELETE /api/admin/users/{$newUserId} - Delete user\n";
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, "http://localhost:8000/api/admin/users/{$newUserId}");
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $token,
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    echo "Status: $httpCode\n";
    if ($httpCode === 200) {
        $data = json_decode($response, true);
        echo "✅ " . $data['message'] . "\n";
    } else {
        echo "Error: " . $response . "\n";
    }
}

echo "\n=== API Testing Complete ===\n";
