// Variables globales
let currentTest = null;
let currentQuestionIndex = 0;
let testResults = [];
let haizeaData = null;
let developmentChart = null;
let statisticalAnalysis = null;

// Cargar datos de Haizea-Llevant al inicializar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Haizea-Llevant App iniciada');
    
    // Event listener para el formulario de paciente
    document.getElementById('patient-form').addEventListener('submit', startTest);
    
    // Cargar datos de Haizea-Llevant
    loadHaizeaData();
    
    // Verificar estado del servidor
    checkServerHealth();
});

// Cargar datos de Haizea-Llevant desde el servidor
async function loadHaizeaData() {
    try {
        const response = await fetch('/api/haizea/data');
        const data = await response.json();
        
        if (data.success) {
            haizeaData = data.data;
            console.log('✅ Datos de Haizea-Llevant cargados:', Object.keys(haizeaData).length, 'áreas');
        } else {
            throw new Error('Error cargando datos de Haizea-Llevant');
        }
    } catch (error) {
        console.error('❌ Error cargando datos:', error);
        showNotification('Error cargando datos de evaluación', 'error');
    }
}

// Verificar conexión con el servidor
async function checkServerHealth() {
    try {
        const response = await fetch('/api/health');
        const data = await response.json();
        console.log('✅ Servidor conectado:', data);
    } catch (error) {
        console.error('❌ Error de conexión:', error);
        showNotification('Error de conexión con el servidor', 'error');
    }
}

// Iniciar test con datos de Haizea-Llevant
async function startTest(event) {
    event.preventDefault();
    
    const patientName = document.getElementById('patientName').value;
    const patientAge = parseInt(document.getElementById('patientAge').value);
    const evaluatorName = document.getElementById('evaluatorName').value;
    
    // Validaciones
    if (!patientName || !patientAge || !evaluatorName) {
        showNotification('Por favor, complete todos los campos', 'error');
        return;
    }
    
    if (patientAge < 0 || patientAge > 72) {
        showNotification('La edad debe estar entre 0 y 72 meses', 'error');
        return;
    }
    
    if (!haizeaData) {
        showNotification('Datos de evaluación no disponibles. Reintentando...', 'warning');
        await loadHaizeaData();
        if (!haizeaData) return;
    }
    
    try {
        // Llamar al servidor para iniciar test
        const response = await fetch('/api/test/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                patientName,
                patientAge,
                evaluatorName
            })
        });
        
        const data = await response.json();
        
        // Configurar test
        currentTest = {
            id: data.testId,
            patientName,
            patientAge,
            evaluatorName,
            startTime: new Date(),
            results: []
        };
        
        currentQuestionIndex = 0;
        testResults = [];
        
        // Mostrar estadísticas en header
        updateStatsHeader();
        
        // Cambiar a pantalla de test
        showScreen('test-screen');
        showCurrentQuestion();
        
        showNotification('Test iniciado con datos oficiales de Haizea-Llevant', 'success');
        
    } catch (error) {
        console.error('Error al iniciar test:', error);
        showNotification('Error al iniciar el test', 'error');
    }
}

// Mostrar pregunta actual usando datos de Haizea-Llevant
function showCurrentQuestion() {
    if (!haizeaData) return;
    
    const allHitos = getAllHitos();
    const totalQuestions = allHitos.length;
    const progress = (testResults.length / totalQuestions) * 100;
    
    // Actualizar barra de progreso
    document.getElementById('progress').style.width = progress + '%';
    updateStatsHeader();
    
    if (testResults.length < totalQuestions) {
        const currentHito = allHitos[testResults.length];
        
        document.getElementById('current-area').textContent = getAreaDisplayName(currentHito.area);
        document.getElementById('test-question').innerHTML = `
            <h3>Hito ${testResults.length + 1} de ${totalQuestions}</h3>
            <div class="hito-info">
                <h4>${currentHito.item}</h4>
                <p class="hito-descripcion">${currentHito.descripcion}</p>
                <div class="percentil-info">
                    <small>
                        <strong>Percentiles esperados:</strong> 
                        P25: ${currentHito.percentiles.p25}m | 
                        P50: ${currentHito.percentiles.p50}m | 
                        P75: ${currentHito.percentiles.p75}m | 
                        P90: ${currentHito.percentiles.p90}m
                    </small>
                </div>
            </div>
        `;
        
        // Actualizar panel de referencia si está abierto
        const panel = document.getElementById('haizea-reference-panel');
        if (panel && panel.style.display !== 'none') {
            updateCurrentHitoContext();
        }
    } else {
        // Test completado
        finishTest();
    }
}

// Obtener todos los hitos organizados
function getAllHitos() {
    if (!haizeaData) return [];
    
    const allHitos = [];
    for (let area in haizeaData) {
        haizeaData[area].forEach(hito => {
            allHitos.push({ ...hito, area: area });
        });
    }
    return allHitos;
}

// Obtener nombre de área para mostrar
function getAreaDisplayName(area) {
    const areaNames = {
        socializacion: 'Socialización',
        lenguaje: 'Lenguaje y Comunicación',
        motricidad_gruesa: 'Motricidad Gruesa',
        motricidad_fina: 'Motricidad Fina',
        resolucion_problemas: 'Resolución de Problemas'
    };
    return areaNames[area] || area;
}

// Registrar resultado
function recordResult(result) {
    const allHitos = getAllHitos();
    const currentHito = allHitos[testResults.length];
    
    testResults.push({
        questionIndex: testResults.length,
        hitoId: currentHito.id,
        hitoItem: currentHito.item,
        area: currentHito.area,
        result: result,
        timestamp: new Date(),
        percentiles: currentHito.percentiles
    });
    
    showCurrentQuestion();
}

// Actualizar estadísticas del header
function updateStatsHeader() {
    const statsHeader = document.getElementById('stats-header');
    const allHitos = getAllHitos();
    
    if (currentTest && allHitos.length > 0) {
        statsHeader.style.display = 'flex';
        document.getElementById('hitos-count').textContent = `${testResults.length}/${allHitos.length}`;
        
        // Calcular percentil promedio actual
        let percentilInfo = 'En evaluación...';
        if (testResults.length > 0) {
            const superados = testResults.filter(r => r.result === 'pass').length;
            const porcentaje = Math.round((superados / testResults.length) * 100);
            percentilInfo = `${porcentaje}% completado`;
        }
        document.getElementById('percentil-info').textContent = percentilInfo;
    } else {
        statsHeader.style.display = 'none';
    }
}

// Finalizar test con análisis completo
async function finishTest() {
    try {
        showNotification('Procesando análisis estadístico...', 'info');
        
        // Enviar resultados al servidor para análisis
        const response = await fetch('/api/test/result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                testId: currentTest.id,
                results: {
                    ...currentTest,
                    testResults,
                    endTime: new Date(),
                    duration: new Date() - currentTest.startTime
                }
            })
        });
        
        const data = await response.json();
        statisticalAnalysis = data.analysis;
        
        // Mostrar resultados con análisis
        await showCompleteResults();
        showScreen('results-screen');
        
        showNotification('Análisis estadístico completado', 'success');
        
    } catch (error) {
        console.error('Error al finalizar test:', error);
        showNotification('Error procesando resultados', 'error');
        
        // Mostrar resultados básicos aunque falle el análisis
        await showCompleteResults();
        showScreen('results-screen');
    }
}

