const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const dotenv = require('dotenv');

const app = express();
dotenv.config();
app.use(cors());
app.use(express.json());

//conexión a MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1026571230',
    database: 'amm',
    port: 3306
});

db.connect(err =>{
    if(err) return console.error('Error de conexión: ', err);
    console.log('Conectado a MySQL');
});

//rutas
// === Login ===
app.post('/login',(req, res) => {
    const {user, pass} = req.body;

    //comprobar si existe el usuario en la base de datos
    const query = 'SELECT * FROM usuario WHERE nombre_usuario = ? and contrasena = ?'
    db.query(query, [user, pass], (err, results) => {
        if(err) {
            console.error(err);
            return res.status(500).send('Error en la base de datos');
        }

        //si se encuentra el usuario
        if(results.length > 0){
            return res.status(200).json({ mensaje: 'Login exitoso', user: results[0]});
        } else {
            return res.status(401).json({ error: 'Usuario o contrase incorrectos'})
        }
    });
});

// === Registrar ===
app.post('/register',(req, res) => {
    const {nombre_usuario, contrasena, token} = req.body;

    if(process.env.TOKEN === token){
        //comprobar si existe el usuario en la base de datos
        const query = 'SELECT * FROM usuario WHERE nombre_usuario = ?'
        db.query(query, [nombre_usuario], (err, results) => {
            if(err) {
                return res.status(500).send('Error en la base de datos');
            }
            //si se encuentra el usuario
            if(results.length > 0){
                return res.status(200).json({ mensaje: 'Usuario ya existe'});
            } else {
                const queryCreate = 'INSERT INTO usuario (nombre_usuario, contrasena) VALUES (?,?)';
                db.query(queryCreate, [nombre_usuario, contrasena], (err, results) => {
                    if(err){
                        console.error(err);
                        return res.status(500).send('Error en la base de datos');
                    }

                    return res.status(200).json({ mensaje: `Usuario ${nombre_usuario} creado con exito`});
                });
            }
        });
    } else {
        return res.status(400).json({ mensaje: 'Token faltante o incorrecto' });
    };    
});

// === Tipo documento ===
// -- Obtener todos los registros --
app.get('/tipos/documento', (req, res) => {
    db.query('SELECT * FROM tipo_documento', (err, results) => {
        if(err) return res.status(500).json({ error: 'Error al recolectar tipos de documento'});
        res.json(results);
    });
});

// -- Insertar nuevo --
app.post('/tipos/documento/insert', (req, res) => {
    const { nombre_tipo, user_crea } = req.body;

    if(!nombre_tipo || !user_crea) {
        return res.status(400).json({ error: 'Faltan datos para crear el tipo de documento'});
    }

    const query = 'INSERT INTO tipo_documento (nombre_tipo, user_crea) VALUES (?,?)';
    db.query(query, [nombre_tipo, user_crea], (err, result) => {
        if (err) {
            console.error('Error al insertar: ', err);
            return res.status(500).json({error: 'Error en la base de datos'});
        }

        return res.status(201).json({mensaje: 'Tipo de documento creado con exito: ' + result.insertId, id: result.insertId});
    });
});

// -- Modificar datos --
app.post('/tipos/documento/update', (req, res) => {
    const { id_tipoDocu, nombre_tipo, user_modifica, modificado_el } = req.body;

    if (!id_tipoDocu || !nombre_tipo || !user_modifica || !modificado_el) {
        return res.status(400).json({error: 'Faltan datos para modificar el tipo de documento'});
    }

    const query = 'UPDATE tipo_documento SET nombre_tipo = ?, user_modifica = ?, modificado_el = ? WHERE id_tipoDocu = ?';
    db.query(query, [nombre_tipo, user_modifica, modificado_el, id_tipoDocu], (err, result) => {
        if (err) {
            console.error('Error al actualizar: ', err);
            return res.status(500).json({ error: 'Error en la base de datos'})
        }
        if (result.affectedRows == 0){
            return res.status(404).json({ mensaje: 'Tipo de documento no encontrado'});
        }
        return res.status(200).json({ mensaje: 'Tipo de documento con código ' + id_tipoDocu + ' actualizado'});
    });
});

