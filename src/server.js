// server.js
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("✅ Bot Discord en ligne !");
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🌍 Serveur Express lancé sur le port ${port}`);
});
