# 🧠 Haizea-Llevant Test Digitalizado

> **Aplicación web profesional para evaluaciones neurológicas pediátricas basadas en el test Haizea-Llevant, optimizada para Raspberry Pi 5**

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0-brightgreen.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![Raspberry Pi](https://img.shields.io/badge/Raspberry%20Pi%205-supported-red.svg)

## 🎯 Características

- **📱 Interfaz Web Moderna**: Diseño responsive optimizado para tablets y dispositivos móviles
- **🧪 Evaluación Completa**: Implementa las 5 áreas del test Haizea-Llevant
- **📊 Resultados Detallados**: Generación automática de informes y estadísticas
- **💾 Persistencia de Datos**: Almacenamiento de evaluaciones con descarga en JSON
- **🐳 Docker Ready**: Contenedor optimizado para ARM64 (Raspberry Pi 5)
- **⚡ Alto Rendimiento**: Optimizado para hardware limitado
- **🔒 Seguro**: Contenedor sin privilegios y configuración de seguridad

## 🏥 Áreas de Evaluación

El test evalúa 5 áreas fundamentales del desarrollo infantil:

1. **👥 Socialización** - Interacción social y vínculos
2. **🗣️ Lenguaje y Comunicación** - Desarrollo del lenguaje
3. **🏃 Motricidad Gruesa** - Desarrollo motor general
4. **✋ Motricidad Fina** - Habilidades motoras precisas  
5. **🧩 Resolución de Problemas** - Capacidad cognitiva

## 🚀 Instalación Rápida

### Prerequisitos
- Raspberry Pi 5 con Raspberry Pi OS
- Docker y Docker Compose
- Al menos 1GB RAM disponible

### Despliegue Automático
```bash
# Clonar repositorio
git clone https://github.com/xukrutdonut/haizea-llevant.git
cd haizea-llevant

# Desplegar automáticamente
./deploy-rpi.sh
```

### Despliegue Manual
```bash
# Instalar dependencias
npm install

# Construir imagen Docker
docker build -t haizea-llevant:latest .

# Iniciar con Docker Compose
docker-compose up -d

# Verificar estado
./manage.sh status
```

## 🎮 Uso

### Acceso a la Aplicación
- **Local**: http://localhost:3000
- **Red local**: http://[IP-de-tu-RPi]:3000

### Gestión de Servicios
```bash
# Iniciar aplicación
./manage.sh start

# Ver logs en tiempo real
./manage.sh logs

# Verificar estado
./manage.sh status

# Parar aplicación
./manage.sh stop

# Reiniciar aplicación
./manage.sh restart

# Actualizar y reconstruir
./manage.sh update

# Verificar salud del servicio
./manage.sh health
```

## 👨‍⚕️ Flujo de Evaluación

1. **📝 Datos del Paciente**: Nombre, edad (0-72 meses), evaluador
2. **🔍 Evaluación Interactiva**: Preguntas organizadas por áreas
3. **📊 Puntuación**: ✅ Superado | ⚠️ Parcial | ❌ No superado
4. **📈 Resultados**: Estadísticas detalladas y puntuación final
5. **💾 Exportación**: Descarga de resultados en formato JSON

## ⚙️ Configuración

### Variables de Entorno
```env
PORT=3000
NODE_ENV=production
TZ=Europe/Madrid
```

### Recursos del Sistema
- **CPU**: 0.5-2.0 cores
- **RAM**: 256MB-512MB
- **Almacenamiento**: ~50MB

### Puertos
- **3000**: Servidor web principal
- **Expuesto**: Configurable en docker-compose.yml

## 📁 Estructura del Proyecto

```
haizea-llevant/
├── 📄 server.js              # Servidor Express principal
├── 📦 package.json           # Dependencias Node.js
├── 🐳 Dockerfile             # Imagen Docker optimizada
├── 🐙 docker-compose.yml     # Orquestación de servicios
├── 🚀 deploy-rpi.sh          # Script de despliegue automático
├── ⚙️ manage.sh              # Script de gestión
├── 📁 public/                # Frontend web
│   ├── 🌐 index.html        # Interfaz principal
│   ├── 🎨 styles.css        # Estilos CSS
│   └── ⚡ app.js            # Lógica JavaScript
├── 📁 data/                  # Datos persistentes
└── 📁 logs/                  # Logs de aplicación
```

## 🔧 Desarrollo

### Modo Desarrollo
```bash
# Instalar dependencias
npm install

# Iniciar servidor en modo desarrollo
npm run dev

# Servidor disponible en http://localhost:3000
```

### API Endpoints
- `GET /api/health` - Estado del servicio
- `POST /api/test/start` - Iniciar nueva evaluación
- `POST /api/test/result` - Guardar resultados

## 📊 Monitoreo

### Logs del Sistema
```bash
# Logs de la aplicación
./manage.sh logs

# Logs específicos de Docker
docker-compose logs haizea-llevant

# Estado de recursos
docker stats
```

### Health Check
El contenedor incluye verificaciones automáticas de salud cada 30 segundos.

## 🛠️ Troubleshooting

### Problemas Comunes

1. **Puerto ocupado**: Cambiar puerto en docker-compose.yml
2. **Memoria insuficiente**: Aumentar swap en la RPi
3. **Servicio no responde**: Verificar con `./manage.sh health`

### Logs de Debug
```bash
# Ver logs detallados
docker-compose logs -f haizea-llevant

# Entrar al contenedor
docker exec -it haizea-llevant-app sh

# Verificar recursos del sistema
htop
```

## 🏥 Contexto Clínico

El **Test Haizea-Llevant** es una herramienta de evaluación del desarrollo infantil ampliamente utilizada en pediatría y neuropediatría. Esta implementación digital facilita:

- ✅ Evaluaciones más eficientes y estandarizadas
- 📊 Generación automática de informes
- 💾 Histórico de evaluaciones por paciente
- 📱 Acceso desde cualquier dispositivo

## 👨‍💻 Desarrollado por

**NeuropediaLab** - Especialistas en Neurología y Tecnología Médica

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

⭐ **¿Te resulta útil este proyecto?** ¡Dale una estrella en GitHub!

🐛 **¿Encontraste un bug?** Abre un issue en el repositorio.

💡 **¿Tienes sugerencias?** ¡Las contribuciones son bienvenidas!
