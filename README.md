<h1 align="center">Reminder Calendar & Daily Planner 📅⚡</h1>

<p align="center">
  <strong>Una aplicación web profesional para gestionar tu tiempo, rutinas y tareas diarias de forma inteligente.</strong>
</p>

<p align="center">
  <a href="https://samuelmeleroweb.github.io/ReminderCalendar"><strong>🔗 Ver Aplicación en Vivo (GitHub Pages)</strong></a>
</p>

---

## 🚀 Características Principales

- **📅 Calendario Inteligente:** Vistas duales (Mensual y Semanal). El modo semanal incluye un *timeline* (línea de tiempo) interactivo en tiempo real que te muestra exactamente en qué punto del día te encuentras respecto a tus tareas.
- **📊 Dashboard Dinámico:** Analíticas 100% verídicas generadas a partir de tus hábitos de uso. Distribución horaria de tareas, gráficas de productividad semanal y control de rachas continuas (*streaks*).
- **🍅 Focus Mode (Pomodoro):** Incrementa tu productividad con un temporizador Pomodoro integrado. Incluye alertas de vibración y ciclos automatizados para descansos (cortos y largos).
- **✅ Gestión de Tareas Avanzada:** Organiza, edita y cambia el estado de tus recados diarios. Sistema de filtrado en vivo y persistencia local sin depender de bases de datos externas.
- **🎨 UI / UX Premium:** Diseño atractivo, responsivo y adaptado tanto a pantallas móviles como a escritorio. Interfaz limpia utilizando animaciones fluidas, paleta oscura neón e iconos minimalistas (`lucide-angular`).
- **🛠️ Arquitectura Angular Moderna:** Desarrollada sobre **Angular 17+** (Standalone Components) y utilizando `Signals` reactivas para lograr una fluidez inigualable y renderizados inmediatos en el navegador.

---

## 💻 Entorno y Tecnologías

- **Framework Front-End:** [Angular 17+](https://angular.dev/)
- **Lenguaje Transpilado:** [TypeScript](https://www.typescriptlang.org/)
- **Reavtividad:** Angular Signals & RxJS
- **Visualización de Datos:** [Chart.js](https://www.chartjs.org/) + [ng2-charts](https://valor-software.com/ng2-charts/)
- **Iconografía Vectorial:** [Lucide Angular](https://lucide.dev/)
- **Estilos:** SCSS Modules
- **Persistencia de Datos:** Web Storage API (LocalStorage)

---

## 🛠️ Instalación y Desarrollo Local

Si deseas clonar, auditar el código o correr este proyecto de manera local, sigue estos pasos en tu terminal:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/samuelmeleroWEB/ReminderCalendar.git
   cd ReminderCalendar
   ```

2. **Instalar dependencias necesarias:**
   ```bash
   npm install
   ```

3. **Ejecutar el servidor de Angular de forma local:**
   ```bash
   npm run start
   ```
   *La app levantará el entorno en memoria y estará disponible en `http://localhost:4200`.*

---

## ☁️ Acceso y Despliegue en GitHub Pages

Este proyecto ha sido optimizado y desplegado para estar disponible y funcional las 24 horas del día gracias al sistema de `gh-pages` de GitHub. Todos los compilados (`dist`) se renderizan y hospedan directamente desde la rama y subdirectorio del repositorio.

Puedes entrar a probar tus hábitos directamente aquí:
🌐 **[https://samuelmeleroweb.github.io/ReminderCalendar](https://samuelmeleroweb.github.io/ReminderCalendar)**

*(Los datos guardados estarán disponibles y ligados al dispositivo desde el que entres de forma privada gracias al LocalStorage nativo del navegador).*

---

## 📂 Visión de Arquitectura del Proyecto

```text
src/
├── app/
│   ├── core/           # Servicios inyectables (TaskService, PomodoroService, Notifications)
│   ├── features/       # Vistas de Pantalla Completa (Dashboard, Calendario, Focus, etc.)
│   ├── shared/         # Componentes transversales y Modales (TaskCard, Tooltips)
│   ├── app.routes.ts   # Sistema de Enrutamiento y Lazy-Loading
│   └── app.component.* # Componente envoltura (Root Scaffold)
├── assets/             # Recursos estáticos
├── styles/             # Variables y mixins globales
└── styles.scss         # Normalizado de Estilos CSS global
```

---

<p align="center">
  Desarrollado con ❤️ por <a href="https://github.com/samuelmeleroWEB">Samuel Melero</a>.
</p>
