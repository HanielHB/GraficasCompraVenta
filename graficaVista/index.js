const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();

// Configuración de CORS
var corsOptions = {
    origin: 'http://localhost:5173',
};
app.use(cors(corsOptions));

// Middleware para analizar JSON y formularios
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware para servir archivos estáticos desde 'public'
app.use(express.static('public'));

// Asegurar que la carpeta 'uploads' exista
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Servir archivos estáticos desde 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Configuración de multer para la subida de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Guardar en la carpeta 'uploads'
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único
    }
});
const upload = multer({ storage: storage });

// Importar y sincronizar la base de datos
const db = require("./models");
db.sequelize.sync().then(() => {
     //force: true // drop tables and recreate
    console.log("DB sincronizada correctamente");
});

// Middleware para validación de errores en JSON
app.use((error, req, res, next) => {
    if (error instanceof SyntaxError) {
        res.status(400).json({ msg: 'Error en el JSON' });
    } else {
        next();
    }
});

// Importar rutas
require('./routes')(app);



// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
