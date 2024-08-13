const express = require('express');
const router = express.Router();
const db = require('../db'); // Asegúrate de que este archivo esté en la ruta correcta

// Ruta para crear un nuevo usuario, proveedor y vehículo
router.post('/', (req, res) => {
  const { model, plates, companyName, providerName, officialId, email, fullName } = req.body;

  if (!fullName || !model || !plates || !companyName || !providerName || !officialId) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  // Crear un nuevo usuario
  const userQuery = `
    INSERT INTO Usuario (CorreoElectronico, Nombre, Contrasena, TipoUsuario)
    VALUES (?, ?, '', 'Proveedor')
  `;
  const userValues = [email || null, fullName];

  db.query(userQuery, userValues, (err, userResults) => {
    if (err) {
      console.error('Error al insertar usuario:', err);
      return res.status(500).json({ error: 'Error al registrar usuario' });
    }

    const userId = userResults.insertId;

    // Crear el proveedor asociado al usuario
    const providerQuery = `
      INSERT INTO Proveedor (idProveedor, Nombre, RazonSocial, IdentificacionOficial)
      VALUES (?, ?, ?, ?)
    `;
    const providerValues = [userId, providerName, companyName, officialId];

    db.query(providerQuery, providerValues, (err) => {
      if (err) {
        console.error('Error al insertar proveedor:', err);
        return res.status(500).json({ error: 'Error al registrar proveedor' });
      }

      // Insertar el vehículo en la tabla Vehiculo
      const vehicleQuery = `
        INSERT INTO Vehiculo (idUsuario, Placa, Marca, Modelo)
        VALUES (?, ?, '', ?)
      `;
      const vehicleValues = [userId, plates, model, companyName || null];

      db.query(vehicleQuery, vehicleValues, (err) => {
        if (err) {
          console.error('Error al insertar vehículo:', err);
          return res.status(500).json({ error: 'Error al registrar vehículo' });
        }

        res.status(201).json({ message: 'Proveedor y vehículo registrados con éxito', id: userId });
      });
    });
  });
});

module.exports = router;