#!/bin/bash

# Script de despliegue para Raspberry Pi 5
# Haizea-Llevant Test Digitalizado

echo "🚀 Desplegando Haizea-Llevant en Raspberry Pi 5..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Verificar que estamos en Raspberry Pi
if ! grep -q "Raspberry Pi" /proc/cpuinfo 2>/dev/null; then
    warning "Este script está optimizado para Raspberry Pi"
fi

# Verificar Docker
if ! command -v docker &> /dev/null; then
    error "Docker no está instalado. Instalando..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    log "Docker instalado. Necesitas reiniciar sesión para usar Docker sin sudo"
    exit 1
fi

# Verificar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    error "Docker Compose no está instalado. Instalando..."
    sudo apt-get update
    sudo apt-get install -y docker-compose
fi

# Crear directorios necesarios
log "Creando directorios..."
mkdir -p data logs

# Construir imagen Docker
log "Construyendo imagen Docker..."
if docker build -t haizea-llevant:latest .; then
    log "✅ Imagen construida exitosamente"
else
    error "❌ Error al construir imagen Docker"
    exit 1
fi

# Detener contenedores existentes
log "Deteniendo contenedores existentes..."
docker-compose down

# Iniciar servicios
log "Iniciando servicios..."
if docker-compose up -d; then
    log "✅ Servicios iniciados exitosamente"
else
    error "❌ Error al iniciar servicios"
    exit 1
fi

# Esperar a que el servicio esté disponible
log "Esperando a que el servicio esté disponible..."
sleep 10

# Verificar salud del servicio
for i in {1..12}; do
    if curl -f http://localhost:3000/api/health &>/dev/null; then
        log "✅ Servicio disponible en http://localhost:3000"
        break
    fi
    
    if [ $i -eq 12 ]; then
        error "❌ El servicio no responde después de 60 segundos"
        docker-compose logs
        exit 1
    fi
    
    echo "Esperando... ($i/12)"
    sleep 5
done

# Mostrar información del sistema
log "=== INFORMACIÓN DEL DESPLIEGUE ==="
echo -e "${BLUE}📱 Aplicación:${NC} Haizea-Llevant Test Digitalizado"
echo -e "${BLUE}🌐 URL Local:${NC} http://localhost:3000"
echo -e "${BLUE}🌐 URL Red:${NC} http://$(hostname -I | awk '{print $1}'):3000"
echo -e "${BLUE}📊 Estado:${NC} $(docker-compose ps --services --filter status=running | wc -l) servicios ejecutándose"
echo -e "${BLUE}💾 Memoria:${NC} $(docker stats --no-stream --format "table {{.Container}}\t{{.MemUsage}}" | tail -n +2)"
echo

log "=== COMANDOS ÚTILES ==="
echo "📋 Ver logs:           docker-compose logs -f"
echo "📊 Ver estadísticas:   docker stats"
echo "🔄 Reiniciar:          docker-compose restart"
echo "⏹️  Parar:              docker-compose down"
echo "🔧 Entrar al contenedor: docker exec -it haizea-llevant-app sh"
echo

log "🎉 ¡Despliegue completado exitosamente!"
echo -e "${GREEN}Accede a la aplicación en: http://$(hostname -I | awk '{print $1}'):3000${NC}"