# Usar imagen Node.js oficial para ARM64 (Raspberry Pi 5)
FROM node:18-alpine

# Información del mantenedor
LABEL maintainer="NeuropediaLab"
LABEL description="Test Haizea-Llevant digitalizado para Raspberry Pi 5"
LABEL version="1.0.0"

# Instalar herramientas necesarias
RUN apk add --no-cache wget

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production && npm cache clean --force

# Crear usuario no privilegiado
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copiar código fuente
COPY . .

# Hacer el script de inicio ejecutable
RUN chmod +x start.sh

# Crear directorio de datos con permisos correctos
RUN mkdir -p /app/data /app/logs /tmp/haizea-data

# Cambiar propietario de archivos
RUN chown -R nodejs:nodejs /app

# Cambiar a usuario no privilegiado
USER nodejs

# Exponer puerto
EXPOSE 3000

# Variables de entorno por defecto
ENV NODE_ENV=production
ENV PORT=3000

# Comando de salud
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Comando de inicio
CMD ["./start.sh"]