// Mostrar resultados completos con análisis estadístico
async function showCompleteResults() {
    // Mostrar pestaña de resumen por defecto
    showResultTab('summary');
    
    // Generar resumen básico
    showBasicSummary();
    
    // Generar análisis estadístico si está disponible del servidor
    if (statisticalAnalysis) {
        showStatisticalAnalysis();
    } else {
        // Generar análisis local si no hay del servidor
        showLocalStatisticalAnalysis();
    }
    
    // Siempre generar gráfico y tabla de percentiles
    await generateDevelopmentChart();
    generatePercentilesTable();
}

// Mostrar resumen básico
function showBasicSummary() {
    const passed = testResults.filter(r => r.result === 'pass').length;
    const partial = testResults.filter(r => r.result === 'partial').length;
    const failed = testResults.filter(r => r.result === 'fail').length;
    const total = testResults.length;
    
    const resultsHtml = `
        <div class="results-stats">
            <h3>Resumen de ${currentTest.patientName}</h3>
            <p><strong>Edad:</strong> ${currentTest.patientAge} meses</p>
            <p><strong>Evaluador:</strong> ${currentTest.evaluatorName}</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
            
            <div class="stats-grid">
                <div class="stat success">
                    <div class="stat-number">${passed}</div>
                    <div class="stat-label">Superados</div>
                </div>
                <div class="stat warning">
                    <div class="stat-number">${partial}</div>
                    <div class="stat-label">Parciales</div>
                </div>
                <div class="stat danger">
                    <div class="stat-number">${failed}</div>
                    <div class="stat-label">No superados</div>
                </div>
                <div class="stat primary">
                    <div class="stat-number">${Math.round((passed / total) * 100)}%</div>
                    <div class="stat-label">Puntuación</div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('results-summary').innerHTML = resultsHtml;
}

// Mostrar análisis estadístico detallado
function showStatisticalAnalysis() {
    if (!statisticalAnalysis) return;
    
    const analysis = statisticalAnalysis;
    let analysisHtml = `
        <div class="analysis-grid">
            <div class="analysis-card">
                <h4>📊 Distribución General</h4>
                <div class="metric">
                    <span>Hitos evaluados:</span>
                    <span class="metric-value">${analysis.hitosEvaluados}/${analysis.totalHitos}</span>
                </div>
                <div class="metric">
                    <span>Superados:</span>
                    <span class="metric-value">${analysis.distribucion.superado}</span>
                </div>
                <div class="metric">
                    <span>Parciales:</span>
                    <span class="metric-value">${analysis.distribucion.parcial}</span>
                </div>
                <div class="metric">
                    <span>No superados:</span>
                    <span class="metric-value">${analysis.distribucion.no_superado}</span>
                </div>
            </div>
            
            <div class="analysis-card">
                <h4>📈 Análisis de Percentiles</h4>
                <div class="metric">
                    <span>Desarrollo normal:</span>
                    <span class="metric-value">${analysis.percentiles.normal}</span>
                </div>
                <div class="metric">
                    <span>Posibles retrasos:</span>
                    <span class="metric-value">${analysis.percentiles.retraso}</span>
                </div>
                <div class="metric">
                    <span>Desarrollo avanzado:</span>
                    <span class="metric-value">${analysis.percentiles.avanzado}</span>
                </div>
            </div>
        </div>
        
        <div class="analysis-grid">
    `;
    
    // Análisis por área
    for (let area in analysis.porArea) {
        const areaData = analysis.porArea[area];
        const porcentaje = Math.round((areaData.superados / areaData.evaluados) * 100) || 0;
        
        analysisHtml += `
            <div class="analysis-card">
                <h4>🎯 ${getAreaDisplayName(area)}</h4>
                <div class="metric">
                    <span>Evaluados:</span>
                    <span class="metric-value">${areaData.evaluados}/${areaData.total}</span>
                </div>
                <div class="metric">
                    <span>Superados:</span>
                    <span class="metric-value">${areaData.superados} (${porcentaje}%)</span>
                </div>
                <div class="metric">
                    <span>Estado:</span>
                    <span class="metric-value ${areaData.estado}">${areaData.estado}</span>
                </div>
            </div>
        `;
    }
    
    analysisHtml += `</div>`;
    
    // Alertas y recomendaciones
    if (analysis.alertas && analysis.alertas.length > 0) {
        analysisHtml += `
            <div class="alerts-section ${analysis.alertas.length > 2 ? 'warning' : ''}">
                <h4>⚠️ Alertas Clínicas</h4>
        `;
        analysis.alertas.forEach(alerta => {
            analysisHtml += `<div class="alert-item">${alerta}</div>`;
        });
        analysisHtml += `</div>`;
    }
    
    if (analysis.recomendaciones && analysis.recomendaciones.length > 0) {
        analysisHtml += `
            <div class="recommendations-section">
                <h4>💡 Recomendaciones</h4>
        `;
        analysis.recomendaciones.forEach(recomendacion => {
            analysisHtml += `<div class="recommendation-item">${recomendacion}</div>`;
        });
        analysisHtml += `</div>`;
    }
    
    document.getElementById('analysis-content').innerHTML = analysisHtml;
}

// Generar análisis estadístico local cuando no hay del servidor
function showLocalStatisticalAnalysis() {
    if (!currentTest || !testResults.length) return;
    
    // Calcular estadísticas locales
    const passed = testResults.filter(r => r.result === 'pass').length;
    const partial = testResults.filter(r => r.result === 'partial').length;
    const failed = testResults.filter(r => r.result === 'fail').length;
    const total = testResults.length;
    
    // Análisis por área
    const areaStats = {};
    const allHitos = getAllHitos();
    
    // Inicializar estadísticas por área
    for (let area in haizeaData) {
        areaStats[area] = {
            total: haizeaData[area].length,
            evaluados: 0,
            superados: 0,
            parciales: 0,
            fallidos: 0,
            estado: 'normal'
        };
    }
    
    // Calcular estadísticas por área
    testResults.forEach(result => {
        const area = result.area;
        if (areaStats[area]) {
            areaStats[area].evaluados++;
            if (result.result === 'pass') areaStats[area].superados++;
            else if (result.result === 'partial') areaStats[area].parciales++;
            else if (result.result === 'fail') areaStats[area].fallidos++;
        }
    });
    
    // Determinar estado por área
    for (let area in areaStats) {
        const stats = areaStats[area];
        if (stats.evaluados > 0) {
            const porcentajeSuperado = (stats.superados / stats.evaluados) * 100;
            if (porcentajeSuperado < 60) {
                stats.estado = 'preocupante';
            } else if (porcentajeSuperado > 90) {
                stats.estado = 'excelente';
            } else if (porcentajeSuperado > 80) {
                stats.estado = 'muy bueno';
            }
        }
    }
    
    // Análisis de percentiles local
    let normalCount = 0;
    let retrasoCount = 0;
    let avanzadoCount = 0;
    
    testResults.forEach(result => {
        const edadPaciente = currentTest.patientAge;
        const percentiles = result.percentiles;
        
        if (edadPaciente < percentiles.p25 && result.result === 'fail') {
            retrasoCount++;
        } else if (edadPaciente > percentiles.p90 && result.result === 'pass') {
            avanzadoCount++;
        } else {
            normalCount++;
        }
    });
    
    // Generar HTML del análisis local
    let analysisHtml = `
        <div class="analysis-grid">
            <div class="analysis-card">
                <h4>📊 Distribución General</h4>
                <div class="metric">
                    <span>Hitos evaluados:</span>
                    <span class="metric-value">${total}/${allHitos.length}</span>
                </div>
                <div class="metric">
                    <span>Superados:</span>
                    <span class="metric-value">${passed} (${Math.round((passed/total)*100)}%)</span>
                </div>
                <div class="metric">
                    <span>Parciales:</span>
                    <span class="metric-value">${partial} (${Math.round((partial/total)*100)}%)</span>
                </div>
                <div class="metric">
                    <span>No superados:</span>
                    <span class="metric-value">${failed} (${Math.round((failed/total)*100)}%)</span>
                </div>
            </div>
            
            <div class="analysis-card">
                <h4>📈 Análisis de Percentiles</h4>
                <div class="metric">
                    <span>Desarrollo normal:</span>
                    <span class="metric-value">${normalCount}</span>
                </div>
                <div class="metric">
                    <span>Posibles retrasos:</span>
                    <span class="metric-value">${retrasoCount}</span>
                </div>
                <div class="metric">
                    <span>Desarrollo avanzado:</span>
                    <span class="metric-value">${avanzadoCount}</span>
                </div>
            </div>
        </div>
        
        <div class="analysis-grid">
    `;
    
    // Análisis por área
    for (let area in areaStats) {
        const stats = areaStats[area];
        const porcentaje = stats.evaluados > 0 ? Math.round((stats.superados / stats.evaluados) * 100) : 0;
        
        analysisHtml += `
            <div class="analysis-card">
                <h4>🎯 ${getAreaDisplayName(area)}</h4>
                <div class="metric">
                    <span>Evaluados:</span>
                    <span class="metric-value">${stats.evaluados}/${stats.total}</span>
                </div>
                <div class="metric">
                    <span>Superados:</span>
                    <span class="metric-value">${stats.superados} (${porcentaje}%)</span>
                </div>
                <div class="metric">
                    <span>Parciales:</span>
                    <span class="metric-value">${stats.parciales}</span>
                </div>
                <div class="metric">
                    <span>Estado:</span>
                    <span class="metric-value ${stats.estado}">${stats.estado}</span>
                </div>
            </div>
        `;
    }
    
    analysisHtml += `</div>`;
    
    // Recomendaciones locales
    const recomendaciones = [];
    if (retrasoCount > 2) {
        recomendaciones.push('Se recomienda seguimiento especializado debido a posibles retrasos');
        recomendaciones.push('Considerar estimulación temprana en las áreas afectadas');
    }
    if (avanzadoCount > 3) {
        recomendaciones.push('Desarrollo avanzado - considerar enriquecimiento educativo');
    }
    if ((passed / total) < 0.6) {
        recomendaciones.push('Puntuación general baja - evaluación más detallada recomendada');
    }
    
    if (recomendaciones.length > 0) {
        analysisHtml += `
            <div class="recommendations-section">
                <h4>💡 Recomendaciones</h4>
        `;
        recomendaciones.forEach(recomendacion => {
            analysisHtml += `<div class="recommendation-item">${recomendacion}</div>`;
        });
        analysisHtml += `</div>`;
    }
    
    document.getElementById('analysis-content').innerHTML = analysisHtml;
}

// Generar gráfico de desarrollo
async function generateDevelopmentChart() {
    try {
        const response = await fetch('/api/haizea/chart-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                edadMeses: currentTest.patientAge,
                area: 'all'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            createChart(data.chartData);
        }
    } catch (error) {
        console.error('Error generando gráfico:', error);
    }
}

// Crear gráfico con Chart.js
function createChart(chartData) {
    const ctx = document.getElementById('development-chart').getContext('2d');
    
    // Destruir gráfico existente
    if (developmentChart) {
        developmentChart.destroy();
    }
    
    // Preparar datos para el gráfico
    const datasets = [];
    
    // Líneas de percentiles
    const percentiles = ['p25', 'p50', 'p75', 'p90'];
    const colors = ['#ffc107', '#28a745', '#17a2b8', '#6f42c1'];
    
    percentiles.forEach((p, index) => {
        datasets.push({
            label: `Percentil ${p.toUpperCase().replace('P', '')}`,
            data: chartData.hitosData.map((hito, i) => ({ x: i, y: hito[p] })),
            borderColor: colors[index],
            backgroundColor: colors[index] + '20',
            fill: false,
            tension: 0.1
        });
    });
    
    // Línea del paciente
    datasets.push({
        label: `Paciente (${currentTest.patientAge} meses)`,
        data: chartData.hitosData.map((hito, i) => ({ x: i, y: currentTest.patientAge })),
        borderColor: '#dc3545',
        backgroundColor: '#dc3545',
        borderWidth: 3,
        pointRadius: 0,
        borderDash: [5, 5]
    });
    
    developmentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: chartData.hitosData.map(hito => hito.item.substring(0, 20) + '...'),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `Curvas de Percentiles - Paciente: ${currentTest.patientName} (${currentTest.patientAge} meses)`
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Edad (meses)'
                    },
                    min: 0,
                    max: 30
                },
                x: {
                    title: {
                        display: true,
                        text: 'Hitos del Desarrollo'
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

// Actualizar gráfico por área
async function updateChart() {
    const selectedArea = document.getElementById('chart-area-filter').value;
    
    try {
        const response = await fetch('/api/haizea/chart-data', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                edadMeses: currentTest.patientAge,
                area: selectedArea === 'all' ? null : selectedArea
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            createChart(data.chartData);
        }
    } catch (error) {
        console.error('Error actualizando gráfico:', error);
    }
}

// Generar tabla de percentiles
function generatePercentilesTable() {
    const percentilesContainer = document.getElementById('percentiles-table');
    
    if (!currentTest || !testResults || testResults.length === 0) {
        percentilesContainer.innerHTML = '<p class="no-data">No hay resultados para mostrar en la tabla de percentiles.</p>';
        return;
    }
    
    let tableHtml = `
        <div class="percentiles-summary">
            <h4>📊 Análisis de Percentiles por Hito</h4>
            <p>Esta tabla muestra cómo se compara la edad de tu paciente (${currentTest.patientAge} meses) con los percentiles normales de cada hito evaluado.</p>
        </div>
        <table class="percentiles-table">
            <thead>
                <tr>
                    <th>Hito</th>
                    <th>Área</th>
                    <th>Resultado</th>
                    <th>P25</th>
                    <th>P50</th>
                    <th>P75</th>
                    <th>P90</th>
                    <th>Estado del Paciente</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    testResults.forEach((result, index) => {
        const p = result.percentiles;
        const edadPaciente = currentTest.patientAge;
        
        if (!p) {
            console.warn('Percentiles no disponibles para hito:', result.hitoItem);
            return;
        }
        
        let estado = 'normal';
        let estadoTexto = 'Normal';
        let estadoDetalle = '';
        
        if (edadPaciente < p.p25) {
            if (result.result === 'fail') {
                estado = 'danger';
                estadoTexto = 'Posible retraso';
                estadoDetalle = 'No logrado y edad por debajo del P25';
            } else {
                estado = 'advanced';
                estadoTexto = 'Precoz';
                estadoDetalle = 'Logrado antes del P25';
            }
        } else if (edadPaciente >= p.p25 && edadPaciente < p.p50) {
            estadoTexto = 'Normal bajo';
            estadoDetalle = 'Entre P25 y P50';
        } else if (edadPaciente >= p.p50 && edadPaciente < p.p75) {
            estadoTexto = 'Normal';
            estadoDetalle = 'Entre P50 y P75';
        } else if (edadPaciente >= p.p75 && edadPaciente < p.p90) {
            estadoTexto = 'Normal alto';
            estadoDetalle = 'Entre P75 y P90';
        } else if (edadPaciente >= p.p90) {
            if (result.result === 'pass') {
                estado = 'advanced';
                estadoTexto = 'Dentro de rango';
                estadoDetalle = 'Logrado en edad esperada alta';
            } else {
                estado = 'warning';
                estadoTexto = 'Tardío';
                estadoDetalle = 'No logrado después del P90';
            }
        }
        
        const resultIcon = result.result === 'pass' ? '✅' : result.result === 'partial' ? '⚠️' : '❌';
        const resultText = result.result === 'pass' ? 'Superado' : result.result === 'partial' ? 'Parcial' : 'No superado';
        
        tableHtml += `
            <tr class="hito-row ${estado}">
                <td class="hito-name" title="${result.hitoItem}">
                    ${result.hitoItem.length > 40 ? result.hitoItem.substring(0, 37) + '...' : result.hitoItem}
                </td>
                <td class="area-name">${getAreaDisplayName(result.area)}</td>
                <td class="result-cell">
                    <span class="result-icon">${resultIcon}</span>
                    <span class="result-text">${resultText}</span>
                </td>
                <td class="percentile-cell">${p.p25}m</td>
                <td class="percentile-cell">${p.p50}m</td>
                <td class="percentile-cell">${p.p75}m</td>
                <td class="percentile-cell">${p.p90}m</td>
                <td class="status-cell">
                    <span class="percentil-status ${estado}" title="${estadoDetalle}">
                        ${estadoTexto}
                    </span>
                </td>
            </tr>
        `;
    });
    
    tableHtml += `
            </tbody>
        </table>
        
        <div class="percentiles-legend">
            <h5>📖 Interpretación de Estados:</h5>
            <div class="legend-grid">
                <div class="legend-item">
                    <span class="percentil-status advanced">Precoz/Avanzado</span>
                    <span>Hito logrado antes o después del tiempo esperado de forma positiva</span>
                </div>
                <div class="legend-item">
                    <span class="percentil-status normal">Normal</span>
                    <span>Hito en rango de desarrollo típico</span>
                </div>
                <div class="legend-item">
                    <span class="percentil-status warning">Tardío</span>
                    <span>Hito no logrado en el tiempo esperado</span>
                </div>
                <div class="legend-item">
                    <span class="percentil-status danger">Posible retraso</span>
                    <span>Requiere atención y posible seguimiento</span>
                </div>
            </div>
        </div>
    `;
    
    percentilesContainer.innerHTML = tableHtml;
    console.log('✅ Tabla de percentiles generada con', testResults.length, 'hitos');
}

