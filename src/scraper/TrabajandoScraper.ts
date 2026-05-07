import { BaseScraper, ScrapedJob } from './BaseScraper.js';

export class TrabajandoScraper extends BaseScraper {
  private url: string;

  constructor(portalName: string, url: string) {
    super(portalName);
    this.url = url;
  }

  async scrape(): Promise<ScrapedJob[]> {
    const jobs: ScrapedJob[] = [];
    
    try {
      await this.init();
      if (!this.page) throw new Error("No se pudo inicializar la página de Playwright");

      // Ir a la URL de búsqueda (se espera que sea la URL directa con los filtros de Cajero)
      await this.page.goto(this.url, { waitUntil: 'domcontentloaded' });
      
      // Esperar a que carguen los resultados (este selector depende del portal, aquí hay uno genérico de Trabajando)
      // Nota: Los selectores reales pueden variar según la versión del portal de Trabajando.
      // Se asume una estructura basada en artículos o divs con clases de oferta.
      await this.page.waitForTimeout(3000); // Espera prudencial para CSR

      const offers = await this.page.$$('div[class*="offer"], article'); // Selectores heurísticos

      for (const offer of offers) {
        try {
          // Extraer el título
          const titleElement = await offer.$('h2, h3, a[class*="title"]');
          if (!titleElement) continue;
          const titulo = (await titleElement.innerText()).trim();

          // Filtrar por "Cajero"
          if (!titulo.toLowerCase().includes('cajero')) continue;

          // Extraer URL
          const linkElement = await offer.$('a');
          let url = '';
          if (linkElement) {
            const href = await linkElement.getAttribute('href');
            url = href ? (href.startsWith('http') ? href : new URL(href, this.url).href) : '';
          }

          // Para saber si tiene menos de 3 días y extraer el correo, habría que entrar al detalle
          // o buscar en la descripción corta. Por simplicidad en este ejemplo, abrimos un nuevo tab.
          let contacto = null;
          let fechaPub = new Date();

          if (url && this.browser) {
            const detailPage = await this.browser.newPage();
            try {
              await detailPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 });
              const content = await detailPage.content();
              contacto = this.extractEmail(content);
              
              // Intentar buscar fechas en el contenido
              // Esto es complejo porque el formato de fecha varía ("Hace 2 días", "Hoy", "dd/mm/yyyy")
              // Asumiremos la fecha actual para el prototipo a menos que hallemos un patrón claro.
              const dateMatch = content.match(/Hace (\d+) (días?|horas?)/i);
              if (dateMatch) {
                const amount = parseInt(dateMatch[1]);
                const unit = dateMatch[2].toLowerCase();
                if (unit.startsWith('día') && amount > 3) {
                  // Más de 3 días, descartamos
                  await detailPage.close();
                  continue; 
                }
              }
            } catch (e) {
              console.error(`Error visitando detalle de ${url}:`, e);
            } finally {
              await detailPage.close();
            }
          }

          jobs.push({
            portal: this.portalName,
            titulo,
            url,
            fechaPub,
            contacto
          });
        } catch (e) {
          console.error("Error extrayendo una oferta:", e);
        }
      }
    } catch (e) {
      console.error(`Error en el scraper de ${this.portalName}:`, e);
    } finally {
      await this.close();
    }

    return jobs;
  }
}
