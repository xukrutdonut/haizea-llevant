#!/bin/bash

# Script de gestión para Haizea-Llevant
# Comandos: start, stop, restart, logs, status, update

COMPOSE_FILE="docker-compose.yml"
SERVICE_NAME="haizea-llevant"

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

show_usage() {
    echo -e "${BLUE}Uso: $0 {start|stop|restart|logs|status|update|health}${NC}"
    echo
    echo "Comandos disponibles:"
    echo "  start    - Iniciar la aplicación"
    echo "  stop     - Parar la aplicación"
    echo "  restart  - Reiniciar la aplicación"
    echo "  logs     - Mostrar logs en tiempo real"
    echo "  status   - Mostrar estado de los servicios"
    echo "  update   - Actualizar y reconstruir"
    echo "  health   - Verificar salud del servicio"
}

start_service() {
    log "Iniciando Haizea-Llevant..."
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        log "✅ Servicio iniciado exitosamente"
        sleep 5
        show_status
    else
        error "❌ Error al iniciar el servicio"
        exit 1
    fi
}

stop_service() {
    log "Deteniendo Haizea-Llevant..."
    docker-compose down
    
    if [ $? -eq 0 ]; then
        log "✅ Servicio detenido exitosamente"
    else
        error "❌ Error al detener el servicio"
        exit 1
    fi
}

restart_service() {
    log "Reiniciando Haizea-Llevant..."
    docker-compose restart
    
    if [ $? -eq 0 ]; then
        log "✅ Servicio reiniciado exitosamente"
        sleep 5
        show_status
    else
        error "❌ Error al reiniciar el servicio"
        exit 1
    fi
}

show_logs() {
    log "Mostrando logs (Ctrl+C para salir)..."
    docker-compose logs -f
}

show_status() {
    echo -e "${BLUE}=== ESTADO DEL SERVICIO ===${NC}"
    
    # Estado de contenedores
    echo "📦 Contenedores:"
    docker-compose ps
    
    echo
    echo "🌐 URLs disponibles:"
    LOCAL_IP=$(hostname -I | awk '{print $1}')
    echo "  • Local: http://localhost:3000"
    echo "  • Red:   http://$LOCAL_IP:3000"
    
    # Verificar salud
    echo
    echo "💓 Estado de salud:"
    if curl -f http://localhost:3000/api/health &>/dev/null; then
        echo -e "  ${GREEN}✅ Servicio disponible${NC}"
    else
        echo -e "  ${RED}❌ Servicio no disponible${NC}"
    fi
    
    # Uso de recursos
    echo
    echo "📊 Uso de recursos:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -2
}

update_service() {
    log "Actualizando Haizea-Llevant..."
    
    # Parar servicio
    docker-compose down
    
    # Reconstruir imagen
    log "Reconstruyendo imagen..."
    docker build -t haizea-llevant:latest .
    
    if [ $? -eq 0 ]; then
        log "✅ Imagen reconstruida exitosamente"
        
        # Reiniciar servicio
        start_service
    else
        error "❌ Error al reconstruir la imagen"
        exit 1
    fi
}

check_health() {
    log "Verificando salud del servicio..."
    
    if curl -f -s http://localhost:3000/api/health | jq . 2>/dev/null; then
        log "✅ Servicio funcionando correctamente"
        return 0
    else
        error "❌ Servicio no disponible o con problemas"
        
        echo "Logs recientes:"
        docker-compose logs --tail=20
        return 1
    fi
}

# Verificar que docker-compose existe
if [ ! -f "$COMPOSE_FILE" ]; then
    error "No se encuentra $COMPOSE_FILE en el directorio actual"
    exit 1
fi

# Procesar comando
case "$1" in
    start)
        start_service
        ;;
    stop)
        stop_service
        ;;
    restart)
        restart_service
        ;;
    logs)
        show_logs
        ;;
    status)
        show_status
        ;;
    update)
        update_service
        ;;
    health)
        check_health
        ;;
    *)
        show_usage
        exit 1
        ;;
esac