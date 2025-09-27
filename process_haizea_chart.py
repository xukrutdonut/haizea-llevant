#!/usr/bin/env python3
"""
Script para procesar la tabla gráfica Haizea-Llevant del PDF
- Rota la imagen para orientación horizontal
- Extrae la escala de meses del eje X
- Prepara los datos para la representación web
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
import json
import os
import sys

def rotate_and_process_table(input_path, output_path):
    """
    Procesa la tabla Haizea-Llevant: la rota y prepara para uso web
    """
    try:
        # Cargar imagen
        print(f"Cargando imagen: {input_path}")
        img = Image.open(input_path)
        print(f"Dimensiones originales: {img.size}")
        
        # La tabla está en formato vertical, necesitamos rotarla 90 grados para horizontal
        print("Rotando imagen 90 grados para orientación horizontal...")
        rotated_img = img.rotate(-90, expand=True)
        print(f"Nuevas dimensiones: {rotated_img.size}")
        
        # Guardar imagen rotada
        rotated_img.save(output_path, 'PNG', quality=95)
        print(f"Imagen rotada guardada en: {output_path}")
        
        # Calcular escala aproximada de meses basada en las dimensiones
        # En la tabla Haizea-Llevant, el rango típico es de 0 a 72 meses
        width, height = rotated_img.size
        
        # Estimamos que la escala de meses ocupa aprox. 80% del ancho de la imagen
        usable_width = width * 0.8
        margin_left = width * 0.1  # Margen izquierdo aprox.
        
        # Crear escala de meses (0 a 72 meses)
        max_months = 72
        month_positions = []
        
        for month in range(0, max_months + 1, 6):  # Cada 6 meses
            x_position = margin_left + (month / max_months) * usable_width
            month_positions.append({
                'month': month,
                'x_position': round(x_position),
                'percentage': round((x_position / width) * 100, 2)
            })
        
        # Configuración para la visualización web
        chart_config = {
            'image_path': 'tabla_haizea_grafica_horizontal.png',
            'original_dimensions': {
                'width': width,
                'height': height
            },
            'month_scale': {
                'range': [0, max_months],
                'positions': month_positions,
                'usable_width_percent': 80,
                'margin_left_percent': 10
            },
            'areas': {
                'socializacion': {'y_start_percent': 10, 'y_end_percent': 25},
                'lenguaje': {'y_start_percent': 25, 'y_end_percent': 40},
                'motricidad_gruesa': {'y_start_percent': 40, 'y_end_percent': 55},
                'motricidad_fina': {'y_start_percent': 55, 'y_end_percent': 70},
                'resolucion_problemas': {'y_start_percent': 70, 'y_end_percent': 85}
            },
            'legend': {
                'patient_age_line': {
                    'color': '#FF0000',
                    'width': 3,
                    'style': 'solid'
                },
                'percentile_bands': {
                    'p25': '#FFE6E6',
                    'p50': '#FFB3B3', 
                    'p75': '#FF8080',
                    'p90': '#FF4D4D'
                }
            }
        }
        
        return chart_config
        
    except Exception as e:
        print(f"Error procesando imagen: {e}")
        return None

def create_age_line_overlay(age_months, chart_config, output_path):
    """
    Crea una imagen overlay con la línea vertical de edad
    """
    try:
        width = chart_config['original_dimensions']['width']
        height = chart_config['original_dimensions']['height']
        
        # Crear imagen transparente para el overlay
        overlay = Image.new('RGBA', (width, height), (255, 255, 255, 0))
        draw = ImageDraw.Draw(overlay)
        
        # Calcular posición X para la edad del paciente
        margin_left_percent = chart_config['month_scale']['margin_left_percent']
        usable_width_percent = chart_config['month_scale']['usable_width_percent']
        max_months = chart_config['month_scale']['range'][1]
        
        if age_months > max_months:
            age_months = max_months
        
        # Calcular posición X
        x_position = (width * margin_left_percent / 100) + \
                    (age_months / max_months) * (width * usable_width_percent / 100)
        
        # Dibujar línea vertical
        line_color = chart_config['legend']['patient_age_line']['color']
        line_width = chart_config['legend']['patient_age_line']['width']
        
        draw.line([(x_position, 0), (x_position, height)], 
                 fill=line_color, width=line_width)
        
        # Añadir etiqueta de edad
        try:
            font = ImageFont.load_default()
        except:
            font = None
            
        text = f"{age_months}m"
        if font:
            bbox = draw.textbbox((0, 0), text, font=font)
            text_width = bbox[2] - bbox[0]
            text_height = bbox[3] - bbox[1]
        else:
            text_width = len(text) * 6
            text_height = 12
            
        # Posicionar etiqueta
        text_x = x_position - text_width / 2
        text_y = 10
        
        # Fondo para la etiqueta
        draw.rectangle([text_x - 5, text_y - 2, text_x + text_width + 5, text_y + text_height + 2],
                      fill=(255, 255, 255, 200), outline=(0, 0, 0, 255))
        
        draw.text((text_x, text_y), text, fill=(0, 0, 0, 255), font=font)
        
        # Guardar overlay
        overlay.save(output_path, 'PNG')
        print(f"Overlay de edad creado: {output_path}")
        
        return {
            'overlay_path': output_path,
            'age_months': age_months,
            'x_position': round(x_position),
            'x_percentage': round((x_position / width) * 100, 2)
        }
        
    except Exception as e:
        print(f"Error creando overlay: {e}")
        return None

def main():
    # Rutas de archivos
    base_path = '/home/arkantu/docker/haizea-llevant'
    input_image = os.path.join(base_path, 'tabla_grafica-1.png')
    output_image = os.path.join(base_path, 'public', 'tabla_haizea_grafica_horizontal.png')
    config_file = os.path.join(base_path, 'public', 'haizea_chart_config.json')
    
    print("🔄 Procesando tabla gráfica Haizea-Llevant...")
    
    # Procesar imagen principal
    chart_config = rotate_and_process_table(input_image, output_image)
    
    if chart_config:
        # Guardar configuración
        with open(config_file, 'w', encoding='utf-8') as f:
            json.dump(chart_config, f, indent=2, ensure_ascii=False)
        
        print(f"✅ Configuración guardada en: {config_file}")
        print(f"✅ Imagen horizontal guardada en: {output_image}")
        print("\n📋 Posiciones de meses calculadas:")
        for pos in chart_config['month_scale']['positions']:
            print(f"  {pos['month']}m -> x={pos['x_position']} ({pos['percentage']}%)")
        
        # Crear ejemplo de overlay para 12 meses
        example_overlay = create_age_line_overlay(
            12, chart_config, 
            os.path.join(base_path, 'public', 'age_line_example.png')
        )
        
        if example_overlay:
            print(f"\n✅ Ejemplo de línea de edad (12m) creado")
            print(f"   Posición X: {example_overlay['x_position']} ({example_overlay['x_percentage']}%)")
    else:
        print("❌ Error procesando la tabla")
        sys.exit(1)

if __name__ == "__main__":
    main()