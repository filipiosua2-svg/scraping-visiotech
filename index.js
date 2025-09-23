// index.js (ESM)
import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_req, res) => {
  res.send('OK');
});

app.get('/scrape', async (req, res) => {
  const producto = (req.query.producto || '').toString().trim();
  const cantidad = Number(req.query.cantidad || 1);

  if (!producto) {
    return res.status(400).json({ ok: false, error: 'Falta el parámetro "producto".' });
  }

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    const url = https://www.visiotechsecurity.com/es/search?q=${encodeURIComponent(producto)};
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

    // Aceptar cookies si aparece (no rompe si no está)
    try {
      await page.click(
        '#onetrust-accept-btn-handler, button[aria-label="Accept cookies"], .cookie-accept',
        { timeout: 3000 }
      );
    } catch {}

    // Intenta sacar título y precio del primer resultado
    const data = await page.evaluate(() => {
      const titleEl =
        document.querySelector('.product-title, .ProductList .product-name, h1.product-name') ||
        document.querySelector('a.product-name, a.product-title');

      const priceEl =
        document.querySelector('.price, .product-price, .price--final, .price .amount');

      const title = titleEl ? titleEl.textContent.trim() : 'No encontrado';
      const price = priceEl ? priceEl.textContent.trim() : 'Sin precio';
      return { title, price };
    });

    // Normalizar precio a número (mejor esfuerzo)
    let priceNum = null;
    if (data.price && data.price !== 'Sin precio') {
      // Quita símbolos, quita separadores de miles, convierte coma decimal a punto
      const normalized = data.price
        .replace(/[^\d.,-]/g, '')
        .replace(/\.(?=\d{3}(?:[^\d]|$))/g, '')
        .replace(',', '.');

      const parsed = parseFloat(normalized);
      if (!Number.isNaN(parsed)) priceNum = parsed;
    }

    const total = priceNum != null ? priceNum * cantidad : null;

    res.json({
      ok: true,
      query: { producto, cantidad },
      url,
      title: data.title,
      price: data.price,
      priceNum,
      total,
    });
  } catch (err) {
    console.error('Error en /scrape:', err);
    res.status(500).json({ ok: false, error: String(err) });
  } finally {
    if (browser) {
      try { await browser.close(); } catch {}
    }
  }
});

app.listen(PORT, () => {
  console.log(Servidor corriendo en http://localhost:${PORT});
});
