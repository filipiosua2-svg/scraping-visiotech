import express from "express";
import puppeteer from "puppeteer";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Endpoint principal: recibe un producto y devuelve el título y precio
app.post("/scrape", async (req, res) => {
  const { producto } = req.body;

  if (!producto) {
    return res.status(400).json({ error: "Falta el parámetro 'producto'" });
  }

  const url = `https://www.visiotechsecurity.com/es/search?q=${encodeURIComponent(
    producto
  )}`;

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Extraer título y precio (ajusta selectores si cambian en la web)
    const data = await page.evaluate(() => {
      const title = document.querySelector("h1,h2,h3")?.innerText || "Sin título";
      const price =
        document.querySelector(".price")?.innerText.trim() || "N/A";
      return { title, price };
    });

    await browser.close();
    res.json({ producto, ...data });
  } catch (err) {
    console.error("Error en scraping:", err);
    res.status(500).json({ error: "Error al hacer scraping" });
  }
});

app.listen(PORT, () => {
console.log("Servidor corriendo en http://localhost:" + PORT);
