import express from "express";
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
    const url = "https://www.visiotechsecurity.com/es/search?q=" + encodeURIComponent(producto);

    // Lanzar Chrome con puppeteer-core (Render ya lo tiene instalado)
    const browser = await puppeteer.launch({
      executablePath: "/usr/bin/google-chrome",
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Extraer datos del primer producto
    const result = await page.evaluate(() => {
      const title = document.querySelector(".product-title")?.innerText?.trim() || "No encontrado";
      const description = document.querySelector(".product-description")?.innerText?.trim() || "Sin descripción";
      const price = document.querySelector(".price")?.innerText?.trim() || "Sin precio";
      return { titulo: title, descripcion: description, precio: price };
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
