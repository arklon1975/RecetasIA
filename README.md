# RecetasIA - Generador de Recetas con Inteligencia Artificial

## Descripción
RecetasIA es una aplicación full-stack moderna que combina la gestión tradicional de recetas con la potencia de la inteligencia artificial. Utiliza OpenAI GPT para generar recetas personalizadas basadas en ingredientes disponibles, preferencias dietéticas y restricciones alimentarias. El frontend está desarrollado con React, Vite y Tailwind CSS, mientras que el backend usa Express, TypeScript y Drizzle ORM.

## Estructura del Proyecto
- **Raíz del proyecto:** Contiene archivos de configuración como `package.json`, `tsconfig.json` y `drizzle.config.ts` para gestionar dependencias y el entorno.
- **client/:** Directorio del frontend, con subdirectorios como `src/` que incluye componentes, páginas y estilos.
- **server/:** Directorio del backend, con archivos como `routes.ts` y `db.ts` para rutas API y conexiones a la base de datos.
- **shared/:** Contiene recursos comunes, como esquemas en `schema.ts`.

## Funcionalidades Principales

### 🤖 Generación de Recetas con IA
- **Generador inteligente**: Utiliza OpenAI GPT-4 para crear recetas personalizadas
- **Ingredientes flexibles**: Genera recetas basadas en los ingredientes que tienes disponibles
- **Preferencias personalizadas**: Considera restricciones dietéticas, tipo de cocina y dificultad
- **Información nutricional**: Calcula automáticamente valores nutricionales para cada receta generada

### 📱 Gestión Tradicional de Recetas
- **Búsqueda avanzada**: Encuentra recetas por ingredientes, tiempo de cocción y dificultad
- **Favoritos**: Guarda tus recetas preferidas para acceso rápido
- **Seguimiento nutricional**: Establece metas y rastrea tu consumo diario

### 👤 Perfil de Usuario
- **Preferencias personales**: Configura tus ingredientes favoritos y restricciones
- **Historial**: Accede a recetas generadas anteriormente

## Requisitos
- Node.js (versión 14 o superior)
- NPM o Yarn
- Clave API de OpenAI (para funcionalidades de IA)

## Instalación
1. Clona el repositorio: `git clone https://github.com/arklon1975/RecetasIA.git`
2. Navega al directorio: `cd RecetasIA`
3. Instala las dependencias: `npm install`

## Configuración
1. **Configura OpenAI API Key**:
   - Obtén tu clave API de [OpenAI](https://platform.openai.com/api-keys)
   - Crea un archivo `.env` en la raíz del proyecto
   - Agrega tu clave: `OPENAI_API_KEY=tu_clave_api_aqui`

2. **Variables de entorno opcionales**:
   ```env
   PORT=3001
   NODE_ENV=development
   DATABASE_URL=tu_url_de_base_de_datos
   ```

## Uso
1. Inicia el servidor: `PORT=3001 npm run dev`
2. Accede a la aplicación en: http://localhost:3001
3. **Funcionalidades disponibles**:
   - **Recetas tradicionales**: Busca en la base de datos existente
   - **IA Recetas**: Genera recetas personalizadas con inteligencia artificial
   - **Nutrición**: Rastrea tu consumo diario y establece metas
   - **Perfil**: Configura tus preferencias personales

## Contribución
Si deseas contribuir, por favor crea un issue o un pull request en GitHub.

## Licencia
[Victor Gil] 