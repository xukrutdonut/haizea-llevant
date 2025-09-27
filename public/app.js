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
    
    // Generar análisis estadístico si está disponible
    if (statisticalAnalysis) {
        showStatisticalAnalysis();
        await generateDevelopmentChart();
        generatePercentilesTable();
    }
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
    let tableHtml = `
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
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    testResults.forEach((result, index) => {
        const p = result.percentiles;
        const edadPaciente = currentTest.patientAge;
        
        let estado = 'normal';
        let estadoTexto = 'Normal';
        
        if (edadPaciente < p.p25) {
            estado = result.result === 'fail' ? 'danger' : 'advanced';
            estadoTexto = result.result === 'fail' ? 'Posible retraso' : 'Precoz';
        } else if (edadPaciente > p.p90) {
            estado = result.result === 'pass' ? 'advanced' : 'warning';
            estadoTexto = result.result === 'pass' ? 'Avanzado' : 'Tardío';
        }
        
        const resultIcon = result.result === 'pass' ? '✅' : result.result === 'partial' ? '⚠️' : '❌';
        
        tableHtml += `
            <tr>
                <td>${result.hitoItem}</td>
                <td>${getAreaDisplayName(result.area)}</td>
                <td>${resultIcon}</td>
                <td>${p.p25}m</td>
                <td>${p.p50}m</td>
                <td>${p.p75}m</td>
                <td>${p.p90}m</td>
                <td><span class="percentil-status ${estado}">${estadoTexto}</span></td>
            </tr>
        `;
    });
    
    tableHtml += `
            </tbody>
        </table>
    `;
    
    document.getElementById('percentiles-table').innerHTML = tableHtml;
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
    document.getElementById(tabName + '-tab').classList.add('active');
    document.querySelector(`[onclick="showResultTab('${tabName}')"]`).classList.add('active');
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