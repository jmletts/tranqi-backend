# AGENTS.md - Contexto y Especificación de Diseño Frontend (Tranqi)

Este documento es la única fuente de la verdad para desarrolladores y **Agentes de IA**. Define la base visual ("Design Tokens"), componentes clave y reglas estrictas de UI para la app móvil Tranqi.

## 🚨 REGLAS ESTRICTAS PARA AGENTES DE IA
1. **NO EMOJIS:** Está estrictamente prohibido el uso de emojis en cualquier parte de la interfaz (textos, botones, placeholders).
2. **NO EFECTOS NEÓN / GLOW:** No inventar ni agregar sombras brillantes, difuminados intensos, ni efectos de neón. El diseño es limpio y plano (flat/solid colors).
3. **NO FONDOS OSCUROS EXTRAS:** Apégate estrictamente al diseño. Los fondos principales del contenido deben ser siempre claros (Blanco o Gris Claro). El color negro (`#010100`) está reservado exclusivamente para los headers (zona superior de logo/navegación), la barra inferior (Bottom Tab) y botones específicos. No crees "Modo oscuro" a menos que se especifique en el futuro.
4. **NO ICONOS EXTERNOS / FUENTES:** Todos los iconos **deben ser en formato SVG** y usarse a través de un componente que los envuelva correctamente.
5. **ADHERENCIA ESTRICTA:** El agente debe guiarse SÍ o SÍ por lo descrito en este documento, manteniendo la estética sin desviarse.

## 1. Colores (Color Palette)

Los colores principales mantienen el contraste y la identidad de marca (amarillo, azul, rosado sobre fondos oscuros y claros).

| Rol | Nombre | Hex Code | Uso principal |
| :--- | :--- | :--- | :--- |
| **Primario (Acento 1)** | `Tranqi Yellow` | `#ffd900` | Botones activos, fondo de iconos de operaciones, tarjeta principal, tab activo. |
| **Primario (Acento 2)** | `Tranqi Blue` | `#0120ca` | Contenedor de saldo, franjas decorativas, iconos de recarga. |
| **Primario (Acento 3)** | `Tranqi Pink` | `#e300b6` | Franjas decorativas, acentos visuales secundarios. |
| **Fondo Oscuro** | `Dark Black` | `#010100` | Header principal, fondo del Bottom Navigation, fondo de botones secundarios, texto principal. |
| **Fondo Claro 1** | `Pure White` | `#ffffff` | Fondo del contenedor principal en Inicio/Login, tarjetas de lista. |
| **Fondo Claro 2** | `Light Gray` | `#f2f2f2` | Fondo del contenedor principal en la vista de Movimientos. |
| **Estado (Negativo)**| `Red Expense` | `#b31222` | Iconos y montos negativos en la lista de movimientos (ej. pasaje cobrado). |
| **Estado (Positivo)**| `Green Income` | `#00a650` | Indicador de recargas o saldo positivo. |
| **Borde Formularios**| `Input Border` | `#e5e5e5` | Gris muy claro, casi blanco, usado exclusivamente para bordes del TextInput. |
| **Texto Secundario** | `Gray Text` | `#666666` | Subtítulos, fechas, textos de ayuda. |

## 2. Tipografía

La aplicación utiliza la familia tipográfica **Montserrat** SÍ o SÍ.

*   **Títulos (Headers / Saldo):** Montserrat ExtraBold / Black (Peso 800-900). Ej: "Te damos la Bienvenida", "S/ 50.23".
*   **Subtítulos (Section Headers):** Montserrat Bold (Peso 700). Ej: "Otras Tarjetas", "Tus Movimientos".
*   **Cuerpo de texto (Body):** Montserrat Regular / Medium (Peso 400-500). Ej: "Saldo Disponible", "Actualizado hoy".
*   **Botones (Labels):** Montserrat Bold (Peso 700).

## 3. Formas y Bordes (Border Radius)

*   **Contenedor Principal Asimétrico:** El contenedor blanco/gris que envuelve el contenido de las pantallas tiene un borde redondeado pronunciado **solo en la esquina superior izquierda**.
    *   `borderTopLeftRadius: 40px`
    *   `borderTopRightRadius: 0px`
*   **Bottom Navigation (Barra inferior):** Tiene forma de píldora flotante.
    *   `borderRadius: 40px` (Totalmente redondeado).
    *   Márgenes laterales e inferiores para que flote sobre el fondo.
*   **Formularios / Inputs:** Todos los campos de entrada de texto deben tener diseño de píldora SÍ o SÍ.
    *   `borderRadius: 30px`
    *   Borde delgado y sutil: `borderWidth: 1`, `borderColor: '#e5e5e5'` (gris muy claro casi blanco).
*   **Botones (Pills):** Los botones principales y secundarios también usan forma de píldora (`borderRadius: 30px`).
*   **Tarjetas (Cards):**
    *   Tarjeta principal amarilla: `borderRadius: 16px`.
    *   Contenedor azul de saldo: `borderRadius: 24px`.
    *   Iconos cuadrados de operaciones: `borderRadius: 12px`.

## 4. Componentes Base (UI Kit)

Para mantener la consistencia, se deberán construir los siguientes componentes en `src/presentation/components/`:

### 4.1. `MainLayout` / `CurvedContainer`
*   Componente contenedor que incluye el fondo negro (o logo superior) y aplica el borde asimétrico (`borderTopLeftRadius: 40`) al contenedor de contenido hijo. Fondos claros únicamente.

### 4.2. `TextInputPill` (Formularios)
*   **Descripción:** Campos de texto con diseño de píldora sí o sí (`borderRadius: 30`).
*   **Estilo:** Fondo transparente o blanco, con un ligero borde delgado en gris muy claro (`borderColor: '#e5e5e5'`). Texto y placeholders usan Montserrat.

### 4.3. Formularios (Input) - Específico para Login
*   El login **solo** usará DNI y Contraseña (utilizando el componente `TextInputPill`).
*   NO se implementará login con Google. Botón principal oscuro tipo píldora para "Iniciar Sesión".

### 4.4. `FloatingBottomTab`
*   Barra de navegación inferior con fondo negro `#010100`. El tab activo tiene un fondo `#ffd900` (amarillo) en forma de píldora que envuelve el icono SVG y el texto, mientras que los inactivos son transparentes.

### 4.5. `ActionIcon` (Operaciones e Iconografía)
*   **Descripción estricta:** El contenedor (fondo) tiene que ser un recubrimiento de color amarillo (`#ffd900`) con `borderRadius: 12px`.
*   **El Icono:** Dentro del recubrimiento amarillo debe ir centrado el icono. El icono SÍ o SÍ debe ser en formato **SVG**. Nada de imágenes rasterizadas (PNG/JPG) ni emojis.
