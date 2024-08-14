const cors = require('cors');
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const morgan = require('morgan')

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configuración de conexión a la base de datos
const conexion = mysql.createConnection({
    host: 'localhost',
    database: 'estacionamiento',
    user: 'root-e',
    password: '123456'
});

app.use(morgan('dev'));

// Conexión con la base de datos
conexion.connect(error => {
    if (error) throw error;
    console.log('Conexión exitosa a la BD');
});

// Rutas addusers
const usuarioRoutes = require('./routes/usuarios'); // Asegúrate de que esta ruta sea correcta
app.use('/usuarios', usuarioRoutes);

// Rutas provedores
const suplierRoutes = require('./routes/suplier');
app.use('/suplier', suplierRoutes);

const trabajadorRotes = require('./routes/trabajadores'); 
app.use('/trabajadores', trabajadorRotes);

// Ruta raíz
app.get('/', (req, res) => {
    res.send('API');
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`Servidor corriendo en el puerto ${port}`);
});

