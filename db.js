// db.js
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    database: 'estacionamiento2',
    user: 'root-e',
    password: '123456'
});

connection.connect(error => {
    if (error) {
        console.error('Error de conexión a la base de datos:', error);
        process.exit(1);
    }
    console.log('Conexión exitosa a la base de datos');
});

module.exports = connection;
