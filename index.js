import express from "express";
import puppeteer from "puppeteer";

const app = express();
app.use(express.json());

// Endpoint para scraping
app.post("/scrape", async (req, res) => {
  const { producto } = req.body;

  if (!producto) {
    return res.status(400).json({ error: "Falta el campo 'producto'" });
  }

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();

    const url = https://www.visiotechsecurity.com/es/search?q=${encodeURIComponent(producto)};
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Ejemplo: busca el primer título y precio (ajústalo luego con selectores correctos)
    const data = await page.evaluate(() => {
      const title = document.querySelector("h1, .product-title")?.innerText || "No encontrado";
      const price = document.querySelector(".price")?.innerText || "N/A";
      return { title, price };
    });

    await browser.close();

    res.json({
      producto,
      ...data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error en el scraping", details: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("✅ Scraper de Visiotech activo");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(Servidor escuchando en puerto ${PORT});
});
