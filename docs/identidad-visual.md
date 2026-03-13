# Identidad Visual y Diseño (GestionEmpleados)

Este documento detalla la paleta de colores y las tipografías oficiales que se deben utilizar en el frontend del proyecto para mantener la coherencia visual con la marca.

---

## Paleta Cromática

Los colores se dividen en principales y secundarios. A continuación, se detallan los códigos hexadecimales (HEX) para su uso en CSS/Tailwind, así como sus equivalencias para impresión e imprenta.

### Colores Principales

| Color | Nombre | HEX | CMYK | Pantone | Oracal |
| :--- | :--- | :--- | :--- | :--- | :--- |
| <div style="width: 20px; height: 20px; background-color: #e30613; border: 1px solid #ccc;"></div> | **ROJO** | `#e30613` | C:0 M:100 Y:100 K:0 | 485 C | 031 |
| <div style="width: 20px; height: 20px; background-color: #000000; border: 1px solid #ccc;"></div> | **NEGRO** | `#000000` | C:90 M:80 Y:60 K:100| Black 6 C | 070 |
| <div style="width: 20px; height: 20px; background-color: #d8d8d8; border: 1px solid #ccc;"></div> | **GRIS** | `#d8d8d8` | C:20 M:13 Y:15 K:0 | Cool Gray 1 C | 072 |
| <div style="width: 20px; height: 20px; background-color: #ffffff; border: 1px solid #ccc;"></div> | **BLANCO** | `#ffffff` | C:0 M:0 Y:0 K:0 | 000 C | 010 |

### Colores Secundarios

| Color | Nombre | HEX | CMYK |
| :--- | :--- | :--- | :--- |
| <div style="width: 20px; height: 20px; background-color: #02f3ce; border: 1px solid #ccc;"></div> | **VERDE** | `#02f3ce` | C:60 M:0 Y:36 K:0 |
| <div style="width: 20px; height: 20px; background-color: #70000b; border: 1px solid #ccc;"></div> | **BORDÓ** | `#70000b` | C:30 M:100 Y:90 K:50|

---

## Tipografía

El proyecto utiliza tres familias tipográficas específicas según el uso (títulos vs. textos convencionales). Las fuentes deben ser importadas adecuadamente en el proyecto (por ejemplo, a través de Google Fonts o fuentes locales en la carpeta `public/fonts`).

### Para Títulos
- **Institucionales**: `RUSSO ONE`
- **Redes Sociales** (Opcional en web si se requieren banners/destacados): `VANGUARD`

### Para Textos Generales
- **Para lectura y párrafos**: `CLEAR SANS`
  - Se utiliza para todo el texto descriptivo, información de empleados, botones y menús.

---

## Cómo usar en Tailwind CSS (Ejemplo de Configuración)

Para facilitar el uso de estos colores en nuestro proyecto con **Tailwind CSS v4**, se recomienda agregarlos a tu `globals.css` utilizando variables CSS, o directamente en la configuración, de la siguiente forma lógica:

```css
/* Ejemplo en globals.css usando @theme de Tailwind v4 */
@theme {
  --color-brand-red: #e30613;
  --color-brand-black: #000000;
  --color-brand-gray: #d8d8d8;
  --color-brand-white: #ffffff;
  
  --color-brand-green: #02f3ce;
  --color-brand-maroon: #70000b;
  
  --font-russo: 'Russo One', sans-serif;
  --font-vanguard: 'Vanguard', sans-serif;
  --font-clear-sans: 'Clear Sans', sans-serif;
}
```

Luego, en tus componentes de React, podrás usarlos así:
- `className="text-brand-red"` (Para colorear el texto de rojo)
- `className="bg-brand-gray"` (Para poner fondo gris)
- `className="font-russo"` (Para aplicar la tipografía Russo One a un título)
