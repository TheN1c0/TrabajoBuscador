# Bitácora de Proyecto - Buscador de Empleos

Este documento contiene el registro de todos los comandos ejecutados y archivos creados para poder replicar la configuración del proyecto de forma manual.

## Fase 1: Setup Inicial

**Fecha:** 2026-05-07

### 1. Creación de la estructura de carpetas
Se ejecutó el siguiente comando en PowerShell para crear las carpetas base del proyecto:
```powershell
New-Item -ItemType Directory -Force -Path "src\scraper", "src\db", "src\mailer", "src\config"
```

### 2. Creación del archivo `.gitignore`
Se creó el archivo `.gitignore` en la raíz del proyecto para ignorar las dependencias, variables de entorno, compilados y reportes de Playwright:
```text
node_modules/
dist/
.env
*.sqlite
*.sqlite-journal
.DS_Store
coverage/
playwright-report/
test-results/
```

### 3. Creación de la bitácora
Se creó este archivo `bitacora.md` para llevar el registro del proyecto.

---
**ESTADO:** Esperando luz verde para continuar con la Fase 2 (Inicialización de Node, Docker y Base de datos).
