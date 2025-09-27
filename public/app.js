// Estado de la aplicación
let currentTest = null;
let currentQuestionIndex = 0;
let testResults = [];

// Áreas del test Haizea-Llevant
const testAreas = [
    {
        name: "Socialización",
        questions: [
            "Sonríe cuando se le habla",
            "Mantiene contacto visual",
            "Responde a su nombre",
            "Muestra ansiedad ante extraños"
        ]
    },
    {
        name: "Lenguaje y Comunicación",
        questions: [
            "Emite sonidos guturales",
            "Balbucea consonantes",
            "Dice 'mamá' o 'papá'",
            "Comprende órdenes simples"
        ]
    },
    {
        name: "Motricidad Gruesa",
        questions: [
            "Mantiene la cabeza erguida",
            "Se sienta sin apoyo",
            "Gatea o se arrastra",
            "Se pone de pie con apoyo"
        ]
    },
    {
        name: "Motricidad Fina",
        questions: [
            "Sigue objetos con la vista",
            "Alcanza objetos",
            "Transfiere objetos de mano",
            "Usa pinza digital"
        ]
    },
    {
        name: "Resolución de Problemas",
        questions: [
            "Busca objeto caído",
            "Imita gestos simples",
            "Usa objetos funcionalmente",
            "Resuelve problemas simples"
        ]
    }
];

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Haizea-Llevant App iniciada');
    
    // Event listener para el formulario de paciente
    document.getElementById('patient-form').addEventListener('submit', startTest);
    
    // Verificar estado del servidor
    checkServerHealth();
});

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

// Iniciar test
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
        
        // Cambiar a pantalla de test
        showScreen('test-screen');
        showCurrentQuestion();
        
        showNotification('Test iniciado correctamente', 'success');
        
    } catch (error) {
        console.error('Error al iniciar test:', error);
        showNotification('Error al iniciar el test', 'error');
    }
}

// Mostrar pregunta actual
function showCurrentQuestion() {
    const totalQuestions = testAreas.reduce((sum, area) => sum + area.questions.length, 0);
    const progress = (testResults.length / totalQuestions) * 100;
    
    // Actualizar barra de progreso
    document.getElementById('progress').style.width = progress + '%';
    
    // Encontrar área y pregunta actual
    let questionCount = 0;
    let currentArea = null;
    let currentQuestion = null;
    
    for (let area of testAreas) {
        if (questionCount + area.questions.length > testResults.length) {
            currentArea = area;
            currentQuestion = area.questions[testResults.length - questionCount];
            break;
        }
        questionCount += area.questions.length;
    }
    
    if (currentArea && currentQuestion) {
        document.getElementById('current-area').textContent = currentArea.name;
        document.getElementById('test-question').innerHTML = `
            <h3>Pregunta ${testResults.length + 1} de ${totalQuestions}</h3>
            <p class="question-text">${currentQuestion}</p>
        `;
    } else {
        // Test completado
        finishTest();
    }
}

// Registrar resultado
function recordResult(result) {
    testResults.push({
        questionIndex: testResults.length,
        result: result,
        timestamp: new Date()
    });
    
    showCurrentQuestion();
}

// Finalizar test
async function finishTest() {
    try {
        // Enviar resultados al servidor
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
        
        await response.json();
        
        // Mostrar resultados
        showResults();
        showScreen('results-screen');
        
    } catch (error) {
        console.error('Error al guardar resultados:', error);
        showNotification('Error al guardar los resultados', 'error');
    }
}

// Mostrar resultados
function showResults() {
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

// Nuevo test
function newTest() {
    currentTest = null;
    currentQuestionIndex = 0;
    testResults = [];
    
    // Limpiar formulario
    document.getElementById('patient-form').reset();
    
    showScreen('welcome-screen');
}

// Descargar resultados
function downloadResults() {
    if (!currentTest) return;
    
    const data = {
        ...currentTest,
        testResults,
        endTime: new Date()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `haizea-llevant-${currentTest.patientName}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
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

// Sistema de notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Estilos inline para la notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#27ae60' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// CSS para animaciones de notificación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    
    .stat {
        text-align: center;
        padding: 20px;
        border-radius: 8px;
        color: white;
    }
    
    .stat.success { background: #27ae60; }
    .stat.warning { background: #f39c12; }
    .stat.danger { background: #e74c3c; }
    .stat.primary { background: #3498db; }
    
    .stat-number {
        font-size: 2em;
        font-weight: bold;
        margin-bottom: 5px;
    }
    
    .stat-label {
        font-size: 0.9em;
        opacity: 0.9;
    }
    
    .question-text {
        font-size: 1.3em;
        margin: 20px 0;
        font-weight: 500;
    }
`;

document.head.appendChild(style);