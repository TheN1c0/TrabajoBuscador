import nodemailer from 'nodemailer';
import { ScrapedJob } from '../scraper/BaseScraper.js';

export class Mailer {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendJobAlert(jobs: ScrapedJob[], toEmail: string) {
    if (jobs.length === 0) return;

    let html = `<h2>Nuevas ofertas de Cajero Bancario</h2>
    <p>Se han encontrado ${jobs.length} nuevas ofertas:</p>
    <ul>`;

    for (const job of jobs) {
      html += `<li>
        <strong>${job.portal}</strong>: <a href="${job.url}">${job.titulo}</a><br>
        <em>Fecha publicación aproximada: ${job.fechaPub ? job.fechaPub.toLocaleDateString() : 'N/A'}</em><br>
        ${job.contacto ? `<span style="color:red; font-weight:bold;">✉️ Enviar CV a: ${job.contacto}</span>` : ''}
      </li><br>`;
    }

    html += `</ul><p>¡Mucho éxito en tu postulación!</p>`;

    const mailOptions = {
      from: `"Buscador de Empleos" <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject: `¡${jobs.length} Nuevas Ofertas de Cajero Bancario!`,
      html,
    };

    await this.transporter.sendMail(mailOptions);
    console.log(`Correo enviado a ${toEmail} con ${jobs.length} ofertas.`);
  }
}
