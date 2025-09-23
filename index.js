import express from "express";
import puppeteer from "puppeteer-core";
import chromium from "chromium";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/scrape", async (req, res) => {
  const producto = req.query.producto;
  if (!producto) {
    return res.status(400).json({ error: "Falta el parámetro ?producto" });
  }

  try {
    const browser = await puppeteer.launch({
      executablePath: chromium.path, // usamos el binario ya instalado
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });

    const page = await browser.newPage();
    const url = https://www.visiotechsecurity.com/es/search?q=${encodeURIComponent(producto)};
    await page.goto(url, { waitUntil: "domcontentloaded" });

    const data = await page.evaluate(() => {
      const titleEl = document.querySelector(".product-title");
      const priceEl = document.querySelector(".price");
      return {
        title: titleEl ? titleEl.innerText.trim() : "No encontrado",
        price: priceEl ? priceEl.innerText.trim() : "Sin precio",
      };
    });

    await browser.close();
    res.json({ producto, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(Servidor corriendo en http://localhost:${PORT});
});
