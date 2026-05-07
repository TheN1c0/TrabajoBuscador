import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { TrabajandoScraper } from './scraper/TrabajandoScraper.js';
import { Mailer } from './mailer/Mailer.js';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const mailer = new Mailer();

// Configuración de URLs a scrapear (Ejemplos)
const portales = [
  { nombre: "Banco de Chile", url: "https://bancochile.trabajando.cl/empleos/ofertas/trabajo/" },
  { nombre: "BCI", url: "https://bci.trabajando.cl/empleos/ofertas/trabajo/" },
];

async function runScrapers() {
  console.log(`[${new Date().toISOString()}] Iniciando búsqueda de ofertas...`);
  const nuevasOfertas = [];

  for (const portal of portales) {
    const scraper = new TrabajandoScraper(portal.nombre, portal.url);
    const jobs = await scraper.scrape();

    for (const job of jobs) {
      // Verificar si ya existe en la BD
      const existe = await prisma.oferta.findUnique({
        where: { url: job.url }
      });

      if (!existe) {
        // Guardar en BD
        await prisma.oferta.create({
          data: {
            portal: job.portal,
            titulo: job.titulo,
            url: job.url,
            fechaPub: job.fechaPub,
            contacto: job.contacto,
            notificada: true
          }
        });
        nuevasOfertas.push(job);
      }
    }
  }

  // Enviar correo si hay ofertas nuevas
  if (nuevasOfertas.length > 0) {
    const receiverEmail = process.env.RECEIVER_EMAIL || process.env.SMTP_USER;
    if (receiverEmail) {
      await mailer.sendJobAlert(nuevasOfertas, receiverEmail);
    } else {
      console.log("No se configuró el RECEIVER_EMAIL en el entorno.");
    }
  } else {
    console.log("No se encontraron ofertas nuevas.");
  }
}

// Ejecutar a las 08:00, 15:00 y 20:00 todos los días
cron.schedule('0 8,15,20 * * *', () => {
  runScrapers().catch(console.error);
});

console.log("Orquestador iniciado. Esperando tareas cron...");
// Ejecución inicial de prueba
runScrapers().catch(console.error);
