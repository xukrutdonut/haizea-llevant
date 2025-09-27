#!/usr/bin/env python3
"""
Script para procesar la tabla oficial de Haizea-Llevant
- Rotar la imagen de vertical a horizontal
- Optimizar para uso web
- Preparar para overlay interactivo
"""

from PIL import Image, ImageEnhance
import os

def process_haizea_table():
    # Cargar imagen original
    print("📥 Cargando tabla original de Haizea-Llevant...")
    original_path = "tabla_haizea_original.png"
    
    if not os.path.exists(original_path):
        print("❌ No se encontró la imagen original")
        return False
    
    # Abrir imagen
    img = Image.open(original_path)
    print(f"📐 Dimensiones originales: {img.size}")
    
    # Rotar 90 grados (de vertical a horizontal)
    print("🔄 Rotando imagen de vertical a horizontal...")
    img_rotated = img.rotate(90, expand=True)
    print(f"📐 Nuevas dimensiones: {img_rotated.size}")
    
    # Mejorar contraste para mejor legibilidad
    print("✨ Mejorando contraste y brillo...")
    enhancer = ImageEnhance.Contrast(img_rotated)
    img_enhanced = enhancer.enhance(1.2)  # Aumentar contraste 20%
    
    enhancer_brightness = ImageEnhance.Brightness(img_enhanced)
    img_final = enhancer_brightness.enhance(1.1)  # Aumentar brillo 10%
    
    # Guardar versión optimizada para web
    web_path = "public/tabla_haizea_horizontal.png"
    print(f"💾 Guardando imagen optimizada en: {web_path}")
    
    # Redimensionar para web (máximo 1200px de ancho manteniendo proporción)
    max_width = 1200
    if img_final.width > max_width:
        ratio = max_width / img_final.width
        new_height = int(img_final.height * ratio)
        img_final = img_final.resize((max_width, new_height), Image.Resampling.LANCZOS)
        print(f"📐 Redimensionado para web: {img_final.size}")
    
    # Guardar con compresión optimizada
    img_final.save(web_path, "PNG", optimize=True, quality=95)
    
    # Crear también una versión de alta resolución
    hd_path = "public/tabla_haizea_hd.png"
    print(f"💾 Guardando versión HD en: {hd_path}")
    
    # Para la versión HD, mantener tamaño original pero optimizar
    img_hd = Image.open(original_path).rotate(90, expand=True)
    enhancer_hd = ImageEnhance.Contrast(img_hd)
    img_hd_enhanced = enhancer_hd.enhance(1.2)
    img_hd_enhanced.save(hd_path, "PNG", optimize=True)
    
    print("✅ Procesamiento completado!")
    print(f"📊 Imagen web: {img_final.size} - {os.path.getsize(web_path)/1024:.1f}KB")
    print(f"📊 Imagen HD: {img_hd.size} - {os.path.getsize(hd_path)/1024:.1f}KB")
    
    return True

if __name__ == "__main__":
    success = process_haizea_table()
    if success:
        print("\n🎯 ¡Tabla de Haizea-Llevant procesada y lista para usar!")
    else:
        print("\n❌ Error procesando la tabla")