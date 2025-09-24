import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";

const app = express();
const PORT = process.env.PORT || 3000;

// Endpoint raíz (para probar que el servidor está vivo)
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
    // 🔥 URL con concatenación, igual que ya usabas
    const url = "https://www.visiotechsecurity.com/es/search?q=" + encodeURIComponent(producto);
    const { data } = await axios.get(url);

    const $ = cheerio.load(data);

    // Ajustamos selectores a lo que realmente aparece en la web
    const titleEl = $(".product-name a").first(); // nombre del producto
    const descEl = $(".product-description").first(); // descripción corta
    const priceEl = $(".price").first(); // seguirá vacío sin login

    const result = {
      titulo: titleEl.text().trim() || "No encontrado",
      descripcion: descEl.text().trim() || "Sin descripción",
      precio: priceEl.text().trim() || "Sin precio"
    };

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
