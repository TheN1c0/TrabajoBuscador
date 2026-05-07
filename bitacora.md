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
**ESTADO:** En progreso (Fase 2).

## Fase 2: Entorno y Base de Datos

### 1. Inicialización de Node.js y TypeScript
Se inicializó el proyecto Node.js, se instalaron las dependencias principales (Playwright, Nodemailer, node-cron, dotenv) y se configuró TypeScript:
```powershell
npm init -y
npm i playwright nodemailer node-cron dotenv
npm i -D typescript @types/node tsx @types/nodemailer @types/node-cron
npx tsc --init
```

### 2. Configuración de Docker
Se crearon los archivos `Dockerfile` y `docker-compose.yml` para contenerizar la aplicación Node.js junto con una base de datos PostgreSQL:
- **Dockerfile:** Usa la imagen `mcr.microsoft.com/playwright:v1.43.0-jammy` como base para asegurar que Playwright funcione correctamente.
- **docker-compose.yml:** Define los servicios `app` y `db` (PostgreSQL 15), con su respectivo volumen y variables de entorno.
- Se agregaron los scripts `dev`, `build` y `start` en el `package.json`.

### 3. Configuración de Prisma ORM
Se instaló Prisma y su cliente, y se inicializó la configuración:
```powershell
npm i -D prisma
npm i @prisma/client
npx prisma init
```
Posteriormente, se configuró el esquema de base de datos en `prisma/schema.prisma` agregando el modelo `Oferta` para almacenar los datos extraídos (título, portal, url, fecha, correo extraído) y evitar enviar alertas duplicadas.

---
**ESTADO:** En progreso (Fase 3).

## Fase 3: Módulos de Scraping

### 1. Extractor Base (Playwright)
Se creó la interfaz y clase abstracta base en `src/scraper/BaseScraper.ts`. Esta clase maneja la inicialización del navegador con Playwright, el cierre, y contiene una función común para extraer correos electrónicos de cualquier texto utilizando expresiones regulares.
