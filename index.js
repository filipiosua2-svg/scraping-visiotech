import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint para hacer scraping
app.get("/scrape", async (req, res) => {
  const producto = req.query.producto;

  if (!producto) {
    return res.status(400).json({ error: "Falta el parámetro ?producto=" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();

    // URL de búsqueda
    const url = https://www.visiotechsecurity.com/es/search?q=${encodeURIComponent(producto)};
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Extraer datos del primer resultado
    const data = await page.evaluate(() => {
      const titleEl = document.querySelector(".product-title");
      const priceEl = document.querySelector(".price");

      return {
        titulo: titleEl ? titleEl.innerText.trim() : "No encontrado",
        precio: priceEl ? priceEl.innerText.trim() : "Sin precio"
      };
    });

    await browser.close();

    res.json(data);
  } catch (error) {
    console.error("Error en scraping:", error);
    res.status(500).json({ error: "Fallo en el scraping" });
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