// -- Eliminar datos --
app.post('/tipos/documento/delete', (req, res) => {
    const { id_tipoDocu } = req.body;

    if(!id_tipoDocu) {
        return res.status(400).json({error: 'Faltan datos para eliminar'})
    }

    const query = 'DELETE FROM tipo_documento WHERE id_tipoDocu = ?';
    db.query(query, [id_tipoDocu], (err, result) => {
        if(err) {
            console.error('Error al eliminar: ', err);
            return res.status(500).json({error: 'Error en la base de datos'})
        }
        if(result.affectedRows == 0){
            return res.status(404).json({mensaje: 'Tipo de documento no encontrado'})
        }

        return res.status(200).json({mensaje: 'Tipo de documento con código ' + id_tipoDocu + ' eliminado'});
    });
});

// === Tipo limpieza ===
// -- Obtener todos --
app.get('/tipos/limpieza', (req, res) => { //get all tipo limpieza
    db.query('SELECT * FROM tipo_limpieza', (err, results) => {
        if(err) return res.status(500).json({ error: 'Error al recolectar tipos de limpieza'});
        res.json(results);
    });
});

// -- Insertar nuevo --
app.post('/tipos/limpieza/insert', (req, res) => {
    const { nombre_tipo, user_crea } = req.body;

    if(!nombre_tipo || !user_crea) {
        return res.status(400).json({ error: 'Faltan datos para crear el tipo de limpieza'});
    }

    const query = 'INSERT INTO tipo_limpieza (nombre_tipo, user_crea) VALUES (?,?)';
    db.query(query, [nombre_tipo, user_crea], (err, result) => {
        if (err) {
            console.error('Error al insertar: ', err);
            return res.status(500).json({error: 'Error en la base de datos'});
        }

        return res.status(201).json({mensaje: 'Tipo de limpieza creado con exito: ' + result.insertId, id: result.insertId});
    });
});

// -- Modificar datos --
app.post('/tipos/limpieza/update', (req, res) => {
    const { id_tipoLimp, nombre_tipo, user_modifica, modificado_el } = req.body;

    if (!id_tipoLimp || !nombre_tipo || !user_modifica || !modificado_el) {
        return res.status(400).json({error: 'Faltan datos para modificar el tipo de limpieza'});
    }

    const query = 'UPDATE tipo_limpieza SET nombre_tipo = ?, user_modifica = ?, modificado_el = ? WHERE id_tipoLimp = ?';
    db.query(query, [nombre_tipo, user_modifica, modificado_el, id_tipoLimp], (err, result) => {
        if (err) {
            console.error('Error al actualizar: ', err);
            return res.status(500).json({ error: 'Error en la base de datos'})
        }

        if (result.affectedRows == 0){
            return res.status(404).json({ mensaje: 'Tipo de limpieza no encontrado'});
        }

        return res.status(200).json({ mensaje: 'Tipo de limpieza con código ' + id_tipoLimp + ' actualizado'});
    });
});

// -- Eliminar datos --
app.post('/tipos/limpieza/delete', (req, res) => {
    const { id_tipoLimp } = req.body;

    if(!id_tipoLimp) {
        return res.status(400).json({error: 'Faltan datos para eliminar'})
    }

    const query = 'DELETE FROM tipo_limpieza WHERE id_tipoLimp = ?';
    db.query(query, [id_tipoDocu], (err, result) => {
        if(err) {
            console.error('Error al eliminar: ', err);
            return res.status(500).json({error: 'Error en la base de datos'})
        }
        if(result.affectedRows == 0){
            return res.status(404).json({mensaje: 'Tipo de limpieza no encontrada'})
        }

        return res.status(200).json({mensaje: 'Tipo de limpieza con código ' + id_tipoLimp + ' eliminada'});
    });
});

// === Clientes ===
// -- Obtener todos los registros --
app.get('/clientes' , (req, res) => {
    db.query('SELECT * FROM cliente', (err, results) => {
        if(err) return res.status(500).json({error: 'Error al recolectar clientes'});
        res.json(results);
    });
});

