# TriviaMania

TriviaMania es una plataforma de juegos de trivia multijugador en tiempo real, diseñada con un enfoque en la experiencia de usuario (UX/UI) moderna. Permite a los usuarios crear salas, unirse a partidas con amigos, elegir categorias y competir por el puntaje mas alto.


## Caracteristicas Principales

*   **Multijugador en Tiempo Real**: Sincronización instantanea mediante Socket.io.
*   **Diseño Premium Dark**: Interfaz moderna y elegante con Tailwind CSS.
*   **Sistema de Salas**: Crea salas privadas o unete mediante codigos unicos.
*   **Persistencia de Datos**: Puntuaciones y progreso guardados en tiempo real en MongoDB.
*   **Avatares Personalizados**: Integracion con DiceBear API para avatares unicos.
*   **Puntaje Dinamico**: Sistema de puntos basado en velocidad (hasta 100 puntos por respuesta correcta).
*   **Feedback Visual**: Indicadores claros para respuestas correctas e incorrectas.
*   **Categorias Variadas**: Ciencia, Historia, Deportes, Arte, Geografia y Entretenimiento.
    
## Tecnologias Utilizadas

*   **Frontend**: React (Vite), Tailwind CSS, Lucide React (Iconos).
*   **Backend**: Node.js, Express.
*   **Base de Datos**: MongoDB (Mongoose).
*   **Tiempo Real**: Socket.io.
*   **Seguridad**: JWT (JSON Web Tokens), Bcryptjs.

## Requisitos Previos

Antes de comenzar, asegurate de tener instalado:

*   Node.js (v16 o superior)
*   MongoDB (Servicio local o Atlas)
*   Git

## Instalacion y Configuracion

Sigue estos pasos para ejecutar el proyecto en tu entorno local.

### 1. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd TriviaMania
```

### 2. Configurar el Backend

1.  Navega a la carpeta del backend:
    ```bash
    cd backend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```
3.  Crea un archivo `.env` en la carpeta `backend` con el siguiente contenido:
    ```env
    PORT=3000
    MONGO_URI=mongodb://localhost:27017/triviamania
    JWT_SECRET=tu_secreto_seguro
    ```
4.  (Opcional) Inicializa la base de datos con preguntas por defecto:
    ```bash
    node seed.js
    ```

### 3. Configurar el Frontend

1.  Abre una nueva terminal y navega a la carpeta del frontend:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```

## Ejecucion

Para jugar, necesitas ejecutar tanto el servidor (backend) como el cliente (frontend).

### Terminal 1: Backend (Servidor)

```bash
cd backend
npm run dev
```
El servidor deberia iniciar en el puerto 3000 y conectar a MongoDB.

### Terminal 2: Frontend (Cliente)

```bash
cd frontend
npm run dev
```
La aplicacion estara disponible generalmente en http://localhost:5173.

## Como Jugar

1.  **Registro**: Crea una cuenta o inicia sesion.
2.  **Lobby**: Elige entre crear una nueva sala o unirte a una existente.
3.  **Crear Sala**: Selecciona una categoria y comparte el codigo generado con tus amigos.
4.  **Unirse**: Ingresa el codigo de la sala proporcionado por el anfitrion.
5.  **Juego**: Responde las preguntas antes de que se acabe el tiempo. Cuanto mas rapido respondas, mas puntos obtendras.
6.  **Resultados**: Al finalizar, mira la tabla de clasificacion y celebra la victoria.

---
Desarrollado para el curso de Sistemas Distribuidos - UNAMBA.
