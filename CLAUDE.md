# Gastos 2026 — Control de gastos personales

## Qué es esto

App single-page para controlar los gastos mensuales de Juan Marin (Mayo–Diciembre 2026). Frontend estático que lee/escribe en una base de Notion vía un proxy serverless en Vercel.

- Producción: https://gastos-2026.vercel.app
- Notion DB ID: `6f3d3671df04410082601470203c5af8`

## Arquitectura

```
Browser (index.html) → /api/notion (Vercel function) → Notion API → Notion DB
```

- `index.html` — Dashboard standalone (HTML+CSS+JS en un solo archivo, sin frameworks, sin build step)
- `api/notion.js` — Proxy serverless Node.js que oculta el token de Notion
- Variables de entorno en Vercel: `NOTION_TOKEN`, `NOTION_DATABASE_ID`

## Stack

- Vanilla JS, sin frameworks, sin build
- Chart.js 4.4.1 (CDN) para el gráfico de dona
- Tipografía: Geist + Geist Mono (Google Fonts)
- Hosted en Vercel

## Sistema de diseño (Uber-inspired)

### Paleta
```css
--bg: #FFFFFF;
--surface: #F7F7F7;
--surface-2: #EFEFEF;
--border: #E5E5E5;     /* hairlines */
--text: #000000;
--text-2: #545454;
--text-3: #8E8E8E;
--green: #00C16A;      /* positivo / disponible */
--green-bg: #E6F8EF;
--red: #E11900;        /* alerta / excedido */
--red-bg: #FDE7E4;
--amber: #F4B400;      /* warning / cerca del tope */
--amber-bg: #FEF6DC;
```

### Tipografía
- Display + body: **Geist** (geometric sans, parecida a UberMove)
- Mono: **Geist Mono** para TODOS los números, montos y porcentajes
- Pesos: 400 body, 500 énfasis, 600 títulos, 700 hero numbers
- Letter-spacing: -0.01em body, -0.02em headings, -0.04em hero
- Hero number tamaño: `clamp(44px, 7.5vw, 68px)` peso 700

### Layout
- Max-width 1120px, centrado, padding lateral generoso
- **Hero card negra** arriba con el total del mes (lo más importante visualmente)
- Strip de 4 stats con bordes hairline (no cards individuales)
- Cards: `border-radius: 10px` (hero usa 16px)
- Sin sombras pesadas — usar hairlines o cambios de background
- Espacios entre secciones: 32–40px

### Componentes
- Botón primary: fondo `--text` negro, texto blanco, peso 600
- Botón ghost: transparente, hover `--surface`
- Inputs/Selects: altura 40px, border `--border`, focus border `--text` sin glow
- Pills de estado: `border-radius: 999px`, padding 4px 10px, font-size 12px
- Badge de estado en tabla: Pagado verde, Pendiente ámbar, No aplica gris

### Reglas
- Cifras siempre en COP$ usando `Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 })`
- Transiciones sutiles: 0.15s en color/background, 0.5–0.6s en barras de progreso con `cubic-bezier(0.16, 1, 0.3, 1)`
- Mobile-first: breakpoints en 540px, 640px, 720px, 860px
- Espacio en blanco generoso, no apretado

## Categorías de gastos (emojis exactos — deben coincidir con Notion)

🏠 Vivienda y Servicios · 🚗 Transporte y Vehículo · 🍽️ Alimentación · 📱 Tecnología y Suscripciones · 🏥 Salud y Bienestar · 👩‍💼 Personal y Hogar · 💳 Financiero · 🎭 Ocio y Entretenimiento · ⚠️ Imprevistos

## Cómo correr localmente

```bash
vercel dev   # corre HTML estático + funciones serverless en http://localhost:3000
```

Requiere `.env.local` con `NOTION_TOKEN` y `NOTION_DATABASE_ID` (se baja con `vercel env pull .env.local`).

## Flujo de trabajo para iterar diseño

1. Edita `index.html`
2. Refresca http://localhost:3000 — los cambios son inmediatos
3. Itera hasta que se vea bien (Juan puede mandar screenshot si algo está raro)
4. `git add`, commit con mensaje descriptivo (`style:`, `feat:`, `fix:` prefijos)
5. `git push origin main` — Vercel redeploya en ~30 seg

## Cosas que NO tocar sin avisar a Juan

- `api/notion.js` — el proxy está estable
- Variables de entorno en Vercel (`NOTION_TOKEN`, `NOTION_DATABASE_ID`)
- Los nombres de las categorías ni sus emojis (deben coincidir con Notion exactamente)
- El esquema esperado por el endpoint (gasto, monto, categoria, subcategoria, mes, tipo, metodoPago, estado, notas)

## Preferencias de Juan

- Idioma: español de Colombia
- Cifras: pesos colombianos COP$
- Comunicación: concisa, directa, sin rodeos
- Estilo visual: profesional, minimalista, estilo Uber
- Prefiere acción sobre explicación
