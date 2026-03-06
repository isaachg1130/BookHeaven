#!/bin/bash

# Script para probar el endpoint de registro

echo "═══════════════════════════════════════════"
echo "   🧪 PRUEBA DE ENDPOINT /api/auth/register"
echo "═══════════════════════════════════════════"
echo ""

# Datos de prueba
NAME="Test User"
EMAIL="test_$(date +%s)@example.com"
PASSWORD="TestPassword123"

echo "📋 Datos de prueba:"
echo "  Nombre: $NAME"
echo "  Email: $EMAIL"
echo "  Password: $PASSWORD"
echo ""

echo "🚀 Enviando POST a http://localhost:8000/api/auth/register..."
echo ""

# Enviar solicitud
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d "{
    \"name\": \"$NAME\",
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"password_confirmation\": \"$PASSWORD\"
  }" \
  http://localhost:8000/api/auth/register 2>/dev/null | jq '.'

echo ""
echo "═══════════════════════════════════════════"