// -- Insertar nuevo --
app.post('/clientes/insert', (req, res) => {
    const camposRequeridos = ['nombre_cliente', 'apellido_cliente', 'direccion_cliente', 'telefono_cliente', 'correo_cliente', 'user_crea'];
    const { nombre_cliente, apellido_cliente, direccion_cliente, telefono_cliente, correo_cliente, observacion_cliente, user_crea } = req.body;

    for(const campo of camposRequeridos){
        if(!req.body[campo]) {
            return res.status(400).json({ error: `Para crear faltan datos en el campo ${campo}`});
        }
    }

    const query = 'INSERT INTO cliente (nombre_cliente, apellido_cliente, direccion_cliente, telefono_cliente, correo_cliente, observacion_cliente, user_crea) VALUES (?,?,?,?,?,?,?)';
    db.query(query, [nombre_cliente, apellido_cliente, direccion_cliente, telefono_cliente, correo_cliente, observacion_cliente, user_crea], (err, result) => {
        if (err) {
            console.error('Error al insertar: ', err);
            return res.status(500).json({error: 'Error en la base de datos'});
        }

        return res.status(201).json({mensaje: 'Cliente creado con exito: ' + result.insertId, id: result.insertId});
    });
});

// -- Modificar datos --
app.post('/clientes/update', (req, res) => {
    const camposRequeridos = ['id_cliente', 'nombre_cliente, apellido_cliente, direccion_cliente, telefono_cliente, correo_cliente, user_modifica', 'modificado_el'];
    const { id_cliente, nombre_cliente, apellido_cliente, direccion_cliente, telefono_cliente, correo_cliente, observacion_cliente, user_modifica, modificado_el } = req.body;

    for(const campo of camposRequeridos){
        if(!req.body[campo]) {
            return res.status(400).json({ error: `Para modificar faltan datos en el campo ${campo}`});
        }
    }

    const query = 'UPDATE cliente SET nombre_cliente = ?, apellido_cliente = ?, direccion_cliente = ?, telefono_cliente = ?, correo_cliente = ?, observacion_cliente = ?, user_modifica = ?, modificado_el = ? WHERE id_cliente = ?';
    db.query(query, [nombre_cliente, apellido_cliente, direccion_cliente, telefono_cliente, correo_cliente, observacion_cliente, user_modifica, modificado_el, id_cliente], (err, result) => {
        if (err) {
            console.error('Error al actualizar: ', err);
            return res.status(500).json({ error: 'Error en la base de datos'})
        }

        if (result.affectedRows == 0){
            return res.status(404).json({ mensaje: 'Cliente no encontrado'});
        }

        return res.status(200).json({ mensaje: 'Cliente con código ' + id_cliente + ' actualizado'});
    });
});

// -- Eliminar datos --
app.post('/clientes/delete', (req, res) => {
    const { id_cliente } = req.body;

    if(!id_cliente) {
        return res.status(400).json({error: 'Faltan datos para eliminar'})
    }

    const query = 'DELETE FROM cliente WHERE id_cliente = ?';
    db.query(query, [id_cliente], (err, result) => {
        if(err) {
            console.error('Error al eliminar: ', err);
            return res.status(500).json({error: 'Error en la base de datos'})
        }
        if(result.affectedRows == 0){
            return res.status(404).json({mensaje: 'Cliente no encontrado'})
        }

        return res.status(200).json({mensaje: 'Cliente con código ' + id_cliente + ' eliminado'});
    });
});

// === Equipos ===
// -- Obtener todos los registros --
app.get('/equipos' , (req, res) => {
    db.query('SELECT * FROM equipo', (err, results) => {
        if(err) return res.status(500).json({error: 'Error al recolectar equipos'});
        res.json(results);
    });
});

// -- Obtener empleados equipo --
app.get('/equipos/empleados', (req, res) => {
    db.query('SELECT * FROM empleados_equipo', (err, results) => {
        if(err) return res.status(500).json({error: 'Error al recolectar equipos'})
        res.json(results);
    });
});

