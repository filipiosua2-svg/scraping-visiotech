import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint raíz para probar que Render responde
app.get("/", (req, res) => {
  res.send("✅ Servidor activo. Usa /scrape?producto=XXXX");
});

app.get("/scrape", async (req, res) => {
  const producto = req.query.producto;

  if (!producto) {
    return res.status(400).json({ error: "Falta el parámetro ?producto=" });
  }

  try {
    const url = https://www.visiotechsecurity.com/es/search?q=${encodeURIComponent(producto)};
    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    const titleEl = $(".product-title").first();
    const priceEl = $(".price").first();

    const result = {
      titulo: titleEl.text().trim() || "No encontrado",
      precio: priceEl.text().trim() || "Sin precio"
    };

    res.json(result);
  } catch (err) {
    console.error("Error en scraping:", err.message);
    res.status(500).json({ error: "Fallo en el scraping" });
  }
});

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto " + PORT);
});
