# 🎮 TriviaMania

**TriviaMania** es una plataforma de juegos de trivia multijugador en tiempo real, diseñada con un enfoque en la experiencia de usuario (UX/UI) premium y moderna. Permite a los usuarios crear salas, unirse a partidas con amigos, elegir categorías y competir por el puntaje más alto.

## 🚀 Características Principales

*   **Multijugador en Tiempo Real**: Sincronización instantánea mediante **Socket.io**.
*   **Diseño Premium Dark**: Interfaz moderna, elegante y "Glassmorphism" con Tailwind CSS.
*   **Sistema de Salas**: Crea salas privadas o únete mediante códigos únicos.
*   **Avatares Personalizados**: Integración con **DiceBear API** para avatares divertidos y únicos.
*   **Puntaje Dinámico**: Sistema de puntos basado en velocidad (hasta 100 puntos por respuesta correcta).
*   **Feedback Visual**: Animaciones y colores intuitivos (Verde/Rojo/Amarillo) para respuestas.
*   **Categorías Variadas**: Ciencia, Historia, Deportes, Arte, Geografía y Entretenimiento.

## 🛠️ Tecnologías Utilizadas

*   **Frontend**: React (Vite), Tailwind CSS, Lucide React (Iconos).
*   **Backend**: Node.js, Express.
*   **Base de Datos**: MongoDB (Mongoose).
*   **Tiempo Real**: Socket.io.
*   **Seguridad**: JWT (JSON Web Tokens), Bcryptjs.

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

*   [Node.js](https://nodejs.org/) (v16 o superior)
*   [MongoDB](https://www.mongodb.com/) (Servicío local o Atlas)
*   [Git](https://git-scm.com/)

## ⚙️ Instalación y Configuración

Sigue estos pasos para ejecutar el proyecto en tu entorno local.

### 1. Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd TriviaMania
```

### 2. Configurar el Backend

1.  Ve a la carpeta del backend:
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
    JWT_SECRET=tu_secreto_super_seguro
    ```
4.  (Opcional) Inicializa la base de datos con preguntas por defecto:
    ```bash
    node seed.js
    ```

### 3. Configurar el Frontend

1.  Abre una nueva terminal y ve a la carpeta del frontend:
    ```bash
    cd frontend
    ```
2.  Instala las dependencias:
    ```bash
    npm install
    ```

## ▶️ Ejecución

Para jugar, necesitas correr tanto el servidor (backend) como el cliente (frontend).

### Terminal 1: Backend (Servidor)

```bash
cd backend
npm run dev
```
*Deberías ver: `🚀 Servidor corriendo en http://localhost:3000`*

### Terminal 2: Frontend (Cliente)

```bash
cd frontend
npm run dev
```
*Deberías ver: `➜  Local:   http://localhost:5173/`*

Abre tu navegador en `http://localhost:5173` y ¡a jugar!

## 🧪 Cómo Jugar

1.  **Regístrate** o inicia sesión.
2.  En el **Lobby**, elige ser "Anfitrión" (Crear Sala) o "Invitado" (Unirse).
3.  **Anfitrión**: Selecciona una categoría y comparte el código de sala.
4.  **Invitado**: Ingresa el código para unirte.
5.  ¡Responde rápido! Cuanto antes contestes, más puntos ganas.

---
Desarrollado para el curso de Sistemas Distribuidos - UNAMBA.
