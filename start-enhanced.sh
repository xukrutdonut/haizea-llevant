#!/bin/bash

# Script de inicio mejorado para Haizea-Llevant
# Funciona tanto con Docker como con Node.js directo

echo "🚀 Iniciando Haizea-Llevant Test Digitalizado..."

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Crear directorios necesarios
mkdir -p data logs

# Verificar si Docker está disponible y configurado
if command -v docker &> /dev/null; then
    if docker info &> /dev/null; then
        log "Docker disponible y configurado"
        USE_DOCKER=true
    else
        warning "Docker instalado pero sin permisos. Añade tu usuario al grupo docker:"
        echo "  sudo usermod -aG docker $USER && newgrp docker"
        USE_DOCKER=false
    fi
else
    warning "Docker no está instalado"
    USE_DOCKER=false
fi

# Función para ejecutar con Docker
start_with_docker() {
    log "Iniciando con Docker..."
    
    # Detener contenedor existente si existe
    docker stop haizea-llevant-app 2>/dev/null || true
    docker rm haizea-llevant-app 2>/dev/null || true
    
    # Construir imagen
    log "Construyendo imagen Docker..."
    if docker build -t haizea-llevant:latest .; then
        log "✅ Imagen construida exitosamente"
    else
        error "❌ Error construyendo imagen Docker"
        return 1
    fi
    
    # Ejecutar contenedor
    log "Ejecutando contenedor..."
    docker run -d \
        --name haizea-llevant-app \
        -p 3000:3000 \
        --restart unless-stopped \
        -v "$(pwd)/data:/app/data" \
        -v "$(pwd)/logs:/app/logs" \
        -e NODE_ENV=production \
        -e PORT=3000 \
        -e TZ=Europe/Madrid \
        haizea-llevant:latest
    
    if [ $? -eq 0 ]; then
        log "✅ Contenedor iniciado exitosamente"
        return 0
    else
        error "❌ Error iniciando contenedor"
        return 1
    fi
}

# Función para ejecutar con Node.js directo
start_with_nodejs() {
    log "Iniciando con Node.js directo..."
    
    # Verificar Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js no está instalado"
        return 1
    fi
    
    # Verificar versión de Node.js
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        warning "Se recomienda Node.js >= 18. Versión actual: $(node --version)"
    fi
    
    # Instalar dependencias si es necesario
    if [ ! -d "node_modules" ]; then
        log "Instalando dependencias..."
        npm install
    fi
    
    # Detener proceso existente si existe
    pkill -f "node server.js" 2>/dev/null || true
    sleep 2
    
    # Configurar variables de entorno
    export NODE_ENV=production
    export PORT=3000
    export TZ=Europe/Madrid
    
    # Ejecutar servidor
    log "Ejecutando servidor Node.js..."
    nohup node server.js > logs/app.log 2>&1 &
    
    # Guardar PID
    echo $! > logs/server.pid
    
    log "✅ Servidor iniciado con PID $!"
    return 0
}

# Función para verificar salud del servicio
check_health() {
    log "Verificando salud del servicio..."
    
    for i in {1..12}; do
        if curl -f http://localhost:3000/api/health &>/dev/null; then
            log "✅ Servicio disponible en http://localhost:3000"
            return 0
        fi
        
        if [ $i -eq 12 ]; then
            error "❌ El servicio no responde después de 60 segundos"
            return 1
        fi
        
        echo "Esperando... ($i/12)"
        sleep 5
    done
}

# Mostrar información del sistema
show_info() {
    log "=== INFORMACIÓN DEL SERVICIO ==="
    echo -e "${BLUE}📱 Aplicación:${NC} Haizea-Llevant Test Digitalizado v2.0"
    echo -e "${BLUE}🌐 URL Local:${NC} http://localhost:3000"
    
    # Obtener IP local
    LOCAL_IP=$(hostname -I | awk '{print $1}' 2>/dev/null || echo "N/A")
    if [ "$LOCAL_IP" != "N/A" ]; then
        echo -e "${BLUE}🌐 URL Red:${NC} http://$LOCAL_IP:3000"
    fi
    
    echo -e "${BLUE}📊 Estado:${NC} Funcionando"
    echo -e "${BLUE}💾 Datos:${NC} ./data/"
    echo -e "${BLUE}📝 Logs:${NC} ./logs/"
    echo
    
    log "=== COMANDOS ÚTILES ==="
    echo "📋 Ver logs:           tail -f logs/app.log"
    if [ "$USE_DOCKER" = true ]; then
        echo "📊 Ver estadísticas:   docker stats haizea-llevant-app"
        echo "🔄 Reiniciar:          docker restart haizea-llevant-app"
        echo "⏹️  Parar:              docker stop haizea-llevant-app"
    else
        echo "📊 Ver procesos:       ps aux | grep 'node server.js'"
        echo "🔄 Reiniciar:          ./start-enhanced.sh"
        echo "⏹️  Parar:              pkill -f 'node server.js'"
    fi
}

# Ejecutar aplicación
main() {
    if [ "$USE_DOCKER" = true ] && [ "${1:-}" != "--nodejs" ]; then
        if start_with_docker; then
            check_health && show_info
        else
            warning "Docker falló, intentando con Node.js..."
            start_with_nodejs && check_health && show_info
        fi
    else
        start_with_nodejs && check_health && show_info
    fi
}

# Procesar argumentos
case "${1:-}" in
    --docker)
        USE_DOCKER=true
        start_with_docker && check_health && show_info
        ;;
    --nodejs)
        start_with_nodejs && check_health && show_info
        ;;
    --help)
        echo "Uso: $0 [--docker|--nodejs|--help]"
        echo "  --docker   Forzar uso de Docker"
        echo "  --nodejs   Forzar uso de Node.js directo"
        echo "  --help     Mostrar esta ayuda"
        ;;
    *)
        main
        ;;
esac