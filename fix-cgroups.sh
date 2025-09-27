#!/bin/bash

# Script de corrección para problemas de cgroups en Docker
# Soluciona el warning: "Your kernel does not support memory soft limit capabilities"

echo "🔧 Corrigiendo configuración de Docker para evitar warnings de cgroups..."

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

# Verificar tipo de sistema
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VERSION=$VERSION_ID
    log "Sistema detectado: $OS $VERSION"
fi

# Opción 1: Usar docker-compose sin límites de memoria
log "Opción 1: Crear docker-compose sin límites de memoria"
echo "Si quieres evitar completamente el warning, usa:"
echo "  docker-compose -f docker-compose-simple.yml up -d"

# Opción 2: Habilitar cgroups v2 (requiere privilegios)
if [ "$EUID" -eq 0 ]; then
    log "Opción 2: Intentando habilitar cgroups v2..."
    
    # Verificar si cgroups v2 está disponible
    if [ -d /sys/fs/cgroup/unified ]; then
        log "cgroups v2 ya disponible"
    else
        warning "cgroups v2 no está disponible en este sistema"
    fi
    
    # Verificar configuración de grub
    if [ -f /etc/default/grub ]; then
        if grep -q "systemd.unified_cgroup_hierarchy=1" /etc/default/grub; then
            log "cgroups v2 ya configurado en GRUB"
        else
            warning "Para habilitar cgroups v2 permanentemente, añade a /etc/default/grub:"
            echo "GRUB_CMDLINE_LINUX=\"systemd.unified_cgroup_hierarchy=1\""
            echo "Y ejecuta: sudo update-grub && sudo reboot"
        fi
    fi
else
    warning "Ejecuta como root para intentar correcciones automáticas"
    echo "O simplemente ignora el warning - la aplicación funcionará correctamente"
fi

# Opción 3: Verificar Docker daemon
log "Opción 3: Verificar configuración de Docker daemon"
if [ -f /etc/docker/daemon.json ]; then
    log "Archivo daemon.json encontrado:"
    cat /etc/docker/daemon.json
else
    log "Creando configuración básica de Docker daemon..."
    if [ "$EUID" -eq 0 ]; then
        mkdir -p /etc/docker
        cat > /etc/docker/daemon.json << EOF
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF
        log "Configuración creada. Reinicia Docker: sudo systemctl restart docker"
    else
        warning "Se requieren privilegios de root para crear /etc/docker/daemon.json"
    fi
fi

# Opción 4: Solución simple - usar docker run directamente
log "Opción 4: Comando Docker run directo (sin warnings)"
echo "docker run -d --name haizea-llevant-app -p 3000:3000 haizea-llevant:latest"

log "Resumen de soluciones:"
echo "1. 🟢 Usar docker-compose-simple.yml (sin límites)"
echo "2. 🟡 Habilitar cgroups v2 (requiere reinicio)"
echo "3. 🟡 Configurar Docker daemon (requiere root)"
echo "4. 🟢 Usar docker run directo"
echo "5. 🔵 Ignorar el warning (no afecta funcionalidad)"

log "¡El warning no impide que la aplicación funcione correctamente!"