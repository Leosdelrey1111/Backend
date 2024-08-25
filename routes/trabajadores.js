const { Router } = require('express');
const db = require('../db');

const router = Router();

// Crear un nuevo empleado
router.post('/', (req, res) => {
    const { Nombre, CorreoElectronico, Contrasena, Departamento, Cargo } = req.body;
    console.log(req.body);

    if (!Nombre || !CorreoElectronico || !Contrasena || !Departamento || !Cargo) {
        return res.status(400).json({ error: 'Campos requeridos faltantes' });
    }

    const createUsuarioQuery = 'INSERT INTO Usuario (Nombre, CorreoElectronico, Contrasena, TipoUsuario) VALUES (?, ?, ?, ?)';
    db.query(createUsuarioQuery, [Nombre, CorreoElectronico, Contrasena, 'Empleado'], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al crear usuario' });
        }

        const idUsuario = result.insertId;

        const createEmpleadoQuery = 'INSERT INTO Empleado (idUsuario, Cargo, Departamento) VALUES (?, ?, ?)';
        db.query(createEmpleadoQuery, [idUsuario, Cargo, Departamento], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al crear empleado' });
            }
            res.status(201).json({ message: 'Empleado creado' });
        });
    });
});

// Obtener todos los empleados
router.get('/', (req, res) => {
    const query = 'SELECT * FROM Empleado AS e INNER JOIN Usuario AS u ON e.idUsuario = u.idUsuario';
    db.query(query, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener empleados' });
        }
        res.status(200).json(results);
    });
});

// Obtener un empleado por ID
router.get('/:idEmpleado', (req, res) => {
    const { idEmpleado } = req.params;
    const query = 'SELECT * FROM Empleado WHERE idEmpleado = ?';
    db.query(query, [idEmpleado], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener empleado' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }
        res.status(200).json(results[0]);
    });
});

// Actualizar un empleado
router.put('/:idEmpleado', (req, res) => {
    const { idEmpleado } = req.params;
    const { Cargo, Departamento, Nombre, CorreoElectronico, Contrasena } = req.body;

    if (!Cargo || !Departamento || !Nombre || !CorreoElectronico || !Contrasena) {
        return res.status(400).json({ error: 'Campos requeridos faltantes' });
    }

    const updateUsuarioQuery = `
        UPDATE Usuario
        SET Nombre = ?, CorreoElectronico = ?, Contrasena = ?
        WHERE idUsuario = (
            SELECT idUsuario FROM Empleado WHERE idEmpleado = ?
        )
    `;
    db.query(updateUsuarioQuery, [Nombre, CorreoElectronico, Contrasena, idEmpleado], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al actualizar usuario' });
        }

        const updateEmpleadoQuery = `
            UPDATE Empleado
            SET Cargo = ?, Departamento = ?
            WHERE idEmpleado = ?
        `;
        db.query(updateEmpleadoQuery, [Cargo, Departamento, idEmpleado], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al actualizar empleado' });
            }
            res.status(200).json({ message: 'Empleado y usuario actualizados' });
        });
    });
});

// Eliminar un empleado por ID
router.delete('/:idEmpleado', (req, res) => {
    const { idEmpleado } = req.params;

    // Primero, obtener el idUsuario asociado al idEmpleado
    const getUserIdQuery = 'SELECT idUsuario FROM Empleado WHERE idEmpleado = ?';
    db.query(getUserIdQuery, [idEmpleado], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Error al obtener el usuario asociado al empleado' });
        }

        if (results.length === 0) {
            return res.status(404).json({ error: 'Empleado no encontrado' });
        }

        const idUsuario = results[0].idUsuario;

        // Eliminar primero de la tabla Empleado
        const deleteEmpleadoQuery = 'DELETE FROM Empleado WHERE idEmpleado = ?';
        db.query(deleteEmpleadoQuery, [idEmpleado], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Error al eliminar empleado' });
            }

            // Luego eliminar de la tabla Usuario
            const deleteUserQuery = 'DELETE FROM Usuario WHERE idUsuario = ?';
            db.query(deleteUserQuery, [idUsuario], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Error al eliminar usuario' });
                }
                res.status(200).json({ message: 'Empleado y usuario eliminados' });
            });
        });
    });
});

module.exports = router;
