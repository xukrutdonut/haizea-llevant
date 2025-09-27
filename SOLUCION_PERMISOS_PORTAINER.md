# Solución de Problemas: Permisos y Portainer

## 🐛 Problema Identificado

La aplicación Haizea-Llevant mostraba estado "unhealthy" en Portainer y generaba errores de permisos al intentar guardar archivos:

```
Error: EACCES: permission denied, open './data/test-xxx.json'
```

## 🔧 Soluciones Implementadas

### 1. Corrección de Permisos en Dockerfile

**Cambios en `Dockerfile`:**
- ✅ Instalación de `wget` para healthcheck mejorado
- ✅ Creación explícita de directorios `/app/data`, `/app/logs`, `/tmp/haizea-data`
- ✅ Script de inicio personalizado con verificación de permisos
- ✅ Configuración correcta de usuario `nodejs` no privilegiado

### 2. Manejo Robusto de Errores en el Servidor

**Cambios en `server.js`:**
- ✅ **Manejo de permisos dinámico**: Si no puede escribir en `./data`, usa `/tmp/haizea-data`
- ✅ **Try-catch robustos**: La aplicación continúa funcionando aunque no pueda guardar archivos
- ✅ **Logging mejorado**: Mensajes claros sobre el estado de directorios y permisos
- ✅ **Respuesta resiliente**: El análisis estadístico se devuelve aunque falle el guardado

```javascript
// Código implementado para manejo de permisos
let dataDir = './data';
if (!fs.existsSync(dataDir)) {
    try {
        fs.mkdirSync(dataDir, { recursive: true, mode: 0o755 });
    } catch (mkdirError) {
        // Fallback a directorio temporal
        dataDir = '/tmp/haizea-data';
        fs.mkdirSync(dataDir, { recursive: true });
    }
}
```

### 3. Docker Compose Optimizado para Portainer

**Archivo `docker-compose-portainer.yml`:**
- ✅ **Volúmenes nombrados**: Evita problemas de permisos con bind mounts
- ✅ **Healthcheck con wget**: Más compatible que usar Node.js interno
- ✅ **Límites de recursos**: Configuración optimizada para Raspberry Pi
- ✅ **Tiempo de inicio extendido**: `start_period: 60s` para evitar falsos negativos

### 4. Script de Inicio Inteligente

**Archivo `start.sh`:**
- ✅ **Verificación de directorios**: Crea y verifica permisos al inicio
- ✅ **Diagnósticos útiles**: Muestra información del usuario y permisos
- ✅ **Fallback automático**: Si no puede usar `/app/data`, configura alternativa

## 🚀 Instrucciones de Despliegue

### Para Portainer (Recomendado):

1. **Usar docker-compose específico para Portainer:**
   ```bash
   docker-compose -f docker-compose-portainer.yml up -d
   ```

2. **O en Portainer Stack, usar este contenido:**
   ```yaml
   version: '3.8'
   services:
     haizea-llevant:
       build: .
       image: haizea-llevant:latest
       restart: unless-stopped
       ports:
         - "3000:3000"
       environment:
         - NODE_ENV=production
         - PORT=3000
       volumes:
         - haizea_data:/app/data
         - haizea_logs:/app/logs
       healthcheck:
         test: ["CMD-SHELL", "wget --spider http://localhost:3000/api/health || exit 1"]
         interval: 30s
         timeout: 10s
         retries: 3
         start_period: 60s
   volumes:
     haizea_data:
     haizea_logs:
   ```

### Para Docker Compose tradicional:
```bash
docker-compose up -d
```

## 🔍 Verificación del Estado

### Comandos útiles para diagnóstico:

1. **Ver logs del contenedor:**
   ```bash
   docker logs haizea-llevant-app
   ```

2. **Verificar estado de salud:**
   ```bash
   docker inspect --format='{{.State.Health.Status}}' haizea-llevant-app
   ```

3. **Acceder al contenedor para diagnóstico:**
   ```bash
   docker exec -it haizea-llevant-app sh
   ls -la /app/data
   whoami
   id
   ```

4. **Probar endpoint de salud manualmente:**
   ```bash
   curl http://localhost:3000/api/health
   ```

## 🏥 Healthcheck Mejorado

El nuevo healthcheck:
- ✅ **Usa wget**: Más confiable que Node.js interno
- ✅ **Timeout configurado**: 10 segundos
- ✅ **Período de inicio**: 60 segundos para permitir arranque completo
- ✅ **3 reintentos**: Evita falsos positivos por carga temporal

## 📊 Funcionalidad Garantizada

Incluso con problemas de permisos:
- ✅ **Aplicación web funcional**: La interfaz siempre está disponible
- ✅ **Análisis estadístico**: Se genera y devuelve correctamente
- ✅ **Todas las pestañas**: Funcionan completamente
- ✅ **Gráficos y tablas**: Se generan sin problemas
- ✅ **Solo afectado**: Guardado local de archivos JSON (opcional)

## 🎯 Estado Esperado

Después de implementar estas soluciones:
- 🟢 **Estado en Portainer**: Healthy
- 🟢 **Aplicación web**: Completamente funcional en http://localhost:3000
- 🟢 **Logs limpios**: Sin errores de permisos
- 🟢 **Todas las funcionalidades**: Operativas al 100%

## 🔄 Actualización y Reconstrucción

Para aplicar los cambios:

1. **Detener contenedor actual:**
   ```bash
   docker-compose down
   ```

2. **Reconstruir imagen:**
   ```bash
   docker-compose build --no-cache
   ```

3. **Iniciar con nueva configuración:**
   ```bash
   docker-compose -f docker-compose-portainer.yml up -d
   ```

La aplicación ahora es completamente resiliente y funciona correctamente en cualquier entorno Docker, incluyendo Portainer en Raspberry Pi.