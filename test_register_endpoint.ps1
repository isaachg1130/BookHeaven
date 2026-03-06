param()

# Script para probar el endpoint de registro

Write-Host "========================================"
Write-Host "   TEST ENDPOINT /api/auth/register"
Write-Host "========================================"
Write-Host ""

# Datos de prueba
$timestamp = [int64](([datetime]::UtcNow)-(New-Object datetime 1970,1,1)).TotalSeconds
$name = "Test User"
$email = "test_$timestamp@example.com"
$password = "TestPassword123"

Write-Host "Datos de prueba:"
Write-Host "  Nombre: $name"
Write-Host "  Email: $email"
Write-Host "  Password: $password"
Write-Host ""

# Preparar el body JSON
$body = @{
    name = $name
    email = $email
    password = $password
    password_confirmation = $password
} | ConvertTo-Json

Write-Host "Enviando POST a http://localhost:8000/api/auth/register..."
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/api/auth/register" `
        -Method POST `
        -Headers @{
            "Content-Type" = "application/json"
            "Accept" = "application/json"
        } `
        -Body $body `
        -UseBasicParsing

    Write-Host "Respuesta recibida:" -ForegroundColor Green
    Write-Host (($response.Content | ConvertFrom-Json) | ConvertTo-Json -Depth 10)
    Write-Host ""
    Write-Host "Status: $($response.StatusCode)"
} catch {
    Write-Host "Error:" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode"
        
        try {
            $responseBody = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($responseBody)
            $content = $reader.ReadToEnd()
            $reader.Close()
            
            Write-Host "Response Body:"
            Write-Host ($content | ConvertFrom-Json | ConvertTo-Json -Depth 10)
        } catch {
            Write-Host "Could not parse response"
            Write-Host $content
        }
    } else {
        Write-Host "Error: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "========================================"
