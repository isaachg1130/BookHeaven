#!/bin/bash

# Script de verificación rápida de optimizaciones
echo "🔍 Verificando Optimizaciones de Registro Rápido"
echo ""
echo "================================"

cd "$(dirname "$0")/backend" 2>/dev/null || {
    echo "Error: No se encuentra carpeta backend"
    exit 1
}

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}1. Verificando archivos creados...${NC}"
echo ""

FILES=(
    "app/Jobs/SendEmailVerification.php"
    "database/migrations/2026_03_02_add_auth_indexes.php"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file"
    fi
done

echo ""
echo -e "${BLUE}2. Verificando sintaxis PHP...${NC}"
echo ""

php -l "app/Jobs/SendEmailVerification.php" 2>&1 | grep -q "syntax errors" && {
    echo -e "${RED}❌ Error en SendEmailVerification.php${NC}"
} || {
    echo -e "${GREEN}✅${NC} SendEmailVerification.php"
}

php -l "app/Http/Controllers/API/AuthController.php" 2>&1 | grep -q "syntax errors" && {
    echo -e "${RED}❌ Error en AuthController.php${NC}"
} || {
    echo -e "${GREEN}✅${NC} AuthController.php"
}

php -l "database/migrations/2026_03_02_add_auth_indexes.php" 2>&1 | grep -q "syntax errors" && {
    echo -e "${RED}❌ Error en migración${NC}"
} || {
    echo -e "${GREEN}✅${NC} database/migrations/2026_03_02_add_auth_indexes.php"
}

echo ""
echo -e "${BLUE}3. Verificando configuración .env...${NC}"
echo ""

if grep -q "QUEUE_CONNECTION" .env; then
    QUEUE_VALUE=$(grep "QUEUE_CONNECTION" .env | cut -d'=' -f2)
    if [ "$QUEUE_VALUE" = "database" ]; then
        echo -e "${GREEN}✅${NC} QUEUE_CONNECTION=database"
    else
        echo -e "${YELLOW}⚠️${NC} QUEUE_CONNECTION=$QUEUE_VALUE (recomendado: database)"
    fi
else
    echo -e "${YELLOW}⚠️${NC} QUEUE_CONNECTION no configurado en .env"
fi

echo ""
echo -e "${BLUE}4. Verificando estado de migraciones...${NC}"
echo ""

php artisan migrate:status 2>/dev/null | grep "2026_03_02" && {
    echo -e "${GREEN}✅${NC} Migración de índices lista"
} || {
    echo -e "${YELLOW}⚠️${NC} Migración de índices no ejecutada (ejecuta: php artisan migrate)"
}

echo ""
echo "================================"
echo -e "${GREEN}✨ Verificación completada${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Ejecutar: php artisan migrate"
echo "2. En otra terminal: php artisan queue:work database --queue=emails"
echo "3. Probar registro en: http://localhost:8000/api/auth/register"
