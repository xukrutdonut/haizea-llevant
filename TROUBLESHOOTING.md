# 🛠️ Guía de Solución de Problemas - Haizea-Llevant

## 🐳 Problemas Comunes de Docker

### ❌ Error: "Your kernel does not support memory soft limit capabilities"

**Problema:** Aparece el warning al usar `docker-compose up`:
```
Your kernel does not support memory soft limit capabilities or the cgroup is not mounted. Limitation discarded.
```

**Soluciones:**

#### ✅ Solución 1: Usar configuración compatible (Recomendada)
```bash
# Usar docker-compose con límites compatibles
docker-compose -f docker-compose-compatible.yml up -d

# O usar la versión sin límites
docker-compose -f docker-compose-simple.yml up -d
```

#### ✅ Solución 2: Ejecutar con Node.js directamente
```bash
# Script mejorado que detecta automáticamente la mejor opción
./start-enhanced.sh --nodejs
```

#### ✅ Solución 3: Usar Docker directo (evita docker-compose)
```bash
# Construir imagen
docker build -t haizea-llevant:latest .

# Ejecutar contenedor
docker run -d \
  --name haizea-llevant-app \
  -p 3000:3000 \
  --restart unless-stopped \
  -v "$(pwd)/data:/app/data" \
  -v "$(pwd)/logs:/app/logs" \
  haizea-llevant:latest
```

### ❌ Error: "permission denied while trying to connect to the Docker daemon socket"

**Problema:** No tienes permisos para usar Docker.

**Solución:**
```bash
# Añadir usuario al grupo docker
sudo usermod -aG docker $USER

# Aplicar cambios (requiere reiniciar sesión o usar)
newgrp docker

# Verificar que funciona
docker info
```

### ❌ Error: "docker-compose: command not found"

**Problema:** Docker Compose no está instalado.

**Soluciones:**

#### Instalar docker-compose
```bash
# Ubuntu/Debian
sudo apt-get update && sudo apt-get install docker-compose

# O usar pip
pip install docker-compose
```

#### Usar Docker Compose v2 (integrado)
```bash
# En lugar de docker-compose, usar:
docker compose up -d
```

#### Usar script mejorado (sin dependencias)
```bash
# Nuestro script detecta automáticamente las herramientas disponibles
./start-enhanced.sh
```

## 🚀 Scripts de Inicio Disponibles

### 1. Script Automático (Recomendado)
```bash
./start-enhanced.sh
# Detecta automáticamente Docker/Node.js y usa la mejor opción
```

### 2. Forzar Node.js
```bash
./start-enhanced.sh --nodejs
# Siempre usa Node.js directo (sin Docker)
```

### 3. Forzar Docker
```bash
./start-enhanced.sh --docker
# Intenta usar Docker (si está disponible)
```

### 4. Despliegue Original
```bash
./deploy-rpi.sh
# Script original optimizado para Raspberry Pi 5
```

## 🔧 Configuraciones Docker Disponibles

### `docker-compose.yml` (Principal)
- Configuración con límites de memoria compatibles
- Evita warnings de cgroups en la mayoría de sistemas

### `docker-compose-compatible.yml` 
- Configuración alternativa con `mem_limit`
- Para sistemas con cgroups v1

### `docker-compose-simple.yml`
- Sin límites de recursos
- Para sistemas con restricciones de cgroups

## 🏥 Verificación de Funcionamiento

### Verificar que la aplicación está funcionando:
```bash
# Verificar API
curl http://localhost:3000/api/health

# Verificar interfaz web
curl -I http://localhost:3000/

# Ver logs en tiempo real
tail -f logs/app.log
```

### URLs de Acceso:
- **Local:** http://localhost:3000
- **Red:** http://[IP-del-sistema]:3000

## 📊 Monitoreo y Logs

### Con Docker:
```bash
# Ver logs del contenedor
docker logs haizea-llevant-app -f

# Ver estadísticas de recursos
docker stats haizea-llevant-app

# Entrar al contenedor
docker exec -it haizea-llevant-app sh
```

### Con Node.js:
```bash
# Ver logs de la aplicación
tail -f logs/app.log

# Ver proceso
ps aux | grep "node server.js"

# Ver PID guardado
cat logs/server.pid
```

## 🛑 Parar la Aplicación

### Docker:
```bash
docker stop haizea-llevant-app
docker rm haizea-llevant-app
```

### Node.js:
```bash
pkill -f "node server.js"
# O usar el PID guardado:
kill $(cat logs/server.pid)
```

## 🎯 Recomendaciones por Sistema

### Ubuntu/Debian:
1. Usar `start-enhanced.sh` (detecta automáticamente)
2. Si hay problemas con Docker: `start-enhanced.sh --nodejs`

### Raspberry Pi 5:
1. Usar `deploy-rpi.sh` (optimizado específicamente)
2. Si hay warnings: usar `docker-compose-simple.yml`

### Sistemas con cgroups limitados:
1. Usar `start-enhanced.sh --nodejs`
2. O `docker-compose-simple.yml`

## 📞 Soporte

Si tienes problemas:

1. **Ejecuta el script de diagnóstico:**
   ```bash
   ./fix-cgroups.sh
   ```

2. **Verifica requisitos:**
   - Node.js >= 18.0
   - Docker >= 20.0 (opcional)
   - Puertos 3000 disponible

3. **Consulta logs:**
   ```bash
   tail -f logs/app.log
   ```

---

💡 **Nota:** La aplicación funciona perfectamente tanto con Docker como con Node.js directo. Los warnings de cgroups no afectan la funcionalidad.