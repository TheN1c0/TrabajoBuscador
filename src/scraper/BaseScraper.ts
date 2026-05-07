import { Page, Browser, chromium } from 'playwright';

export interface ScrapedJob {
  portal: string;
  titulo: string;
  url: string;
  fechaPub: Date | null;
  contacto: string | null;
}

export abstract class BaseScraper {
  protected browser: Browser | null = null;
  protected page: Page | null = null;
  protected portalName: string;

  constructor(portalName: string) {
    this.portalName = portalName;
  }

  async init() {
    this.browser = await chromium.launch({ headless: true });
    this.page = await this.browser.newPage();
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  protected extractEmail(text: string): string | null {
    const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
    const match = text.match(emailRegex);
    return match ? match[0] : null;
  }

  // Método abstracto que cada scraper específico debe implementar
  abstract scrape(): Promise<ScrapedJob[]>;
}
