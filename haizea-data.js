// Datos oficiales del Test Haizea-Llevant basados en la tabla oficial
// Percentiles: P25, P50, P75, P90 para cada hito del desarrollo

const HAIZEA_LLEVANT_DATA = {
    // ÁREA DE SOCIALIZACIÓN
    socializacion: [
        {
            id: 'soc_001',
            item: 'Sonríe espontáneamente',
            descripcion: 'Sonríe sin estimulación externa, de forma espontánea',
            percentiles: { p25: 1.5, p50: 2.0, p75: 2.5, p90: 3.0 }, // meses
            tipo: 'social',
            categoria: 'interaccion_social'
        },
        {
            id: 'soc_002', 
            item: 'Sonríe en respuesta',
            descripcion: 'Sonríe como respuesta a la sonrisa del adulto',
            percentiles: { p25: 1.0, p50: 1.5, p75: 2.0, p90: 2.5 },
            tipo: 'social',
            categoria: 'interaccion_social'
        },
        {
            id: 'soc_003',
            item: 'Reconoce a la madre',
            descripcion: 'Muestra preferencia clara por la madre/cuidador principal',
            percentiles: { p25: 2.0, p50: 3.0, p75: 4.0, p90: 5.0 },
            tipo: 'social',
            categoria: 'vinculo'
        },
        {
            id: 'soc_004',
            item: 'Responde a su nombre',
            descripcion: 'Voltea o responde cuando se le llama por su nombre',
            percentiles: { p25: 7.0, p50: 9.0, p75: 11.0, p90: 13.0 },
            tipo: 'social',
            categoria: 'identidad'
        },
        {
            id: 'soc_005',
            item: 'Ansiedad ante extraños',
            descripcion: 'Muestra cautela o ansiedad ante personas desconocidas',
            percentiles: { p25: 6.0, p50: 8.0, p75: 10.0, p90: 12.0 },
            tipo: 'social',
            categoria: 'vinculo'
        },
        {
            id: 'soc_006',
            item: 'Juega con otros niños',
            descripcion: 'Interactúa y juega cooperativamente con otros niños',
            percentiles: { p25: 15.0, p50: 18.0, p75: 21.0, p90: 24.0 },
            tipo: 'social',
            categoria: 'juego_social'
        }
    ],

    // ÁREA DE LENGUAJE Y COMUNICACIÓN
    lenguaje: [
        {
            id: 'len_001',
            item: 'Emite sonidos guturales',
            descripcion: 'Produce sonidos desde la garganta, gorjeos',
            percentiles: { p25: 1.0, p50: 2.0, p75: 3.0, p90: 4.0 },
            tipo: 'lenguaje',
            categoria: 'prelenguaje'
        },
        {
            id: 'len_002',
            item: 'Ríe a carcajadas',
            descripcion: 'Produce risa sonora y expresiva',
            percentiles: { p25: 2.5, p50: 4.0, p75: 5.5, p90: 7.0 },
            tipo: 'lenguaje',
            categoria: 'expresion'
        },
        {
            id: 'len_003',
            item: 'Balbucea',
            descripcion: 'Produce sonidos consonante-vocal repetitivos (ba-ba, ma-ma)',
            percentiles: { p25: 4.0, p50: 6.0, p75: 8.0, p90: 10.0 },
            tipo: 'lenguaje',
            categoria: 'prelenguaje'
        },
        {
            id: 'len_004',
            item: 'Dice "mamá" o "papá"',
            descripcion: 'Dice mamá o papá con intención específica',
            percentiles: { p25: 8.0, p50: 11.0, p75: 14.0, p90: 17.0 },
            tipo: 'lenguaje',
            categoria: 'primeras_palabras'
        },
        {
            id: 'len_005',
            item: 'Comprende órdenes simples',
            descripcion: 'Entiende y obedece instrucciones sencillas como "ven aquí"',
            percentiles: { p25: 9.0, p50: 12.0, p75: 15.0, p90: 18.0 },
            tipo: 'lenguaje',
            categoria: 'comprension'
        },
        {
            id: 'len_006',
            item: 'Dice 2-3 palabras',
            descripcion: 'Utiliza un vocabulario de 2-3 palabras con significado',
            percentiles: { p25: 12.0, p50: 15.0, p75: 18.0, p90: 21.0 },
            tipo: 'lenguaje',
            categoria: 'vocabulario'
        },
        {
            id: 'len_007',
            item: 'Combina 2 palabras',
            descripcion: 'Une dos palabras para formar frases simples',
            percentiles: { p25: 18.0, p50: 21.0, p75: 24.0, p90: 30.0 },
            tipo: 'lenguaje',
            categoria: 'sintaxis'
        }
    ],

    // ÁREA DE MOTRICIDAD GRUESA
    motricidad_gruesa: [
        {
            id: 'mg_001',
            item: 'Mantiene cabeza erguida',
            descripcion: 'Sostiene la cabeza cuando está en posición prona',
            percentiles: { p25: 1.0, p50: 2.0, p75: 3.0, p90: 4.0 },
            tipo: 'motor_grueso',
            categoria: 'control_cefalico'
        },
        {
            id: 'mg_002',
            item: 'Se mantiene sentado con apoyo',
            descripcion: 'Permanece sentado con apoyo de las manos o cojines',
            percentiles: { p25: 4.0, p50: 5.0, p75: 6.0, p90: 7.0 },
            tipo: 'motor_grueso',
            categoria: 'sedestacion'
        },
        {
            id: 'mg_003',
            item: 'Se sienta sin apoyo',
            descripcion: 'Mantiene posición sentada sin ningún soporte',
            percentiles: { p25: 5.5, p50: 7.0, p75: 8.5, p90: 10.0 },
            tipo: 'motor_grueso',
            categoria: 'sedestacion'
        },
        {
            id: 'mg_004',
            item: 'Gatea',
            descripcion: 'Se desplaza gateando sobre manos y rodillas',
            percentiles: { p25: 7.0, p50: 9.0, p75: 11.0, p90: 13.0 },
            tipo: 'motor_grueso',
            categoria: 'desplazamiento'
        },
        {
            id: 'mg_005',
            item: 'Se pone de pie con apoyo',
            descripción: 'Se incorpora a la posición de pie agarrándose',
            percentiles: { p25: 8.0, p50: 10.0, p75: 12.0, p90: 14.0 },
            tipo: 'motor_grueso',
            categoria: 'bipedestacion'
        },
        {
            id: 'mg_006',
            item: 'Camina con apoyo',
            descripcion: 'Da pasos sostenido de las manos o muebles',
            percentiles: { p25: 10.0, p50: 12.0, p75: 14.0, p90: 16.0 },
            tipo: 'motor_grueso',
            categoria: 'marcha'
        },
        {
            id: 'mg_007',
            item: 'Camina solo',
            descripcion: 'Camina independientemente sin apoyo',
            percentiles: { p25: 11.0, p50: 13.0, p75: 15.0, p90: 18.0 },
            tipo: 'motor_grueso',
            categoria: 'marcha'
        },
        {
            id: 'mg_008',
            item: 'Sube escaleras',
            descripcion: 'Sube escalones gateando o con apoyo',
            percentiles: { p25: 15.0, p50: 18.0, p75: 21.0, p90: 24.0 },
            tipo: 'motor_grueso',
            categoria: 'marcha_avanzada'
        }
    ],

    // ÁREA DE MOTRICIDAD FINA
    motricidad_fina: [
        {
            id: 'mf_001',
            item: 'Sigue objetos con la vista',
            descripcion: 'Rastrea objetos en movimiento con los ojos',
            percentiles: { p25: 0.5, p50: 1.0, p75: 1.5, p90: 2.0 },
            tipo: 'motor_fino',
            categoria: 'seguimiento_visual'
        },
        {
            id: 'mf_002',
            item: 'Mantiene manos abiertas',
            descripcion: 'Relaja las manos, no mantiene puños cerrados',
            percentiles: { p25: 2.0, p50: 3.0, p75: 4.0, p90: 5.0 },
            tipo: 'motor_fino',
            categoria: 'control_manual'
        },
        {
            id: 'mf_003',
            item: 'Alcanza objetos',
            descripcion: 'Extiende brazos y manos hacia objetos de interés',
            percentiles: { p25: 3.0, p50: 4.0, p75: 5.0, p90: 6.0 },
            tipo: 'motor_fino',
            categoria: 'prension'
        },
        {
            id: 'mf_004',
            item: 'Transfiere objetos',
            descripcion: 'Pasa objetos de una mano a la otra',
            percentiles: { p25: 5.0, p50: 7.0, p75: 9.0, p90: 11.0 },
            tipo: 'motor_fino',
            categoria: 'manipulacion'
        },
        {
            id: 'mf_005',
            item: 'Prensión en pinza',
            descripcion: 'Agarra objetos pequeños usando pulgar e índice',
            percentiles: { p25: 8.0, p50: 10.0, p75: 12.0, p90: 14.0 },
            tipo: 'motor_fino',
            categoria: 'pinza'
        },
        {
            id: 'mf_006',
            item: 'Hace garabatos',
            descripcion: 'Traza líneas o marcas con crayón o lápiz',
            percentiles: { p25: 12.0, p50: 15.0, p75: 18.0, p90: 21.0 },
            tipo: 'motor_fino',
            categoria: 'grafomotricidad'
        }
    ],

    // ÁREA DE RESOLUCIÓN DE PROBLEMAS
    resolucion_problemas: [
        {
            id: 'rp_001',
            item: 'Busca objeto caído',
            descripcion: 'Mira hacia abajo cuando se le cae un objeto',
            percentiles: { p25: 3.0, p50: 5.0, p75: 7.0, p90: 9.0 },
            tipo: 'cognitivo',
            categoria: 'permanencia_objeto'
        },
        {
            id: 'rp_002',
            item: 'Encuentra objeto oculto',
            descripcion: 'Busca y encuentra objeto parcialmente cubierto',
            percentiles: { p25: 6.0, p50: 8.0, p75: 10.0, p90: 12.0 },
            tipo: 'cognitivo',
            categoria: 'permanencia_objeto'
        },
        {
            id: 'rp_003',
            item: 'Imita gestos',
            descripcion: 'Copia gestos simples como aplaudir o decir adiós',
            percentiles: { p25: 8.0, p50: 10.0, p75: 12.0, p90: 14.0 },
            tipo: 'cognitivo',
            categoria: 'imitacion'
        },
        {
            id: 'rp_004',
            item: 'Usa objetos funcionalmente',
            descripcion: 'Utiliza objetos para su propósito (cuchara para comer)',
            percentiles: { p25: 11.0, p50: 14.0, p75: 17.0, p90: 20.0 },
            tipo: 'cognitivo',
            categoria: 'uso_herramientas'
        },
        {
            id: 'rp_005',
            item: 'Resuelve problemas simples',
            descripcion: 'Encuentra soluciones a problemas básicos (alcanzar juguete)',
            percentiles: { p25: 15.0, p50: 18.0, p75: 21.0, p90: 24.0 },
            tipo: 'cognitivo',
            categoria: 'resolucion'
        }
    ]
};

// Función para obtener el percentil esperado para un hito a cierta edad
function getPercentilForAge(hito, edadMeses) {
    const percentiles = hito.percentiles;
    
    if (edadMeses < percentiles.p25) {
        return 'Por debajo de P25 - Posible retraso';
    } else if (edadMeses < percentiles.p50) {
        return 'P25-P50 - Límite inferior normal';
    } else if (edadMeses < percentiles.p75) {
        return 'P50-P75 - Normal';
    } else if (edadMeses < percentiles.p90) {
        return 'P75-P90 - Normal superior';
    } else {
        return 'Por encima de P90 - Avanzado';
    }
}

// Función para evaluar el desarrollo global
function evaluateGlobalDevelopment(resultados, edadMeses) {
    let evaluation = {
        total: 0,
        passed: 0,
        delayed: 0,
        advanced: 0,
        byArea: {}
    };
    
    for (let area in HAIZEA_LLEVANT_DATA) {
        evaluation.byArea[area] = {
            total: 0,
            passed: 0,
            delayed: 0,
            percentiles: []
        };
    }
    
    // Procesar resultados...
    return evaluation;
}

// Exportar datos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        HAIZEA_LLEVANT_DATA,
        getPercentilForAge,
        evaluateGlobalDevelopment
    };
}