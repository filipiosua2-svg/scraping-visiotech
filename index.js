import express from 'express';
import puppeteer from 'puppeteer';

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint para hacer scraping
app.get('/scrape', async (req, res) => {
  const producto = req.query.producto;

  if (!producto) {
    return res.status(400).json({ error: "Falta el parámetro 'producto'" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // URL corregida con template string
    const url = https://www.visiotechsecurity.com/es/search?q=${encodeURIComponent(producto)};
    await page.goto(url, { waitUntil: 'domcontentloaded' });

    // Extraer título y precio del primer resultado
    const data = await page.evaluate(() => {
      const titleEl = document.querySelector('.product-title');
      const priceEl = document.querySelector('.price');

      return {
        title: titleEl ? titleEl.innerText.trim() : "No encontrado",
        price: priceEl ? priceEl.innerText.trim() : "Sin precio",
      };
    });

    await browser.close();

    return res.json({
      producto,
      ...data,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Error durante el scraping' });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(Servidor corriendo en http://localhost:${PORT});
});
