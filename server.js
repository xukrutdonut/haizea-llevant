const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');

// Importar datos de Haizea-Llevant
const { HAIZEA_LLEVANT_DATA, getPercentilForAge, evaluateGlobalDevelopment } = require('./haizea-data.js');

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

// API para obtener datos de Haizea-Llevant
app.get('/api/haizea/data', (req, res) => {
    res.json({
        success: true,
        data: HAIZEA_LLEVANT_DATA,
        timestamp: new Date().toISOString()
    });
});

// API para análisis estadístico de un resultado específico
app.post('/api/haizea/analyze', (req, res) => {
    const { edadMeses, resultados } = req.body;
    
    if (!edadMeses || !resultados) {
        return res.status(400).json({
            success: false,
            error: 'Edad y resultados son requeridos'
        });
    }
    
    try {
        const analysis = analyzeResults(edadMeses, resultados);
        res.json({
            success: true,
            analysis,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error en el análisis',
            details: error.message
        });
    }
});

// API para obtener percentiles de un hito específico
app.get('/api/haizea/percentiles/:hitoId', (req, res) => {
    const { hitoId } = req.params;
    const { edad } = req.query;
    
    const hito = findHitoById(hitoId);
    if (!hito) {
        return res.status(404).json({
            success: false,
            error: 'Hito no encontrado'
        });
    }
    
    const percentilInfo = edad ? getPercentilForAge(hito, parseInt(edad)) : null;
    
    res.json({
        success: true,
        hito,
        percentilInfo,
        timestamp: new Date().toISOString()
    });
});

// API para generar gráfico de desarrollo
app.post('/api/haizea/chart-data', (req, res) => {
    const { edadMeses, area } = req.body;
    
    try {
        const chartData = generateChartData(edadMeses, area);
        res.json({
            success: true,
            chartData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error generando datos del gráfico',
            details: error.message
        });
    }
});

// Endpoint para guardar resultados con análisis
app.post('/api/test/result', (req, res) => {
    const { testId, results } = req.body;
    
    try {
        // Análisis estadístico de los resultados
        const analysis = analyzeResults(results.patientAge, results.testResults);
        
        // Guardar en archivo JSON con análisis
        const completeResult = {
            ...results,
            analysis,
            timestamp: new Date().toISOString()
        };
        
        // Crear directorio data si no existe
        if (!fs.existsSync('./data')) {
            fs.mkdirSync('./data', { recursive: true });
        }
        
        // Guardar resultado
        const filename = `./data/test-${testId}-${Date.now()}.json`;
        fs.writeFileSync(filename, JSON.stringify(completeResult, null, 2));
        
        console.log('Resultados guardados con análisis:', filename);
        
        res.json({ 
            message: 'Resultados guardados con análisis estadístico',
            testId,
            analysis,
            filename,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('Error guardando resultados:', error);
        res.status(500).json({
            success: false,
            error: 'Error guardando resultados',
            details: error.message
        });
    }
});

// Manejo de errores 404
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

// Funciones auxiliares para análisis estadístico
function findHitoById(hitoId) {
    for (let area in HAIZEA_LLEVANT_DATA) {
        const hito = HAIZEA_LLEVANT_DATA[area].find(h => h.id === hitoId);
        if (hito) return hito;
    }
    return null;
}

function analyzeResults(edadMeses, testResults) {
    const analysis = {
        edadMeses,
        totalHitos: 0,
        hitosEvaluados: testResults.length,
        distribucion: {
            superado: 0,
            parcial: 0,
            no_superado: 0
        },
        percentiles: {
            normal: 0,
            retraso: 0,
            avanzado: 0
        },
        porArea: {},
        alertas: [],
        recomendaciones: []
    };
    
    // Contar total de hitos
    for (let area in HAIZEA_LLEVANT_DATA) {
        analysis.totalHitos += HAIZEA_LLEVANT_DATA[area].length;
        analysis.porArea[area] = {
            total: HAIZEA_LLEVANT_DATA[area].length,
            evaluados: 0,
            superados: 0,
            estado: 'normal'
        };
    }
    
    // Analizar cada resultado
    let hitoIndex = 0;
    for (let area in HAIZEA_LLEVANT_DATA) {
        const hitosArea = HAIZEA_LLEVANT_DATA[area];
        
        hitosArea.forEach((hito, index) => {
            if (hitoIndex < testResults.length) {
                const resultado = testResults[hitoIndex];
                analysis.porArea[area].evaluados++;
                
                // Contar distribución
                analysis.distribucion[resultado.result === 'pass' ? 'superado' : 
                                   resultado.result === 'partial' ? 'parcial' : 'no_superado']++;
                
                if (resultado.result === 'pass' || resultado.result === 'partial') {
                    analysis.porArea[area].superados++;
                }
                
                // Análisis de percentiles
                if (edadMeses < hito.percentiles.p25 && resultado.result === 'fail') {
                    analysis.percentiles.retraso++;
                    analysis.alertas.push(`Posible retraso en: ${hito.item}`);
                } else if (edadMeses > hito.percentiles.p90 && resultado.result === 'pass') {
                    analysis.percentiles.avanzado++;
                } else {
                    analysis.percentiles.normal++;
                }
                
                hitoIndex++;
            }
        });
        
        // Determinar estado del área
        const porcentajeSuperado = (analysis.porArea[area].superados / analysis.porArea[area].evaluados) * 100;
        if (porcentajeSuperado < 60) {
            analysis.porArea[area].estado = 'preocupante';
            analysis.alertas.push(`Área ${area} con rendimiento por debajo de lo esperado`);
        } else if (porcentajeSuperado > 90) {
            analysis.porArea[area].estado = 'excelente';
        }
    }
    
    // Generar recomendaciones
    if (analysis.alertas.length > 0) {
        analysis.recomendaciones.push('Se recomienda seguimiento especializado');
        analysis.recomendaciones.push('Considerar estimulación temprana');
    }
    
    if (analysis.percentiles.avanzado > 3) {
        analysis.recomendaciones.push('Desarrollo avanzado - considerar enriquecimiento');
    }
    
    return analysis;
}

function generateChartData(edadMeses, area = null) {
    const chartData = {
        percentileLines: {},
        patientAge: edadMeses,
        hitosData: []
    };
    
    const areasToProcess = area ? [area] : Object.keys(HAIZEA_LLEVANT_DATA);
    
    areasToProcess.forEach(areaName => {
        HAIZEA_LLEVANT_DATA[areaName].forEach(hito => {
            chartData.hitosData.push({
                id: hito.id,
                item: hito.item,
                area: areaName,
                p25: hito.percentiles.p25,
                p50: hito.percentiles.p50,
                p75: hito.percentiles.p75,
                p90: hito.percentiles.p90,
                patientStatus: edadMeses < hito.percentiles.p25 ? 'early' :
                              edadMeses < hito.percentiles.p50 ? 'normal-low' :
                              edadMeses < hito.percentiles.p75 ? 'normal' :
                              edadMeses < hito.percentiles.p90 ? 'normal-high' : 'late'
            });
        });
    });
    
    return chartData;
}

// Iniciar servidor
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor Haizea-Llevant iniciado en puerto ${PORT}`);
    console.log(`📱 Acceso local: http://localhost:${PORT}`);
    console.log(`🌐 Acceso red: http://0.0.0.0:${PORT}`);
    console.log(`📊 APIs estadísticas disponibles:`);
    console.log(`   GET  /api/haizea/data - Datos completos`);
    console.log(`   POST /api/haizea/analyze - Análisis de resultados`);
    console.log(`   POST /api/haizea/chart-data - Datos para gráficos`);
});