// -- Insertar nuevo --
app.post('/equipos/insert', (req, res) => {
    const camposRequeridos = ['nombre_equipo', 'lider', 'miembro1', 'miembro2', 'user_crea'];
    for(const campo of camposRequeridos){
        if(!req.body[campo]) {
            return res.status(400).json({ error: `Para crear faltan datos en el campo ${campo}`});
        }
    }

    const { nombre_equipo, lider, miembro1, miembro2, user_crea } = req.body;

    const queryEquipo = 'INSERT INTO equipo (nombre_equipo, user_crea) VALUES (?,?)';
    const queryUsuEqu = 'INSERT INTO empleados_equipo (id_equipo, id_empleado, rol) VALUES (?, ?, ?)'
    db.query(queryEquipo, [nombre_equipo, user_crea], (err, result) => {
        if (err) {
            console.error('Error al insertar: ', err);
            return res.status(500).json({error: 'Error en la base de datos'});
        }

        const idEquipo = result.insertId;
        const miembros = [lider, miembro1, miembro2];
        const roles = ['lider', 'miembro1', 'miembro2'];

        const inserts = miembros.map((id_empleado, index) => {
            return new Promise((resolve, reject) => {
                db.query(queryUsuEqu, [idEquipo, id_empleado, roles[index]], (err, result) => {
                    if(err) {
                        return reject(err);
                    }

                    resolve(result);
                });
            });
        });

        Promise.all(inserts)
            .then(() => {
                return res.status(201).json({ mensaje: `Equipo creado con exito: ${idEquipo}`});
            })
            .catch((err) => {
                console.log('Error al insertar miembros del equipo: ', err);
                return res.status(500).json({ error: 'Error al insertar miembros del equipo' });
            });
    });
});

// -- Modificar datos --
app.post('/equipos/update', (req, res) => {
    const camposRequeridos = ['id_equipo', 'nombre_equipo', 'lider', 'miembro1', 'miembro2', 'user_modifica', 'modificado_el'];
    for(const campo of camposRequeridos){
        if(!req.body[campo]) {
            return res.status(400).json({ error: `Para modificar faltan datos en el campo ${campo}`});
        }
    }

    const { id_equipo, nombre_equipo, lider, miembro1, miembro2, user_modifica, modificado_el } = req.body;

    const queryEquipo = 'UPDATE equipo SET nombre_equipo = ?, user_modifica = ?, modificado_el = ? WHERE id_equipo = ?';
    const queryUseEqu = 'UPDATE empleados_equipo SET id_empleado = ? WHERE id_equipo = ? AND rol = ?';
    db.query(queryEquipo, [nombre_equipo, user_modifica, modificado_el, id_equipo], (err, result) => {
        if (err) {
            console.error('Error al insertar: ', err);
            return res.status(500).json({error: 'Error en la base de datos'});
        }

        const roles = ['lider', 'miembro1', 'miembro2'];
        const miembros = [lider, miembro1, miembro2];

        const updates = miembros.map((id_empleado, index) => {
            return new Promise((resolve, reject) => {
                db.query(queryUseEqu, [id_empleado, id_equipo, roles[index]], (err, result) => {
                    if(err) {
                        return reject(err);
                    }

                    resolve(result);
                });
            });
        });

        Promise.all(updates)
            .then(() => {
                return res.status(201).json({ mensaje: `Equipo modificado con exito: ${id_equipo}`});
            })
            .catch((err) => {
                console.log('Error al modificar miembros del equipo: ', err);
                return res.status(500).json({ error: 'Error al modificar miembros del equipo' });
            });
    });
});

// -- Eliminar datos --
app.post('/equipos/delete', (req, res) => {
    const { id_equipo } = req.body;

    if(!id_equipo) {
        return res.status(400).json({error: 'Faltan datos para eliminar'})
    }

    const queryUsEq = 'DELETE FROM empleados_equipo WHERE id_equipo = ?';
    const queryEquipo = 'DELETE FROM equipo WHERE id_equipo = ?';

    //eliminar registros de empleados_equipo
    db.query(queryUsEq, [id_equipo], (err, resultUsEq) => {
        if (err) {
            console.error('Error al eliminar en empleados_equipo: ', err);
            return res.status(500).json({error: 'Error al eliminar miembros del equipo'});
        }

        //eliminar registro de equipo
        db.query(queryEquipo, [id_equipo], (err, resultEquipo) => {
            if(err) {
                console.error('Error al elminar equipo: ', err);
                return res.status(500).json({error: 'Error al eliminar el equipo'});
            }

            if(resultEquipo.affectedRows === 0) {
                return res.status(404).json({ mensaje: 'Equipo no encontrado' });
            }

            return res.status(200).json({ mensaje: 'Equipo con código ' + id_equipo + ' eliminado'});
        });
    });    
});

