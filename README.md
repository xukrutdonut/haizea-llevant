# 🧠 Haizea-Llevant Test Digitalizado - Análisis Estadístico Completo

> **Aplicación web profesional para evaluaciones neurológicas pediátricas con análisis estadístico avanzado basada en datos oficiales de Haizea-Llevant, optimizada para Raspberry Pi 5**

![Version](https://img.shields.io/badge/version-2.1.0-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0-brightgreen.svg)
![Docker](https://img.shields.io/badge/docker-ready-blue.svg)
![Raspberry Pi](https://img.shields.io/badge/Raspberry%20Pi%205-supported-red.svg)
![Statistics](https://img.shields.io/badge/estadísticas-oficiales-green.svg)
![New](https://img.shields.io/badge/NEW-Tabla%20Visual-red.svg)

## 🆕 **NUEVA VERSIÓN 2.1 - Tabla Visual Haizea-Llevant**

### ✨ **🎯 NUEVA CARACTERÍSTICA PRINCIPAL: TABLA VISUAL DE HAIZEA-LLEVANT**

#### 📋 **Representación Visual del Niño en la Tabla**
- **🧒 Posicionamiento del paciente** según edad cronológica
- **📊 Visualización completa** de percentiles por hito
- **🎨 Barras coloreadas** que muestran rangos de desarrollo normal
- **📈 Línea temporal** con la edad del niño marcada claramente
- **🔍 Panel de referencia** disponible durante la evaluación

#### 🆕 **Características Avanzadas Implementadas en v2.1:**

#### 📊 **Análisis Estadístico Completo**
- **32 hitos oficiales** de Haizea-Llevant con percentiles P25, P50, P75, P90
- **Análisis automático** de resultados por área del desarrollo
- **Alertas clínicas** para detección temprana de retrasos
- **Recomendaciones automatizadas** basadas en patrones de desarrollo

#### 📈 **Visualización de Datos**
- **Gráficos interactivos** con Chart.js mostrando curvas de percentiles
- **Comparación visual** del paciente con curvas normativas
- **Filtros por área** del desarrollo (Socialización, Lenguaje, Motricidad, etc.)
- **Tabla detallada** de percentiles por cada hito evaluado

#### 🏥 **Dashboard Clínico Profesional**
- **5 pestañas especializadas**: Resumen, Estadísticas, Gráficos, Percentiles, **🆕 Tabla Haizea-Llevant**
- **📋 Tabla visual interactiva** con posición del niño por edad cronológica
- **🎯 Panel de referencia** durante evaluación en tiempo real
- **📊 Estadísticas de desarrollo** con análisis automático inteligente
- **🔍 Tooltips informativos** con explicaciones detalladas
- **Análisis por área** con métricas específicas
- **Sistema de alertas** codificado por colores
- **Exportación completa** con análisis estadístico incluido

## 🎯 **Nueva Funcionalidad: Tabla Visual Haizea-Llevant**

### 📊 **Visualización Completa del Desarrollo**

#### 🧒 **Representación del Niño en la Tabla**
1. **📍 Marcador de Edad Cronológica**
   - Línea roja vertical que indica la edad actual del paciente
   - Posicionamiento preciso en cada área de desarrollo
   - Comparación visual inmediata con percentiles esperados

2. **🎨 Barras de Percentiles Coloreadas**
   - **Rojo claro (P0-P25)**: Desarrollo temprano/posible retraso
   - **Amarillo (P25-P50)**: Rango normal bajo
   - **Verde (P50-P75)**: Rango normal
   - **Azul (P75-P90)**: Rango normal alto  
   - **Violeta (P90+)**: Desarrollo avanzado

3. **📈 Timeline Visual por Áreas**
   - Escala temporal clara en meses
   - Todos los hitos organizados por área de desarrollo
   - Estados visuales: ✅ Superado, ⚠️ Parcial, ❌ No superado, ⚪ No evaluado

#### 🎯 **Panel de Referencia Durante la Evaluación**
- **📱 Acceso flotante** con botón "Ver tabla Haizea-Llevant"
- **🎯 Contexto del hito actual** con percentiles específicos
- **📊 Comparación en tiempo real** con la edad del paciente
- **📋 Vista de área completa** mostrando todos los hitos relacionados

#### 🧠 **Análisis Inteligente del Desarrollo**
- **🔢 Cálculo automático** de hitos esperados vs. superados
- **⚡ Evaluación instantánea** del estado general:
  - 🟢 Desarrollo adecuado
  - 🟡 Áreas de preocupación
  - 🔴 Retraso en el desarrollo
  - 🔵 Desarrollo avanzado
- **📋 Estadísticas de resumen** contextualizadas

## 🎯 Áreas de Evaluación Basadas en Datos Oficiales

### 📋 **5 Áreas del Desarrollo con Percentiles Precisos:**

1. **👥 Socialización** (6 hitos)
   - Sonrisa espontánea y social
   - Reconocimiento maternal
   - Respuesta al nombre
   - Ansiedad ante extraños
   - Juego social cooperativo

2. **🗣️ Lenguaje y Comunicación** (7 hitos)
   - Sonidos guturales y balbuceo
   - Primeras palabras específicas
   - Comprensión de órdenes
   - Desarrollo del vocabulario
   - Combinación de palabras

3. **🏃 Motricidad Gruesa** (8 hitos)
   - Control cefálico
   - Sedestación progresiva
   - Gateo y desplazamiento
   - Bipedestación y marcha
   - Subida de escaleras

4. **✋ Motricidad Fina** (6 hitos)
   - Seguimiento visual
   - Alcance y prensión
   - Transferencia manual
   - Pinza digital
   - Grafomotricidad inicial

5. **🧩 Resolución de Problemas** (5 hitos)
   - Permanencia del objeto
   - Imitación gestual
   - Uso funcional de objetos
   - Resolución de problemas simples

## 🚀 Instalación y Despliegue

### Prerequisitos
- Raspberry Pi 5 con Raspberry Pi OS
- Docker y Docker Compose
- Al menos 1GB RAM disponible

### Despliegue Automático
```bash
# Clonar repositorio con funcionalidades estadísticas
git clone https://github.com/xukrutdonut/haizea-llevant.git
cd haizea-llevant

# Desplegar automáticamente
./deploy-rpi.sh
```

### APIs Estadísticas Disponibles
```bash
# Obtener datos oficiales de Haizea-Llevant
curl http://localhost:3000/api/haizea/data

# Análizar resultados de un paciente
curl -X POST http://localhost:3000/api/haizea/analyze \
  -H "Content-Type: application/json" \
  -d '{"edadMeses": 12, "resultados": [...]}'

# Generar datos para gráficos
curl -X POST http://localhost:3000/api/haizea/chart-data \
  -H "Content-Type: application/json" \
  -d '{"edadMeses": 12, "area": "lenguaje"}'
```

## 📊 **Dashboard de Análisis Estadístico**

### 🎨 **Interfaz de Pestañas Profesional**

#### 📋 **1. Resumen Ejecutivo**
- Estadísticas generales del paciente
- Puntuación global de desarrollo
- Distribución de resultados por estado

#### 📊 **2. Análisis Estadístico**
- **Métricas por área** del desarrollo
- **Análisis de percentiles** detallado
- **Alertas clínicas** automáticas
- **Recomendaciones** especializadas

#### 📈 **3. Gráficos Interactivos**
- **Curvas de percentiles** P25, P50, P75, P90
- **Línea del paciente** comparada con normativas
- **Filtros por área** del desarrollo
- **Visualización responsive** para tablets

#### 📉 **4. Tabla de Percentiles**
- **Estado por hito** individual
- **Comparación con percentiles** oficiales
- **Codificación por colores** (Normal/Alerta/Avanzado)
- **Exportación** de datos tabulares

#### 📋 **🆕 5. Tabla Visual Haizea-Llevant**
- **🧒 Representación del niño** según edad cronológica
- **📊 Visualización por áreas** de desarrollo completas
- **🎨 Barras de percentiles** coloreadas e interactivas
- **📈 Línea temporal** con marcador de edad del paciente
- **🔍 Tooltips informativos** con contexto detallado
- **📱 Panel de referencia** accesible durante evaluación
- **📋 Estadísticas de resumen** del desarrollo general

## 🏥 **Funcionalidades Clínicas Avanzadas**

### ⚕️ **Sistema de Alertas Automáticas**
- **🔴 Retraso Significativo**: Cuando edad < P25 y hito no superado
- **🟡 Desarrollo Límite**: Rendimiento entre P25-P50
- **🟢 Desarrollo Normal**: Rendimiento P50-P90
- **🔵 Desarrollo Avanzado**: Rendimiento > P90

### 💡 **Recomendaciones Automatizadas**
- **Seguimiento especializado** para retrasos detectados
- **Estimulación temprana** por áreas específicas
- **Programas de enriquecimiento** para desarrollo avanzado
- **Referencias clínicas** basadas en patrones

### 📈 **Análisis Longitudinal Preparado**
- Base de datos SQLite lista para historiales
- Estructura para comparaciones temporales
- Seguimiento de evolución por paciente

## 🔬 **Validación Clínica y Científica**

### 📑 **Basado en Datos Oficiales**
- **Tabla oficial** Haizea-Llevant descargada e integrada
- **Percentiles validados** clínicamente
- **32 hitos** con rangos de edad precisos
- **Criterios diagnósticos** estándar

### 🎯 **Precisión Estadística**
- **4 percentiles** por cada hito (P25, P50, P75, P90)
- **Análisis automático** de desviaciones
- **Cálculos estadísticos** en tiempo real
- **Interpretación clínica** automatizada

## 📁 **Estructura del Proyecto v2.0**

```
haizea-llevant/
├── 📊 haizea-data.js              # Datos oficiales con percentiles
├── 📈 TablaHaizeaLlevant.pdf      # Documento oficial descargado
├── 📄 server.js                  # Servidor con análisis estadístico
├── 📦 package.json               # Dependencias v2.0
├── 🌐 public/
│   ├── 🎨 index.html            # Interfaz con pestañas de análisis
│   ├── 💫 styles.css            # Estilos para dashboard estadístico
│   ├── ⚡ app.js                # Lógica con Chart.js y análisis
│   └── 📋 app-old.js            # Versión anterior (backup)
├── 🐳 Dockerfile                 # Imagen optimizada ARM64
├── 🐙 docker-compose.yml         # Orquestación con límites de recursos
├── 🚀 deploy-rpi.sh              # Despliegue automático
├── ⚙️ manage.sh                  # Gestión de servicios
└── 📚 README.md                  # Esta documentación
```

## 🎮 **Flujo de Evaluación Mejorado**

### 1. 📝 **Registro Inicial**
- Datos del paciente con validación de edad
- Información del evaluador
- Carga automática de datos oficiales

### 2. 🔍 **Evaluación Interactiva**
- **32 hitos oficiales** presentados secuencialmente
- **Información de percentiles** en tiempo real
- **Descripción detallada** de cada hito
- **Progreso visual** con estadísticas actualizadas

### 3. 📊 **Análisis Automático**
- **Procesamiento estadístico** inmediato al finalizar
- **Generación de alertas** clínicas automáticas
- **Cálculo de recomendaciones** personalizadas

### 4. 📈 **Dashboard Completo con Tabla Visual**
- **5 vistas especializadas** de resultados (incluye nueva tabla visual)
- **🆕 Tabla Haizea-Llevant** con representación del niño por edad cronológica
- **📊 Gráficos interactivos** con Chart.js  
- **🎯 Panel de referencia** durante la evaluación
- **Exportación completa** con análisis incluido
- **Impresión optimizada** para informes clínicos

## 🎯 **Casos de Uso Clínicos**

### 👶 **Evaluación de Desarrollo Temprano**
- Detección precoz de retrasos del desarrollo
- Seguimiento de prematuros
- Evaluación de efectividad de intervenciones

### 🏥 **Uso en Consulta Pediátrica**
- Evaluación sistemática en revisiones
- Generación automática de informes
- Seguimiento longitudinal de pacientes

### 🎓 **Formación y Docencia**
- Herramienta didáctica con datos reales
- Práctica de interpretación de percentiles
- Simulación de casos clínicos

## 💻 **Especificaciones Técnicas**

### 🖥️ **Backend Mejorado**
- Node.js + Express con APIs estadísticas
- Análisis en tiempo real de percentiles
- Generación automática de alertas
- Exportación de datos completos

### 🎨 **Frontend Avanzado**
- Chart.js para gráficos interactivos
- Interfaz responsive con pestañas
- Sistema de notificaciones mejorado
- PWA-ready para uso offline

### 📊 **Análisis de Datos**
- Cálculos estadísticos automáticos
- Comparación con percentiles oficiales
- Generación de recomendaciones
- Alertas clínicas codificadas

## 🔧 **Desarrollo y Personalización**

### 🛠️ **APIs Disponibles**
```javascript
// Obtener todos los datos oficiales
GET /api/haizea/data

// Analizar resultados de paciente
POST /api/haizea/analyze
{
  "edadMeses": 12,
  "resultados": [...]
}

// Generar datos para gráficos
POST /api/haizea/chart-data
{
  "edadMeses": 12,
  "area": "lenguaje" // opcional
}
```

### 📱 **Personalización de la Interfaz**
- Temas de color configurables
- Logos institucionales
- Textos personalizables
- Idiomas múltiples preparado

## 🏆 **Ventajas Competitivas v2.0**

### ✅ **Ventajas Clínicas**
- ✅ **Datos oficiales** validados científicamente
- ✅ **Análisis automático** sin intervención manual
- ✅ **Alertas inmediatas** para casos críticos
- ✅ **Recomendaciones específicas** por área
- ✅ **Visualización profesional** de resultados

### ✅ **Ventajas Técnicas**
- ✅ **Optimizado para RPi5** con contenedores eficientes
- ✅ **Gráficos interactivos** con Chart.js
- ✅ **APIs REST** para integración
- ✅ **Exportación completa** de datos
- ✅ **Interfaz responsive** para tablets

### ✅ **Ventajas de Implementación**
- ✅ **Despliegue automático** con un comando
- ✅ **Sin dependencias externas** una vez instalado
- ✅ **Escalable** y personalizable
- ✅ **Documentación completa** incluida

## 👨‍💻 **Desarrollado por NeuropediaLab**

**Especialistas en Neurología Pediátrica y Tecnología Médica**

- 🧠 Experiencia clínica en desarrollo infantil
- 💻 Tecnología médica avanzada
- 📊 Análisis estadístico especializado
- 🎯 Enfoque en usabilidad clínica

---

## 🌐 **Repositorio y Recursos**

- **🔗 GitHub**: https://github.com/xukrutdonut/haizea-llevant
- **📋 Documentación oficial**: Incluida en el repositorio
- **📊 Datos oficiales**: TablaHaizeaLlevant.pdf integrada
- **💡 Soporte**: Issues en GitHub

---

⭐ **¿Te resulta útil esta herramienta clínica?** ¡Dale una estrella en GitHub!

🐛 **¿Encontraste un bug o tienes sugerencias?** Abre un issue en el repositorio.

💡 **¿Quieres contribuir?** ¡Las contribuciones médicas y técnicas son bienvenidas!

📧 **¿Necesitas implementación en tu centro?** Contáctanos para soporte especializado.
