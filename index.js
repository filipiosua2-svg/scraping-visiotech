import express from "express";
import chromium from "chrome-aws-lambda";
import puppeteer from "puppeteer-core";

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint raíz
app.get("/", (req, res) => {
  res.send("✅ Servidor activo. Usa /scrape?producto=XXXX");
});

// Endpoint de scraping
app.get("/scrape", async (req, res) => {
  const producto = req.query.producto;
  if (!producto) {
    return res.status(400).json({ error: "Falta el parámetro ?producto=" });
  }

  try {
    // Lanzar navegador con Chrome de chrome-aws-lambda
    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath, // 👈 Aquí se asegura el binario correcto
      headless: chromium.headless
    });

    const page = await browser.newPage();
    await page.goto(
      "https://www.visiotechsecurity.com/es/search?q=" + encodeURIComponent(producto),
      { waitUntil: "domcontentloaded" }
    );

    // Extraer datos
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

// Iniciar servidor
app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
