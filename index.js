import express from "express";
import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("✅ Servidor activo. Usa /scrape?producto=XXXX");
});

app.get("/scrape", async (req, res) => {
  const producto = req.query.producto;
  if (!producto) {
    return res.status(400).json({ error: "Falta el parámetro ?producto=" });
  }

  try {
    // 🚀 Usar chrome-aws-lambda siempre
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath || undefined,
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.goto(
      "https://www.visiotechsecurity.com/es/search?q=" + encodeURIComponent(producto),
      { waitUntil: "domcontentloaded" }
    );

    const result = await page.evaluate(() => {
      const title = document.querySelector(".product-title")?.innerText || "No encontrado";
      const desc = document.querySelector(".product-description")?.innerText || "Sin descripción";
      const price = document.querySelector(".price")?.innerText || "Sin precio";
      return { titulo: title, descripcion: desc, precio: price };
    });

    await browser.close();
    res.json(result);
  } catch (err) {
    console.error("Error en scraping:", err.message);
    res.status(500).json({ error: "Fallo en el scraping" });
  }
});

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
