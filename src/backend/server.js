const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
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
    const query = 'SELECT * FROM usuario WHERE nombre_usuario = ? and contrasena_usuario = ?'
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

// === Tipo documento ===
app.get('/tipos/documento', (req, res) => { //get all tipo documento
    db.query('SELECT * FROM tipo_documento', (err, results) => {
        if(err) return res.status(500).json({ error: 'Error al recolectar tipos de documento'});
        res.json(results);
    });
});

app.post('tipos/documento/insert', (req, res) => { //insert tipo documento
    const { nombre_tipo } = req.body;
    const { user_crea } = req.body;

    if(!nombre_tipo || !user_crea) {
        return res.status(400).json({ error: 'Falta el archivo del tipo'});
    }

    const query = 'INSERT INTO tipo_documento (nombre_tipo, user_crea) VALUES (?,?)';
    db.query(query, [nombre_tipo, user_crea], (err, result) => {
        if (err) {
            console.error('Error al insertar: ', err);
            return res.status(500).json({error: 'Error en la base de datos'});
        }

        return res.status(201).json({mensaje: 'Registro creado con exito', id: result.insertId});
    });
});

app.post('tipos/documento/update', (req, res) => { //update tipo documento
    const { id_tipoDocu } = req.body;
});

app.get('/tipos/limpieza', (req, res) => { //get all tipo limpieza
    db.query('SELECT * FROM tipo_limpieza', (err, results) => {
        if(err) return res.status(500).json({ error: 'Error al recolectar tipos de limpieza'});
        res.json(results);
    });
});

app.get('/tipos/usuario', (req, res) => { //get all tipo usuario
    db.query('SELECT * FROM tipo_usuario', (err, results) => {
        if(err) return res.status(500).json({ error: 'Error al recolectar tipos de usuario'});
        res.json(results);
    });
});

app.listen(3001, () => {
    console.log('Servidor backend corriendo en http://localhost:3001');
});