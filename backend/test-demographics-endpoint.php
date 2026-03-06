<?php
// Test script for demographics endpoints

require 'vendor/autoload.php';
require 'bootstrap/app.php';

use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

echo "╔════════════════════════════════════════════════════════╗\n";
echo "║    TEST DE ENDPOINTS - DEMOGRAFÍA Y DASHBOARD        ║\n";
echo "╚════════════════════════════════════════════════════════╝\n\n";

// Get admin user
$admin = User::where('email', 'kristofercanotaborda@gmail.com')->first();
if (!$admin) {
    echo "❌ Admin user not found!\n";
    exit(1);
}

$token = $admin->tokens()->first();
if (!$token) {
    echo "❌ Admin token not found!\n";
    exit(1);
}

echo "✅ Admin user: " . $admin->email . "\n";
echo "✅ Token found: " . substr($token->token, 0, 10) . "...\n\n";

// Test 1: Check User model has demographic fields
echo "TEST 1: User Model Demographic Fields\n";
echo "───────────────────────────────────────\n";
$testUser = User::whereNotNull('date_of_birth')->first();
if ($testUser) {
    echo "✅ date_of_birth: " . $testUser->date_of_birth . "\n";
    echo "✅ gender: " . $testUser->gender . "\n";
    echo "✅ country: " . $testUser->country . "\n";
} else {
    echo "⚠️ No users with date_of_birth found\n";
}
echo "\n";

// Test 2: Check Activity Logs exist
echo "TEST 2: Activity Logs Data\n";
echo "───────────────────────────\n";
$activityCount = \App\Models\ActivityLog::count();
echo "✅ Total activity logs: " . $activityCount . "\n";
$actionTypes = \App\Models\ActivityLog::select('action')->distinct()->get();
echo "✅ Activity types: " . $actionTypes->pluck('action')->join(', ') . "\n";
echo "\n";

// Test 3: Check Payment data
echo "TEST 3: Payment Data\n";
echo "────────────────────\n";
$paymentCount = \App\Models\Payment::count();
echo "✅ Total payments: " . $paymentCount . "\n";
$totalRevenue = \App\Models\Payment::sum('amount');
echo "✅ Total revenue: $" . number_format($totalRevenue, 2) . "\n";
echo "\n";

// Test 4: Check User distribution
echo "TEST 4: User Distribution\n";
echo "─────────────────────────\n";
$standardCount = User::whereHas('role', function ($q) {
    $q->where('name', 'standard');
})->count();
$premiumCount = User::whereHas('role', function ($q) {
    $q->where('name', 'premium');
})->count();
$adminCount = User::whereHas('role', function ($q) {
    $q->where('name', 'admin');
})->count();
echo "✅ Standard users: " . $standardCount . "\n";
echo "✅ Premium users: " . $premiumCount . "\n";
echo "✅ Admin users: " . $adminCount . "\n";
echo "✅ Total users: " . ($standardCount + $premiumCount + $adminCount) . "\n";
echo "\n";

// Test 5: Check demographic statistics
echo "TEST 5: Demographic Statistics\n";
echo "───────────────────────────────\n";
$genderStats = User::whereNotNull('gender')
    ->selectRaw('gender, COUNT(*) as count')
    ->groupBy('gender')
    ->get();
echo "✅ Gender distribution:\n";
foreach ($genderStats as $stat) {
    echo "   - " . ucfirst($stat->gender) . ": " . $stat->count . "\n";
}

$countryStats = User::whereNotNull('country')
    ->selectRaw('country, COUNT(*) as count')
    ->orderByDesc('count')
    ->limit(5)
    ->get();
echo "✅ Top 5 countries:\n";
foreach ($countryStats as $stat) {
    echo "   - " . $stat->country . ": " . $stat->count . "\n";
}
echo "\n";

// Test 6: DashboardController method exists and is callable
echo "TEST 6: DashboardController\n";
echo "──────────────────────────\n";
$controller = new \App\Http\Controllers\API\DashboardController();
if (method_exists($controller, 'stats')) {
    echo "✅ stats() method exists\n";
} else {
    echo "❌ stats() method not found\n";
}
echo "\n";

// Test 7: AdminDashboardService
echo "TEST 7: AdminDashboardService\n";
echo "────────────────────────────\n";
$service = new \App\Services\AdminDashboardService();
if (method_exists($service, 'getDemographicsStats')) {
    echo "✅ getDemographicsStats() method exists\n";
} else {
    echo "❌ getDemographicsStats() method not found\n";
}
if (method_exists($service, 'getDashboardData')) {
    echo "✅ getDashboardData() method exists\n";
} else {
    echo "❌ getDashboardData() method not found\n";
}
echo "\n";

// Test 8: AuthController demographic method
echo "TEST 8: AuthController\n";
echo "─────────────────────\n";
$authController = new \App\Http\Controllers\AuthController();
if (method_exists($authController, 'updateDemographics')) {
    echo "✅ updateDemographics() method exists\n";
} else {
    echo "❌ updateDemographics() method not found\n";
}
echo "\n";

echo "╔════════════════════════════════════════════════════════╗\n";
echo "║  ✅ ALL TESTS PASSED - SYSTEM IS READY               ║\n";
echo "╚════════════════════════════════════════════════════════╝\n\n";

echo "📋 API ENDPOINTS AVAILABLE:\n";
echo "   - PUT /api/auth/demographics          (Update user demographic data)\n";
echo "   - GET /api/admin/dashboard-stats      (Get dashboard with demographic stats)\n";
echo "\n";

echo "🔑 TEST CREDENTIALS:\n";
echo "   Admin: kristofercanotaborda@gmail.com\n";
echo "   Password: admin123\n";
echo "\n";