// === Empleados ===
// -- Obtener todos los registros --
app.get('/empleados' , (req, res) => {
    db.query('SELECT * FROM empleado', (err, results) => {
        if(err) return res.status(500).json({error: 'Error al recolectar empleados'});
        res.json(results);
    });
});

// -- Insertar nuevo --
app.post('/empleados/insert', (req, res) => {
    const camposRequeridos = ['id_empleado', 'id_tipoDocu', 'documento_empleado', 'nombre_empleado', 'apellido_empleado', 'telefono_empleado', 'correo_empleado', 'user_crea'];
    for(const campo of camposRequeridos){
        if(!req.body[campo]) {
            return res.status(400).json({ error: `Para crear faltan datos en el campo ${campo}`});
        }
    }

    const { id_empleado, id_tipoDocu, documento_empleado, nombre_empleado, apellido_empleado, telefono_empleado, correo_empleado, user_crea } = req.body;

    const query = 'INSERT INTO empleado (id_empleado, id_tipoDocu, documento_empleado, nombre_empleado, apellido_empleado, telefono_empleado, correo_empleado, user_crea) VALUES (?,?,?,?,?,?,?,?)';
    db.query(query, [id_empleado, id_tipoDocu, documento_empleado, nombre_empleado, apellido_empleado, telefono_empleado, correo_empleado, user_crea], (err, result) => {
        if (err) {
            console.error('Error al insertar: ', err);
            return res.status(500).json({error: 'Error en la base de datos'});
        }

        return res.status(201).json({mensaje: 'Empleado creado con exito: ' + id_empleado, id: id_empleado});
    });
});

// -- Modificar datos --
app.post('/empleados/update', (req, res) => {
    const camposRequeridos = ['id_empleado', 'id_tipoDocu', 'documento_empleado', 'nombre_empleado', 'apellido_empleado', 'telefono_empleado', 'correo_empleado', 'user_modifica', 'modificado_el'];
    for(const campo of camposRequeridos){
        if(!req.body[campo]) {
            return res.status(400).json({ error: `Para modificar faltan datos en el campo ${campo}`});
        }
    }

    const { id_empleado, id_tipoDocu, documento_empleado, nombre_empleado, apellido_empleado, telefono_empleado, correo_empleado, user_modifica, modificado_el } = req.body;

    const query = 'UPDATE empleado SET id_tipoDocu = ?, documento_empleado = ?, nombre_empleado = ?, apellido_empleado = ?, telefono_empleado = ?, correo_empleado = ?, user_modifica = ?, modificado_el = ? WHERE id_empleado = ?';
    db.query(query, [id_tipoDocu, documento_empleado, nombre_empleado, apellido_empleado, telefono_empleado, correo_empleado, user_modifica, modificado_el, id_empleado], (err, result) => {
        if (err) {
            console.error('Error al actualizar: ', err);
            return res.status(500).json({ error: 'Error en la base de datos'})
        }

        if (result.affectedRows == 0){
            return res.status(404).json({ mensaje: 'Empleado no encontrado'});
        }

        return res.status(200).json({ mensaje: 'Empleado con código ' + id_empleado + ' actualizado'});
    });
});

// -- Eliminar datos --
app.post('/empleados/delete', (req, res) => {
    const { id_empleado } = req.body;

    if(!id_empleado) {
        return res.status(400).json({error: 'Faltan datos para eliminar'})
    }

    const query = 'DELETE FROM empleado WHERE id_empleado = ?';
    db.query(query, [id_empleado], (err, result) => {
        if(err) {
            console.error('Error al eliminar: ', err);
            return res.status(500).json({error: 'Error en la base de datos'})
        }
        if(result.affectedRows == 0){
            return res.status(404).json({mensaje: 'Empleado no encontrado'})
        }

        return res.status(200).json({mensaje: 'Empleado con código ' + id_empleado + ' eliminado'});
    });
});

// === Servicios ===
// -- Obtener todos los registros --
app.get('/servicios' , (req, res) => {
    db.query('SELECT * FROM servicio', (err, results) => {
        if(err) return res.status(500).json({error: 'Error al recolectar servicios'});
        res.json(results);
    });
});

