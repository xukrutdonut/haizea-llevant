const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Servir archivos estáticos
app.use(express.static('public'));

// Rutas principales
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API endpoints
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Haizea-Llevant Test'
    });
});

// Endpoint para iniciar test
app.post('/api/test/start', (req, res) => {
    res.json({ 
        message: 'Test iniciado',
        testId: Date.now(),
        timestamp: new Date().toISOString()
    });
});

// Endpoint para guardar resultados
app.post('/api/test/result', (req, res) => {
    const { testId, results } = req.body;
    
    // Aquí procesarías y guardarías los resultados
    console.log('Resultados recibidos:', { testId, results });
    
    res.json({ 
        message: 'Resultados guardados',
        testId,
        timestamp: new Date().toISOString()
    });
});

// Manejo de errores 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Haizea-Llevant iniciado en puerto ${PORT}`);
    console.log(`📱 Acceso local: http://localhost:${PORT}`);
    console.log(`🌐 Acceso red: http://0.0.0.0:${PORT}`);
});