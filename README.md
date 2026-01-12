# TriviaMania

**TriviaMania** es una plataforma de juegos de trivia multijugador en tiempo real altamente interactiva. Diseñada para ofrecer una experiencia de usuario competitiva y fluida, permite a los jugadores conectarse instantáneamente, desafiar a amigos y competir en diversas categorías de conocimiento.

---

## 📋 Tabla de Contenidos

1.  [Descripción General](#-descripción-general)
2.  [Características Principales](#-características-principales)
3.  [Arquitectura y Tecnologías](#-arquitectura-y-tecnologías)
4.  [Instalación y Despliegue](#-instalación-y-despliegue)
5.  [Estructura del Proyecto](#-estructura-del-proyecto)
6.  [Contribución](#-contribución)

---

## 🌟 Descripción General

TriviaMania resuelve la necesidad de una plataforma de entretenimiento educativo sincrónico. Utilizando la tecnología de WebSockets, el estado del juego se mantiene consistente entre todos los participantes con una latencia mínima. La aplicación gestiona salas de juego privadas, perfiles de usuario persistentes y un sistema de puntuación en tiempo real validado por el servidor.

---

## 🚀 Características Principales

### Experiencia de Usuario (UX/UI)
*   **Interfaz Premium Dark**: Diseño moderno basado en principios de gamificación con paletas de alto contraste.
*   **Feedback Visual Inmediato**: Indicadores de estado (Esperando, Respondiendo, Resultados) con animaciones fluidas.
*   **Diseño Responsivo**: Adaptabilidad total a dispositivos móviles y de escritorio.

### Funcionalidades Core
*   **Multijugador Real-Time**: Sincronización exacta de preguntas y temporizadores entre clientes mediante `Socket.io`.
*   **Gestión de Salas**: Creación dinámica de salas con códigos únicos de acceso.
*   **Sistema de Puntuación Robusto**: Algoritmo de puntuación basado en velocidad y precisión, persistido en MongoDB.
*   **Perfiles de Usuario**: Seguimiento de estadísticas (Puntos totales, Partidas jugadas) y personalización de avatares.
*   **Categorías Diversas**: Banco de preguntas expandible (Ciencia, Historia, Deportes, Arte, Geografía, Entretenimiento).

---

## 🛠 Arquitectura y Tecnologías

El proyecto sigue una arquitectura **Cliente-Servidor** desacoplada.

### Frontend (Cliente)
*   **Framework**: React 18 (Vite) para una SPA rápida y reactiva.
*   **Estilos**: Tailwind CSS para un sistema de diseño utilitario y consistente.
*   **Iconografía**: Lucide React.
*   **Gestión de Estado**: React Hooks y Context API.
*   **Comunicación**: `socket.io-client` para eventos bidireccionales.

### Backend (Servidor)
*   **Runtime**: Node.js.
*   **Framework Web**: Express.js para manejo de rutas REST API.
*   **WebSockets**: Socket.io para la lógica de juego en tiempo real.
*   **Persistencia**: MongoDB con Mongoose ODM para modelado de datos estricto.
*   **Seguridad**: Autenticación vía JWT (JSON Web Tokens) y hashing de contraseñas con Bcrypt.

---

## ⚙️ Instalación y Despliegue

### Requisitos Previos
*   **Node.js**: v18.0.0 o superior.
*   **MongoDB**: Instancia local o cluster en MongoDB Atlas.
*   **NPM/Yarn**: Gestor de paquetes.

### 1. Clonar el Repositorio
```bash
git clone https://github.com/skyps2003/TriviaMania.git
cd TriviaMania
```

### 2. Configuración del Backend
```bash
cd backend
npm install
```
Crea un archivo `.env` en la raíz de `backend/`:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/triviamania
JWT_SECRET=tu_clave_secreta_segura
```
*(Opcional)* Carga datos iniciales:
```bash
node seed.js
```
Inicia el servidor:
```bash
npm run dev
```

### 3. Configuración del Frontend
En una nueva terminal:
```bash
cd frontend
npm install
npm run dev
```
Accede a la aplicación en `http://localhost:5173`.

---

## 📂 Estructura del Proyecto

```text
TriviaMania/
├── backend/
│   ├── config/         # Configuración de DB
│   ├── controllers/    # Lógica de controladores REST
│   ├── models/         # Esquemas de Mongoose (User, Room, Question)
│   ├── routes/         # Definición de rutas API
│   ├── server.js       # Punto de entrada y lógica de Sockets
│   └── seed.js         # Script de población de datos
├── frontend/
│   ├── src/
│   │   ├── components/ # Componentes reutilizables
│   │   ├── pages/      # Vistas principales (Lobby, Game, Login)
│   │   ├── services/   # Configuración de Axios y Socket.io
│   │   └── App.jsx     # Enrutamiento principal
│   └── tailwind.config.js
└── README.md
```

---

## 🤝 Contribución

Este proyecto fue desarrollado como parte del curso de **Sistemas Distribuidos** en la **UNAMBA**.

**Desarrollador Principal**: [Luis Rubio]

---
© 2024 TriviaMania. Todos los derechos reservados.