// -- Obtener registros por fecha --
app.get('/servicios/:fecha', (req, res) => {
    const fecha = req.params.fecha;
    const query = 'SELECT * FROM servicio WHERE fecha = ?';
    db.query(query, [fecha] , (err, results) => {
        if (err) return res.status(500).json({error: 'Error al recolectar servicios'});
        res.json(results);
    });
});

// -- Insertar nuevo --
app.post('/servicios/insert', (req, res) => {
    const camposRequeridos = ['id_cliente', 'id_equipo', 'id_tipoLimp', 'fecha', 'hora', 'tiempo_estimado', 'tiempo_finalizacion', 'precio', 'user_crea'];
    const { id_cliente, id_equipo, id_tipoLimp, fecha, hora, tiempo_estimado, tiempo_finalizacion, precio, observacion, user_crea } = req.body;

    for(const campo of camposRequeridos){
        if(!req.body[campo]) {
            return res.status(400).json({ error: `Para crear faltan datos en el campo ${campo}`});
        }
    }

    const query = 'INSERT INTO servicio (id_cliente, id_equipo, id_tipoLimp, fecha, hora, tiempo_estimado, tiempo_finalizacion, precio, observacion, user_crea) VALUES (?,?,?,?,?,?,?,?,?,?)';
    db.query(query, [id_cliente, id_equipo, id_tipoLimp, fecha, hora, tiempo_estimado, tiempo_finalizacion, precio, observacion, user_crea], (err, result) => {
        if (err) {
            console.error('Error al insertar: ', err);
            return res.status(500).json({error: 'Error en la base de datos'});
        }

        return res.status(201).json({mensaje: 'Servicio creado con exito: ' + result.insertId, id: result.insertId});
    });
});

// -- Modificar datos --
app.post('/servicios/update', (req, res) => {
    const camposRequeridos = ['id_servicio', 'id_cliente', 'id_equipo', 'id_tipoLimp', 'fecha', 'hora', 'tiempo_estimado', 'tiempo_finalizacion', 'precio', 'user_modifica', 'modificado_el'];
    const { id_servicio, id_cliente, id_equipo, id_tipoLimp, fecha, hora, tiempo_estimado, tiempo_finalizacion, precio, observacion, user_modifica, modificado_el } = req.body;

    for(const campo of camposRequeridos){
        if(!req.body[campo]) {
            return res.status(400).json({ error: `Para modificar faltan datos en el campo ${campo}`});
        }
    }

    const query = 'UPDATE usuario SET id_cliente = ?, id_equipo = ?, id_tipoLimp = ?, fecha = ?, hora = ?, tiempo_estimado = ?, tiempo_finalizacion = ?, precio = ?, observacion = ?, user_modifica = ?, modificado_el = ? WHERE id_servicio = ?';
    db.query(query, [id_cliente, id_equipo, id_tipoLimp, fecha, hora, tiempo_estimado, tiempo_finalizacion, precio, observacion, user_modifica, modificado_el, id_servicio], (err, result) => {
        if (err) {
            console.error('Error al actualizar: ', err);
            return res.status(500).json({ error: 'Error en la base de datos'})
        }

        if (result.affectedRows == 0){
            return res.status(404).json({ mensaje: 'Servicio no encontrado'});
        }

        return res.status(200).json({ mensaje: 'Servicio con código ' + id_servicio + ' actualizado'});
    });
});

// -- Eliminar datos --
app.post('/servicios/delete', (req, res) => {
    const { id_servicio } = req.body;

    if(!id_servicio) {
        return res.status(400).json({error: 'Faltan datos para eliminar'})
    }

    const query = 'DELETE FROM servicio WHERE id_servicio = ?';
    db.query(query, [id_servicio], (err, result) => {
        if(err) {
            console.error('Error al eliminar: ', err);
            return res.status(500).json({error: 'Error en la base de datos'})
        }
        if(result.affectedRows == 0){
            return res.status(404).json({mensaje: 'Servicio no encontrado'})
        }

        return res.status(200).json({mensaje: 'Servicio con código ' + id_servicio + ' eliminado'});
    });
});

app.listen(3001, () => {
    console.log('Servidor backend corriendo en http://localhost:3001');
});