// Gestión de pestañas de resultados
function showResultTab(tabName) {
    // Ocultar todas las pestañas
    document.querySelectorAll('.result-tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Mostrar pestaña seleccionada
    const targetTab = document.getElementById(tabName + '-tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    const targetButton = document.querySelector(`[onclick="showResultTab('${tabName}')"]`);
    if (targetButton) {
        targetButton.classList.add('active');
    }
    
    // Generar contenido específico según la pestaña
    if (tabName === 'statistics') {
        // Asegurar que se muestren las estadísticas
        if (statisticalAnalysis) {
            showStatisticalAnalysis();
        } else {
            showLocalStatisticalAnalysis();
        }
    } else if (tabName === 'percentiles') {
        // Asegurar que se muestre la tabla de percentiles
        generatePercentilesTable();
    } else if (tabName === 'charts') {
        // Asegurar que se muestre el gráfico
        if (currentTest) {
            generateDevelopmentChart();
        }
    } else if (tabName === 'haizea-table') {
        generateHaizeaTable();
    } else if (tabName === 'haizea-official') {
        generateOfficialTable();
    } else if (tabName === 'haizea-graphic') {
        generateGraphicChart();
    }
    
    console.log(`Pestaña '${tabName}' activada`);
}

// Descargar resultados en PDF (función placeholder)
function downloadPDF() {
    showNotification('Función de PDF en desarrollo', 'info');
    // TODO: Implementar generación de PDF
}

// Nuevo test
function newTest() {
    currentTest = null;
    currentQuestionIndex = 0;
    testResults = [];
    statisticalAnalysis = null;
    
    // Ocultar estadísticas del header
    document.getElementById('stats-header').style.display = 'none';
    
    // Cerrar panel de referencia si está abierto
    document.getElementById('haizea-reference-panel').style.display = 'none';
    document.getElementById('haizea-summary-stats').style.display = 'none';
    
    // Limpiar formulario
    document.getElementById('patient-form').reset();
    
    // Destruir gráfico si existe
    if (developmentChart) {
        developmentChart.destroy();
        developmentChart = null;
    }
    
    showScreen('welcome-screen');
}

// Descargar resultados JSON mejorado
function downloadResults() {
    if (!currentTest) return;
    
    const completeData = {
        ...currentTest,
        testResults,
        statisticalAnalysis,
        endTime: new Date(),
        version: '2.0',
        haizeaLlevantOfficial: true
    };
    
    const blob = new Blob([JSON.stringify(completeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `haizea-llevant-${currentTest.patientName}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
    
    showNotification('Resultados descargados con análisis estadístico completo', 'success');
}

// Mostrar pantalla
function showScreen(screenId) {
    // Ocultar todas las pantallas
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Mostrar pantalla solicitada
    document.getElementById(screenId).classList.add('active');
}

// Sistema de notificaciones mejorado
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
    notification.innerHTML = `${icon} ${message}`;
    
    // Estilos inline para la notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : type === 'warning' ? '#f39c12' : '#3498db'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 4 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Generar tabla visual de Haizea-Llevant con posición del paciente
function generateHaizeaTable() {
    if (!currentTest || !haizeaData) {
        console.log('No hay datos de test o Haizea para generar la tabla');
        return;
    }
    
    const patientAge = currentTest.patientAge;
    const tableContainer = document.getElementById('haizea-visual-table');
    const ageDisplay = document.getElementById('patient-age-display');
    const summaryStats = document.getElementById('haizea-summary-stats');
    
    // Mostrar edad del paciente
    ageDisplay.textContent = patientAge;
    
    // Calcular estadísticas de resumen
    const stats = calculateDevelopmentSummary(patientAge);
    updateSummaryStats(stats);
    summaryStats.style.display = 'block';
    
    // Generar HTML de la tabla
    let tableHTML = '';
    
    // Procesar cada área del desarrollo
    for (let areaKey in haizeaData) {
        const area = haizeaData[areaKey];
        const areaName = getAreaDisplayName(areaKey);
        
        tableHTML += `
            <div class="haizea-area-section">
                <div class="haizea-area-header">
                    ${areaName}
                </div>
                <div class="haizea-timeline">
                    ${generateAreaTimeline(areaKey, area, patientAge)}
                </div>
            </div>
        `;
    }
    
    tableContainer.innerHTML = tableHTML;
}

// Calcular estadísticas de resumen del desarrollo
function calculateDevelopmentSummary(patientAge) {
    let totalHitos = 0;
    let hitosEsperados = 0;
    let hitosSuperados = 0;
    let hitosRetrasados = 0;
    let hitosAvanzados = 0;
    
    // Contar hitos por área
    for (let areaKey in haizeaData) {
        const area = haizeaData[areaKey];
        area.forEach(hito => {
            totalHitos++;
            
            // Determinar si el hito debería estar superado a esta edad
            if (patientAge >= hito.percentiles.p50) {
                hitosEsperados++;
            }
            
            // Ver resultado real del hito
            const resultado = getHitoResult(hito.id);
            if (resultado) {
                if (resultado.result === 'pass') {
                    hitosSuperados++;
                    // Si el niño lo pasó antes de P25, es avanzado
                    if (patientAge < hito.percentiles.p25) {
                        hitosAvanzados++;
                    }
                } else if (resultado.result === 'fail') {
                    // Si no lo pasó después de P50, es retraso
                    if (patientAge > hito.percentiles.p50) {
                        hitosRetrasados++;
                    }
                }
            }
        });
    }
    
    // Determinar estado general del desarrollo
    let developmentStatus = 'normal';
    let developmentClass = 'normal';
    
    if (hitosRetrasados > 2) {
        developmentStatus = 'Retraso en el desarrollo';
        developmentClass = 'delayed';
    } else if (hitosRetrasados > 0) {
        developmentStatus = 'Desarrollo con áreas de preocupación';
        developmentClass = 'concerning';
    } else if (hitosAvanzados > 2) {
        developmentStatus = 'Desarrollo avanzado';
        developmentClass = 'excellent';
    } else if (hitosSuperados >= hitosEsperados * 0.8) {
        developmentStatus = 'Desarrollo adecuado';
        developmentClass = 'good';
    }
    
    return {
        totalHitos,
        hitosEsperados,
        hitosSuperados,
        hitosRetrasados,
        hitosAvanzados,
        developmentStatus,
        developmentClass
    };
}

// Actualizar estadísticas de resumen en la UI
function updateSummaryStats(stats) {
    document.getElementById('expected-hitos').textContent = `${stats.hitosSuperados}/${stats.hitosEsperados}`;
    document.getElementById('passed-hitos').textContent = `${stats.hitosSuperados}/${stats.totalHitos}`;
    
    const developmentElement = document.getElementById('general-development');
    developmentElement.textContent = stats.developmentStatus;
    developmentElement.className = `stat-value development-status ${stats.developmentClass}`;
}

// Generar timeline visual para un área específica
function generateAreaTimeline(areaKey, hitos, patientAge) {
    // Encontrar rango de meses para esta área
    let minAge = Math.min(...hitos.map(h => h.percentiles.p25));
    let maxAge = Math.max(...hitos.map(h => h.percentiles.p90));
    
    // Extender el rango para incluir la edad del paciente si es necesario
    minAge = Math.min(minAge, patientAge - 2);
    maxAge = Math.max(maxAge, patientAge + 6);
    
    // Redondear a múltiplos de 3 meses para mejor visualización
    minAge = Math.max(0, Math.floor(minAge / 3) * 3);
    maxAge = Math.ceil(maxAge / 3) * 3;
    
    const ageRange = maxAge - minAge;
    
    // Generar escala de edad
    let ageScaleHTML = '<div class="age-scale"><div class="age-markers">';
    
    // Marcadores de edad cada 3 meses
    for (let age = minAge; age <= maxAge; age += 3) {
        const position = ((age - minAge) / ageRange) * 100;
        ageScaleHTML += `
            <div class="age-marker" style="left: ${position}%">
                <div class="age-marker-label">${age}m</div>
            </div>
        `;
    }
    
    // Línea de edad del paciente
    const patientPosition = ((patientAge - minAge) / ageRange) * 100;
    ageScaleHTML += `
        <div class="patient-age-line" style="left: ${patientPosition}%"></div>
    `;
    
    ageScaleHTML += '</div></div>';
    
    // Generar hitos
    let hitosHTML = '<div class="hitos-timeline">';
    
    hitos.forEach(hito => {
        const hitoResult = getHitoResult(hito.id);
        const status = hitoResult ? hitoResult.result : 'not-evaluated';
        
        hitosHTML += `
            <div class="hito-item">
                <div class="hito-info">
                    <div class="hito-description">
                        <div class="hito-title">${hito.item}</div>
                        <div class="hito-subtitle">${hito.descripcion}</div>
                    </div>
                    <div class="hito-percentiles">
                        ${generatePercentileBar(hito, patientAge, minAge, ageRange)}
                    </div>
                </div>
                <div class="hito-status ${status}"></div>
            </div>
        `;
    });
    
    hitosHTML += '</div>';
    
    return ageScaleHTML + hitosHTML;
}

// Generar barra de percentiles visual
function generatePercentileBar(hito, patientAge, minAge, ageRange) {
    const p = hito.percentiles;
    
    // Calcular posiciones relativas
    const p25Pos = Math.max(0, Math.min(100, ((p.p25 - minAge) / ageRange) * 100));
    const p50Pos = Math.max(0, Math.min(100, ((p.p50 - minAge) / ageRange) * 100));
    const p75Pos = Math.max(0, Math.min(100, ((p.p75 - minAge) / ageRange) * 100));
    const p90Pos = Math.max(0, Math.min(100, ((p.p90 - minAge) / ageRange) * 100));
    const patientPos = Math.max(0, Math.min(100, ((patientAge - minAge) / ageRange) * 100));
    
    // Calcular anchos de los rangos
    const range0_25 = p25Pos;
    const range25_50 = p50Pos - p25Pos;
    const range50_75 = p75Pos - p50Pos;
    const range75_90 = p90Pos - p75Pos;
    const range90_100 = 100 - p90Pos;
    
    // Determinar status del paciente
    const patientStatus = getPatientDevelopmentStatus(hito, patientAge);
    const statusClass = getStatusClass(patientStatus.status);
    
    return `
        <div class="percentile-bar" title="Percentiles para: ${hito.item}">
            <div class="percentile-values">
                <span title="25% de niños logra este hito a los ${p.p25} meses">P25: ${p.p25}m</span>
                <span title="50% de niños logra este hito a los ${p.p50} meses">P50: ${p.p50}m</span>
                <span title="75% de niños logra este hito a los ${p.p75} meses">P75: ${p.p75}m</span>
                <span title="90% de niños logra este hito a los ${p.p90} meses">P90: ${p.p90}m</span>
            </div>
            <div class="percentile-ranges">
                <div class="percentile-range p0-25" style="width: ${range0_25}%" title="Desarrollo temprano"></div>
                <div class="percentile-range p25-50" style="width: ${range25_50}%" title="Rango normal bajo"></div>
                <div class="percentile-range p50-75" style="width: ${range50_75}%" title="Rango normal"></div>
                <div class="percentile-range p75-90" style="width: ${range75_90}%" title="Rango normal alto"></div>
                <div class="percentile-range p90-100" style="width: ${range90_100}%" title="Desarrollo tardío"></div>
            </div>
            <div class="patient-position-indicator ${statusClass}" 
                 style="left: ${patientPos}%" 
                 title="Paciente (${patientAge} meses): ${patientStatus.description}">
            </div>
        </div>
    `;
}

// Obtener clase CSS para el status del desarrollo
function getStatusClass(status) {
    const statusMap = {
        'early': 'status-early',
        'normal-low': 'status-normal',
        'normal': 'status-normal',
        'normal-high': 'status-normal',
        'advanced': 'status-advanced'
    };
    return statusMap[status] || 'status-normal';
}

// Obtener resultado de un hito específico
function getHitoResult(hitoId) {
    return testResults.find(result => result.hitoId === hitoId);
}

// Obtener estado del desarrollo del paciente en un hito
function getPatientDevelopmentStatus(hito, patientAge) {
    const p = hito.percentiles;
    
    if (patientAge < p.p25) {
        return { status: 'early', description: 'Temprano para la edad' };
    } else if (patientAge < p.p50) {
        return { status: 'normal-low', description: 'Normal (percentil bajo)' };
    } else if (patientAge < p.p75) {
        return { status: 'normal', description: 'Normal' };
    } else if (patientAge < p.p90) {
        return { status: 'normal-high', description: 'Normal (percentil alto)' };
    } else {
        return { status: 'advanced', description: 'Avanzado para la edad' };
    }
}

// Función para alternar el panel de referencia durante el test
function toggleHaizeaReference() {
    const panel = document.getElementById('haizea-reference-panel');
    const ageDisplay = document.getElementById('ref-patient-age');
    
    if (panel.style.display === 'none' || panel.style.display === '') {
        if (currentTest) {
            ageDisplay.textContent = currentTest.patientAge;
            updateCurrentHitoContext();
            panel.style.display = 'block';
        }
    } else {
        panel.style.display = 'none';
    }
}

// Actualizar contexto del hito actual en el panel de referencia
function updateCurrentHitoContext() {
    if (!currentTest || !haizeaData) return;
    
    const contextContainer = document.getElementById('current-hito-context');
    const allHitos = getAllHitos();
    
    if (testResults.length < allHitos.length) {
        const currentHito = allHitos[testResults.length];
        const patientStatus = getPatientDevelopmentStatus(currentHito, currentTest.patientAge);
        
        // Información del hito actual
        let contextHTML = `
            <div class="current-hito-info">
                <h5>🎯 Hito actual: ${currentHito.item}</h5>
                <p><strong>Área:</strong> ${getAreaDisplayName(currentHito.area)}</p>
                <p><strong>Descripción:</strong> ${currentHito.descripcion}</p>
                
                <div class="percentile-info-ref">
                    <div class="percentile-item">P25: ${currentHito.percentiles.p25}m</div>
                    <div class="percentile-item">P50: ${currentHito.percentiles.p50}m</div>
                    <div class="percentile-item">P75: ${currentHito.percentiles.p75}m</div>
                    <div class="percentile-item">P90: ${currentHito.percentiles.p90}m</div>
                    <div class="percentile-item patient-position">
                        Tu paciente (${currentTest.patientAge}m): ${patientStatus.description}
                    </div>
                </div>
            </div>
        `;
        
        // Mostrar otros hitos del área actual
        const currentArea = currentHito.area;
        const areaHitos = haizeaData[currentArea];
        
        contextHTML += `
            <div class="area-hitos-ref">
                <h6>📋 Otros hitos de ${getAreaDisplayName(currentArea)}</h6>
        `;
        
        areaHitos.forEach(hito => {
            const isCurrentHito = hito.id === currentHito.id;
            const hitoResult = getHitoResult(hito.id);
            const status = hitoResult ? hitoResult.result : 'pending';
            const statusIcon = getStatusIcon(status, isCurrentHito);
            
            contextHTML += `
                <div class="hito-ref-item ${isCurrentHito ? 'current' : ''}">
                    <div class="hito-ref-title">
                        ${statusIcon} ${hito.item}
                    </div>
                    <div class="hito-ref-percentiles">
                        <span>P25: ${hito.percentiles.p25}m</span>
                        <span>P50: ${hito.percentiles.p50}m</span>
                        <span>P75: ${hito.percentiles.p75}m</span>
                        <span>P90: ${hito.percentiles.p90}m</span>
                    </div>
                </div>
            `;
        });
        
        contextHTML += '</div>';
        contextContainer.innerHTML = contextHTML;
    }
}

// Obtener icono de estado para el panel de referencia
function getStatusIcon(status, isCurrent) {
    if (isCurrent) return '🎯';
    
    const icons = {
        'pass': '✅',
        'partial': '⚠️',
        'fail': '❌',
        'pending': '⏳'
    };
    return icons[status] || '❔';
}

// Variables para tabla oficial
let officialTableScale = 1;
let officialImageWidth = 0;
let officialImageHeight = 0;
let tableConfig = null;

// Cargar configuración de la tabla
async function loadTableConfig() {
    try {
        const response = await fetch('haizea_table_config.json');
        tableConfig = await response.json();
        console.log('✅ Configuración de tabla cargada:', tableConfig.calibration_info.version);
        return true;
    } catch (error) {
        console.error('❌ Error cargando configuración de tabla:', error);
        return false;
    }
}

// Generar tabla oficial con imagen de fondo
async function generateOfficialTable() {
    if (!currentTest) {
        console.log('No hay test actual para mostrar en tabla oficial');
        return;
    }
    
    // Cargar configuración si no está cargada
    if (!tableConfig) {
        const loaded = await loadTableConfig();
        if (!loaded) {
            showNotification('Error cargando configuración de tabla', 'error');
            return;
        }
    }
    
    const patientAge = currentTest.patientAge;
    const patientName = currentTest.patientName;
    
    // Actualizar información del paciente
    document.getElementById('official-patient-name').textContent = patientName;
    document.getElementById('official-patient-age').textContent = patientAge;
    
    console.log(`Generando tabla oficial para: ${patientName} (${patientAge} meses)`);
}

// Inicializar tabla oficial cuando la imagen se carga
function initializeOfficialTable() {
    const img = document.getElementById('haizea-official-img');
    officialImageWidth = img.clientWidth;
    officialImageHeight = img.clientHeight;
    
    console.log(`Imagen oficial cargada: ${officialImageWidth}x${officialImageHeight}px`);
    
    if (currentTest) {
        updateAgeLinePosition(currentTest.patientAge);
        renderHitoMarkers();
    }
}

// Actualizar posición de la línea de edad
function updateAgeLinePosition(ageInMonths) {
    const ageLine = document.getElementById('age-line-vertical');
    const ageLabel = document.getElementById('age-label-marker');
    const ageText = document.getElementById('age-marker-text');
    
    if (!ageLine || !ageLabel) return;
    
    // Calcular posición basada en la edad
    const position = calculateAgePosition(ageInMonths);
    const positionPercent = position * 100;
    
    // Actualizar posición de línea y etiqueta
    ageLine.style.left = `${positionPercent}%`;
    ageLabel.style.left = `${positionPercent}%`;
    ageText.textContent = `${ageInMonths}m`;
    
    console.log(`Línea de edad posicionada en ${positionPercent.toFixed(1)}% para ${ageInMonths} meses`);
}

// Calcular posición en la imagen basada en la edad
function calculateAgePosition(ageInMonths) {
    if (!tableConfig || !tableConfig.age_scale_mapping) {
        console.warn('Configuración de tabla no disponible, usando fallback');
        return 0.5;
    }
    
    const ageMapping = tableConfig.age_scale_mapping;
    const ages = Object.keys(ageMapping).map(Number).sort((a, b) => a - b);
    
    // Si la edad está fuera del rango, usar los extremos
    if (ageInMonths <= ages[0]) return ageMapping[ages[0]];
    if (ageInMonths >= ages[ages.length - 1]) return ageMapping[ages[ages.length - 1]];
    
    // Encontrar el rango donde está la edad
    for (let i = 0; i < ages.length - 1; i++) {
        const lowerAge = ages[i];
        const upperAge = ages[i + 1];
        
        if (ageInMonths >= lowerAge && ageInMonths <= upperAge) {
            // Interpolación lineal
            const ratio = (ageInMonths - lowerAge) / (upperAge - lowerAge);
            const lowerPos = ageMapping[lowerAge];
            const upperPos = ageMapping[upperAge];
            return lowerPos + ratio * (upperPos - lowerPos);
        }
    }
    
    return 0.5; // Fallback al centro
}

// Renderizar marcadores de hitos sobre la tabla
function renderHitoMarkers() {
    const overlay = document.getElementById('hitos-overlay');
    if (!overlay || !testResults || !tableConfig) {
        console.log('No se pueden renderizar marcadores: faltan datos');
        return;
    }
    
    // Limpiar marcadores existentes
    overlay.innerHTML = '';
    
    const hitoPositions = tableConfig.hito_positions;
    let markersCreated = 0;
    
    testResults.forEach((result, index) => {
        const position = hitoPositions[result.hitoId];
        if (position) {
            const marker = createHitoMarker(result, position);
            overlay.appendChild(marker);
            markersCreated++;
        }
    });
    
    console.log(`✅ Renderizados ${markersCreated} marcadores de hitos`);
}

// Crear marcador visual para un hito
function createHitoMarker(result, position) {
    const marker = document.createElement('div');
    marker.className = `hito-marker-official ${result.result}`;
    marker.style.left = `${position.x * 100}%`;
    marker.style.top = `${position.y * 100}%`;
    
    // Tooltip con información del hito
    const tooltip = document.createElement('div');
    tooltip.className = 'hito-tooltip';
    tooltip.innerHTML = `
        <strong>${result.hitoItem}</strong><br>
        Resultado: ${getResultText(result.result)}<br>
        Área: ${getAreaDisplayName(result.area)}<br>
        Edad esperada: ${position.age} meses
    `;
    marker.appendChild(tooltip);
    
    // Eventos para interactividad
    marker.addEventListener('click', () => {
        showHitoDetails(result);
    });
    
    marker.addEventListener('mouseenter', () => {
        marker.style.transform = 'translate(-50%, -50%) scale(1.5)';
        marker.style.zIndex = '20';
    });
    
    marker.addEventListener('mouseleave', () => {
        marker.style.transform = 'translate(-50%, -50%) scale(1)';
        marker.style.zIndex = '10';
    });
    
    return marker;
}

// Obtener texto descriptivo del resultado
function getResultText(result) {
    const texts = {
        'pass': 'Superado',
        'partial': 'Parcial', 
        'fail': 'No superado'
    };
    return texts[result] || 'Desconocido';
}

// Mostrar detalles de un hito
function showHitoDetails(result) {
    const position = tableConfig?.hito_positions?.[result.hitoId];
    const expectedAge = position ? `${position.age} meses` : 'No disponible';
    
    const message = `
🎯 HITO: ${result.hitoItem}

📊 RESULTADO: ${getResultText(result.result)}
📋 ÁREA: ${getAreaDisplayName(result.area)}
📅 EDAD ESPERADA: ${expectedAge}
👶 PACIENTE: ${currentTest.patientAge} meses

${result.result === 'pass' ? '✅ Hito superado correctamente' :
  result.result === 'partial' ? '⚠️ Hito parcialmente logrado' :
  '❌ Hito no superado - considerar seguimiento'}
    `.trim();
    
    alert(message);
}

// Funciones de zoom para tabla oficial
function zoomOfficial(factor) {
    officialTableScale *= factor;
    officialTableScale = Math.max(0.5, Math.min(3, officialTableScale)); // Límites de zoom
    
    const img = document.getElementById('haizea-official-img');
    img.style.transform = `scale(${officialTableScale})`;
    
    updateZoomDisplay();
}

function resetZoomOfficial() {
    officialTableScale = 1;
    const img = document.getElementById('haizea-official-img');
    img.style.transform = 'scale(1)';
    updateZoomDisplay();
}

function updateZoomDisplay() {
    document.getElementById('zoom-level').textContent = `${Math.round(officialTableScale * 100)}%`;
}

// Redimensionar cuando cambia el tamaño de ventana
window.addEventListener('resize', () => {
    if (document.getElementById('haizea-official-tab').classList.contains('active')) {
        setTimeout(initializeOfficialTable, 100);
    }
    if (document.getElementById('haizea-graphic-tab').classList.contains('active')) {
        setTimeout(initializeGraphicChart, 100);
    }
});

// Variables para la tabla gráfica original
let graphicChartScale = 1;
let graphicImageWidth = 0;
let graphicImageHeight = 0;
let graphicChartConfig = null;

// Cargar configuración de la tabla gráfica
async function loadGraphicChartConfig() {
    try {
        const response = await fetch('haizea_chart_config.json');
        graphicChartConfig = await response.json();
        console.log('✅ Configuración de gráfica original cargada');
        return true;
    } catch (error) {
        console.error('❌ Error cargando configuración de gráfica:', error);
        return false;
    }
}

// Generar tabla gráfica original
async function generateGraphicChart() {
    if (!currentTest) {
        console.log('No hay test actual para mostrar en gráfica original');
        return;
    }
    
    // Cargar configuración si no está cargada
    if (!graphicChartConfig) {
        const loaded = await loadGraphicChartConfig();
        if (!loaded) {
            showNotification('Error cargando configuración de gráfica', 'error');
            return;
        }
    }
    
    const patientAge = currentTest.patientAge;
    const patientName = currentTest.patientName;
    
    // Actualizar información del paciente
    document.getElementById('graphic-patient-name').textContent = patientName;
    document.getElementById('graphic-patient-age').textContent = patientAge;
    
    console.log(`Generando gráfica original para: ${patientName} (${patientAge} meses)`);
}

// Inicializar gráfica cuando la imagen se carga
function initializeGraphicChart() {
    const img = document.getElementById('haizea-graphic-img');
    if (!img.complete) return;
    
    graphicImageWidth = img.clientWidth;
    graphicImageHeight = img.clientHeight;
    
    console.log(`Imagen gráfica cargada: ${graphicImageWidth}x${graphicImageHeight}px`);
    
    if (currentTest) {
        updateGraphicAgeLinePosition(currentTest.patientAge);
        renderGraphicHitoMarkers();
    }
}

// Actualizar posición de la línea de edad en la gráfica
function updateGraphicAgeLinePosition(ageInMonths) {
    const ageLine = document.getElementById('age-line-graphic-vertical');
    const ageLabel = document.getElementById('age-label-graphic-marker');
    const ageText = document.getElementById('age-marker-graphic-text');
    
    if (!ageLine || !ageLabel || !graphicChartConfig) return;
    
    // Calcular posición basada en la escala de meses
    const position = calculateGraphicAgePosition(ageInMonths);
    const positionPercent = position * 100;
    
    // Actualizar posición de línea y etiqueta
    ageLine.style.left = `${positionPercent}%`;
    ageLabel.style.left = `${positionPercent}%`;
    ageText.textContent = `${ageInMonths}m`;
    
    console.log(`Línea de edad gráfica posicionada en ${positionPercent.toFixed(1)}% para ${ageInMonths} meses`);
}

// Calcular posición en la gráfica basada en la edad
function calculateGraphicAgePosition(ageInMonths) {
    if (!graphicChartConfig || !graphicChartConfig.month_scale) {
        console.warn('Configuración de gráfica no disponible, usando fallback');
        return 0.5;
    }
    
    const monthScale = graphicChartConfig.month_scale;
    const positions = monthScale.positions;
    
    // Si la edad está fuera del rango, usar los extremos
    if (ageInMonths <= positions[0].month) {
        return positions[0].percentage / 100;
    }
    if (ageInMonths >= positions[positions.length - 1].month) {
        return positions[positions.length - 1].percentage / 100;
    }
    
    // Encontrar el rango donde está la edad
    for (let i = 0; i < positions.length - 1; i++) {
        const lowerPos = positions[i];
        const upperPos = positions[i + 1];
        
        if (ageInMonths >= lowerPos.month && ageInMonths <= upperPos.month) {
            // Interpolación lineal
            const ratio = (ageInMonths - lowerPos.month) / (upperPos.month - lowerPos.month);
            const lowerPercent = lowerPos.percentage / 100;
            const upperPercent = upperPos.percentage / 100;
            return lowerPercent + ratio * (upperPercent - lowerPercent);
        }
    }
    
    return 0.5; // Fallback al centro
}

// Renderizar marcadores de hitos sobre la gráfica
function renderGraphicHitoMarkers() {
    const overlay = document.getElementById('hitos-graphic-overlay');
    if (!overlay || !testResults || !graphicChartConfig) {
        console.log('No se pueden renderizar marcadores gráficos: faltan datos');
        return;
    }
    
    // Limpiar marcadores existentes
    overlay.innerHTML = '';
    
    const areas = graphicChartConfig.areas;
    let markersCreated = 0;
    
    testResults.forEach((result, index) => {
        const position = calculateGraphicHitoPosition(result);
        if (position) {
            const marker = createGraphicHitoMarker(result, position);
            overlay.appendChild(marker);
            markersCreated++;
        }
    });
    
    console.log(`✅ Renderizados ${markersCreated} marcadores gráficos de hitos`);
}

// Calcular posición gráfica de un hito
function calculateGraphicHitoPosition(result) {
    if (!graphicChartConfig || !result.percentiles) return null;
    
    const areas = graphicChartConfig.areas;
    const areaConfig = areas[result.area];
    
    if (!areaConfig) return null;
    
    // Posición X basada en el percentil p50 del hito
    const xPosition = calculateGraphicAgePosition(result.percentiles.p50);
    
    // Posición Y basada en el área (centro del área)
    const yStart = areaConfig.y_start_percent / 100;
    const yEnd = areaConfig.y_end_percent / 100;
    const yPosition = (yStart + yEnd) / 2;
    
    return {
        x: xPosition,
        y: yPosition,
        expectedAge: result.percentiles.p50
    };
}

// Crear marcador visual para un hito en la gráfica
function createGraphicHitoMarker(result, position) {
    const marker = document.createElement('div');
    marker.className = `hito-marker-graphic ${result.result}`;
    marker.style.left = `${position.x * 100}%`;
    marker.style.top = `${position.y * 100}%`;
    
    // Tooltip con información del hito
    const tooltip = document.createElement('div');
    tooltip.className = 'hito-tooltip';
    tooltip.innerHTML = `
        <strong>${result.hitoItem}</strong><br>
        Resultado: ${getResultText(result.result)}<br>
        Área: ${getAreaDisplayName(result.area)}<br>
        P50: ${position.expectedAge} meses<br>
        Paciente: ${currentTest.patientAge} meses
    `;
    marker.appendChild(tooltip);
    
    // Eventos para interactividad
    marker.addEventListener('click', () => {
        showGraphicHitoDetails(result, position);
    });
    
    return marker;
}

// Mostrar detalles de un hito en la gráfica
function showGraphicHitoDetails(result, position) {
    const patientStatus = getPatientDevelopmentStatus(result, currentTest.patientAge);
    
    const message = `
🎯 HITO: ${result.hitoItem}

📊 RESULTADO: ${getResultText(result.result)}
📋 ÁREA: ${getAreaDisplayName(result.area)}

📈 PERCENTILES:
• P25: ${result.percentiles.p25} meses
• P50: ${result.percentiles.p50} meses
• P75: ${result.percentiles.p75} meses
• P90: ${result.percentiles.p90} meses

👶 PACIENTE: ${currentTest.patientAge} meses
📊 ESTADO: ${patientStatus.description}

${result.result === 'pass' ? '✅ Hito superado correctamente' :
  result.result === 'partial' ? '⚠️ Hito parcialmente logrado' :
  '❌ Hito no superado - considerar seguimiento'}
    `.trim();
    
    alert(message);
}

// Funciones de zoom para gráfica
function zoomGraphicChart(factor) {
    graphicChartScale *= factor;
    graphicChartScale = Math.max(0.5, Math.min(3, graphicChartScale)); // Límites de zoom
    
    const img = document.getElementById('haizea-graphic-img');
    img.style.transform = `scale(${graphicChartScale})`;
    
    updateGraphicZoomDisplay();
}

function resetZoomGraphicChart() {
    graphicChartScale = 1;
    const img = document.getElementById('haizea-graphic-img');
    img.style.transform = 'scale(1)';
    updateGraphicZoomDisplay();
}

function updateGraphicZoomDisplay() {
    document.getElementById('graphic-zoom-level').textContent = `${Math.round(graphicChartScale * 100)}%`;
}

// Actualizar función showResultTab para incluir la nueva pestaña gráfica
const originalShowResultTab = showResultTab;
showResultTab = function(tabName) {
    // Llamar a la función original
    originalShowResultTab(tabName);
    
    // Si es la gráfica original, inicializarla
    if (tabName === 'haizea-graphic') {
        generateGraphicChart();
    }
};