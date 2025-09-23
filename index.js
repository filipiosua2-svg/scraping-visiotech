import express from "express";
import axios from "axios";
import * as cheerio from "cheerio";
import { CookieJar } from "tough-cookie";
import { wrapper } from "axios-cookiejar-support";

const app = express();
const PORT = process.env.PORT || 3000;

// opcional (cuando tengas acceso de cliente)
const VIS_USER = process.env.VIS_USERNAME || "";
const VIS_PASS = process.env.VIS_PASSWORD || "";

// cliente http con cookie jar (para mantener sesión al hacer login)
const jar = new CookieJar();
const http = wrapper(axios.create({
  jar,
  withCredentials: true,
  headers: {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
  },
  timeout: 30000
}));

async function loginIfNeeded() {
  if (!VIS_USER || !VIS_PASS) return; // sin credenciales, saltamos
  // TODO: cuando tengas la URL exacta de login, actualízala aquí:
  const loginUrl = "https://www.visiotechsecurity.com/customer/account/loginPost/"; // ejemplo típico Magento
  try {
    await http.post(loginUrl, new URLSearchParams({
      login: "1",
      "login[username]": VIS_USER,
      "login[password]": VIS_PASS
    }).toString(), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      maxRedirects: 5
    });
  } catch (e) {
    // si cambia la ruta de login, no rompas toda la API
    console.warn("Login opcional falló (se ignorará hasta tener credenciales definitivas):", e.message);
  }
}

app.get("/health", (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

app.get("/scrape", async (req, res) => {
  const producto = (req.query.producto || "").toString().trim();
  if (!producto) {
    return res.status(400).json({ error: "Falta el parámetro ?producto=" });
  }

  try {
    await loginIfNeeded(); // si hay credenciales, intenta loguear

    const url = "https://www.visiotechsecurity.com/es/search?q=" + encodeURIComponent(producto);
    const resp = await http.get(url);
    const $ = cheerio.load(resp.data);

    // intenta distintos selectores razonables
    const titleSel = $(".product-title, h2.product-item-link, a.product-item-link").first();
    const priceSel = $(".price, .price-wrapper .price").first();

    const titulo = titleSel.text().trim() || "No encontrado";
    // Puede que el precio sólo aparezca tras login
    const precio = (priceSel.text().trim() || "").replace(/\s+/g, " ").trim() || "N/A";

    res.json({
      ok: true,
      producto,
      url,
      titulo,
      precio
    });
  } catch (err) {
    console.error("Error en scraping:", err.message);
    res.status(500).json({ ok: false, error: "Fallo en el scraping" });
  }
});

app.listen(PORT, function () {
  console.log("Servidor corriendo en puerto " + PORT);
});
