#!/bin/sh
# Script de inicio mejorado para Haizea-Llevant

echo "🚀 Iniciando Haizea-Llevant..."

# Verificar y crear directorios necesarios
echo "📁 Verificando directorios..."
mkdir -p /app/data /app/logs /tmp/haizea-data
chmod 755 /app/data /app/logs /tmp/haizea-data 2>/dev/null || echo "⚠️ No se pudieron establecer permisos específicos"

# Verificar permisos de escritura
echo "🔐 Verificando permisos de escritura..."
if [ -w /app/data ]; then
    echo "✅ Directorio /app/data escribible"
else
    echo "⚠️ Directorio /app/data no escribible, usando /tmp/haizea-data"
fi

# Verificar conectividad interna
echo "🔗 Verificando configuración..."
echo "   - Usuario: $(whoami)"
echo "   - UID: $(id -u)"
echo "   - Directorio de trabajo: $(pwd)"
echo "   - Node.js: $(node --version)"
echo "   - NPM: $(npm --version)"

# Iniciar aplicación
echo "🎯 Iniciando servidor Node.js..."
exec node server.js