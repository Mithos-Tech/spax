# Spax — Landing de Dermatología

Sitio estático (HTML/CSS/JS puro, sin build step) listo para desplegar en **Vercel** vía **GitHub**.

## 🚀 Desplegar en Vercel

1. Sube esta carpeta a un repositorio de GitHub.
2. Entra a [vercel.com](https://vercel.com) → **Add New Project** → importa el repo.
3. Framework Preset: **Other** (no requiere build command ni output directory).
4. Deploy. Listo — Vercel detecta `index.html` automáticamente.

No hay variables de entorno ni dependencias que instalar.

---

## ✅ Checklist antes de publicar (3 pasos obligatorios)

### 1. Conecta Cloudinary (imágenes)
Todas las imágenes ya apuntan a Cloudinary con fallback automático a los placeholders locales si algo falla:

```html
<img src="https://res.cloudinary.com/TU_CLOUD_NAME/image/upload/f_auto,q_auto/spax/hero/hero-principal.jpg"
     onerror="this.onerror=null;this.src='images/hero/hero-principal.jpg';">
```

Pasos:
1. Crea una cuenta gratuita en [cloudinary.com](https://cloudinary.com).
2. Sube tus fotos finales respetando la misma ruta de carpetas que ya existe en `/images` (ej. sube tu foto del hero como `spax/hero/hero-principal.jpg` dentro de tu Media Library).
3. Reemplaza **`TU_CLOUD_NAME`** por tu cloud name real en `index.html` (búscalo y reemplázalo en todo el archivo — son 22 apariciones).
4. `f_auto,q_auto` ya optimiza formato y calidad automáticamente (WebP/AVIF cuando el navegador lo soporta) — no necesitas tocarlo.

> Mientras no configures Cloudinary, el sitio se ve igual de bien gracias al fallback a `/images`, así que puedes desplegar hoy mismo y migrar las fotos después.

### 2. Activa el formulario de contacto (Formspree)
1. Crea una cuenta gratuita en [formspree.io](https://formspree.io) y un formulario nuevo.
2. Copia tu Form ID y reemplaza **`TU_FORM_ID`** en `index.html` (formulario de contacto) y **`TU_FORM_ID_NEWSLETTER`** (newsletter del footer) — puedes usar el mismo ID para ambos o crear dos formularios separados.
3. El envío ya está conectado vía JavaScript (`js/script.js`) con mensajes de éxito/error inline, sin recargar la página, e incluye un campo honeypot anti-spam.

### 3. Actualiza tu dominio real
Busca y reemplaza `https://spax.vercel.app` por tu dominio final en:
- `index.html` (canonical, Open Graph, Twitter Card, JSON-LD)
- `robots.txt`
- `sitemap.xml`

---

## 🖼️ Imagen Open Graph
`og-image.jpg` (1200×630) ya está generada con la identidad de marca para que el sitio se vea bien al compartirse en WhatsApp, Facebook, X, etc. Puedes reemplazarla por una foto real del estudio si lo prefieres, manteniendo el mismo nombre y proporción.

## 🎨 Favicon
Incluye `favicon.svg` (vector, se adapta a cualquier tamaño/tema), `favicon-32x32.png`, `apple-touch-icon.png`, `icon-512.png` y `site.webmanifest`.

## 📁 Estructura
```
spax/
├── index.html
├── 404.html
├── css/style.css
├── js/script.js
├── images/             ← placeholders de marca + README con tamaños recomendados
├── favicon.svg / favicon-32x32.png / apple-touch-icon.png / icon-512.png
├── og-image.jpg
├── site.webmanifest
├── robots.txt
├── sitemap.xml
├── vercel.json
└── .gitignore
```

## ⚡ Rendimiento incluido
- Imágenes con `loading="lazy"` (excepto la del hero, que carga con `fetchpriority="high"` por ser el contenido visible inicial).
- Cloudinary con `f_auto,q_auto` para formato y compresión automática.
- Cache headers de 1 año para `/css`, `/js` e `/images` vía `vercel.json`.
- Fuentes con `preconnect` a Google Fonts y Cloudinary.

## 🔒 SEO incluido
- Meta description, canonical, Open Graph, Twitter Card.
- Datos estructurados JSON-LD (`MedicalClinic`) para resultados enriquecidos en Google.
- `robots.txt` + `sitemap.xml`.
- Página `404.html` personalizada (Vercel la sirve automáticamente en rutas inexistentes).

> Proyecto demo desarrollado para [Inspyrio](https://tuportafolio.com) — portafolio de desarrollo web.
