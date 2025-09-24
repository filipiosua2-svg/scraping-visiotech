import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint raíz (para comprobar servidor)
app.get("/", (req, res) => {
  res.send("✅ Servidor con Puppeteer activo. Usa /scrape?producto=XXXX");
});

// Endpoint de scraping con Puppeteer
app.get("/scrape", async (req, res) => {
  const producto = req.query.producto;

  if (!producto) {
    return res.status(400).json({ error: "Falta el parámetro ?producto=" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    const url =
      "https://www.visiotechsecurity.com/es/search?q=" +
      encodeURIComponent(producto);

    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Solo título de la página como prueba
    const pageTitle = await page.title();

    await browser.close();

    res.json({ producto, titulo: pageTitle });
  } catch (err) {
    console.error("Error en Puppeteer:", err.message);
    res.status(500).json({ error: "Fallo en Puppeteer" });
  }
});

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
