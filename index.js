const express = require("express");
const puppeteer = require("puppeteer");
const app = express();
const port = process.env.PORT || 3000;

app.get("/api/ioma", async (req, res) => {
  const numeroAfiliado = req.query.numero;
  if (!numeroAfiliado) {
    return res.status(400).json({ error: "Falta el parámetro 'numero'" });
  }

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    headless: true
  });
  const page = await browser.newPage();

  try {
    await page.goto("https://www.ioma.gba.gob.ar/index.php/consulta-padron-afiliados/");

    await page.waitForSelector("#input_afiliado");
    await page.type("#input_afiliado", numeroAfiliado);
    await page.click("#btn_buscar");
    await page.waitForTimeout(3000);

    const resultado = await page.evaluate(() => {
      const texto = document.querySelector("#resultado")?.innerText || "";
      return texto.trim();
    });

    await browser.close();

    res.json({ resultado });
  } catch (error) {
    await browser.close();
    res.status(500).json({ error: error.message });
  }
});

app.get("/", (req, res) => {
  res.send("API de búsqueda de afiliado IOMA OK");
});

app.listen(port, () => {
  console.log(`Servidor corriendo en puerto ${port}`);
});