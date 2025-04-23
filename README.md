# 🍫 Cacao Trazabilidad Frontend

[![Node.js LTS](https://img.shields.io/badge/Node.js-18.x-blue.svg)](https://nodejs.org/en/)
[![React](https://img.shields.io/badge/React-18.x-blue.svg)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-blue.svg)](https://tailwindcss.com/)
[![Shadcn UI](https://img.shields.io/badge/Shadcn_UI-latest-blue.svg)](https://ui.shadcn.com/)
[![Better Auth](https://img.shields.io/badge/Better_Auth-latest-blue.svg)](https://www.better-auth.com/)
[![Axios](https://img.shields.io/badge/Axios-latest-blue.svg)](https://axios-http.com/)

Frontend del sistema de trazabilidad para la producción y almacenamiento de cacao (Theobroma cacao) en Tacotalpa, Tabasco, México. Esta aplicación permite a los usuarios visualizar y gestionar datos en tiempo real relacionados con la producción de cacao, integrando tecnologías IoT y sensores.

## 🧰 Tecnologías utilizadas

- [React 18.x](https://reactjs.org/) – Biblioteca para construir interfaces de usuario.
- [Vite](https://vitejs.dev/) – Herramienta de desarrollo y bundler rápido.
- [Tailwind CSS 3.x](https://tailwindcss.com/) – Framework de utilidad para estilos.
- [Shadcn UI](https://ui.shadcn.com/) – Biblioteca de componentes UI.
- [Better Auth](https://www.better-auth.com/) – Solución de autenticación.
- [Axios](https://axios-http.com/) – Cliente HTTP para realizar solicitudes al backend.

## 🚀 Instalación y ejecución

1. **Clonar el repositorio:**

   ```bash
   git clone https://github.com/tu-usuario/cacao-trazabilidad-frontend.git
   cd cacao-trazabilidad-frontend




# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```
