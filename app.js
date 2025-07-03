const express = require('express');
const cors = require('cors');
const deleteCloudinaryRouter = require('./api/delete-cloudinary');

const app = express();
app.use(cors());
app.use(express.json());

// Monta la ruta /api/delete-cloudinary
app.use('/api', deleteCloudinaryRouter);

// Puerto configurado por variable de entorno o 3000 por defecto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('Servidor backend escuchando en puerto', PORT);
});
