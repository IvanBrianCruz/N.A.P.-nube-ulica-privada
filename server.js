const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

// Configuración de Express
const app = express();
const port = 3000;

// Obtener la dirección IP local
const networkInterfaces = os.networkInterfaces();
let localIP = 'localhost'; // Valor por defecto

for (let interfaceName in networkInterfaces) {
    for (let iface of networkInterfaces[interfaceName]) {
        if (iface.family === 'IPv4' && !iface.internal) {
            localIP = iface.address; // Asigna la dirección IP local
            break;
        }
    }
}

// Carpeta para almacenar los archivos
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Configuración de multer para subir archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Middleware para servir archivos estáticos
app.use(express.static('public'));

// Ruta para subir archivos
app.post('/upload', upload.single('file'), (req, res) => {
    res.send('Archivo subido con éxito');
});

// Ruta para listar archivos con su tamaño y extensión
app.get('/files', (req, res) => {
    fs.readdir(uploadDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: 'Error al leer los archivos' });
        }

        // Mapeamos los archivos con su nombre, tamaño y tipo
        const fileInfo = files.map(file => {
            const filePath = path.join(uploadDir, file);
            const stats = fs.statSync(filePath);
            const fileSizeInBytes = stats.size;
            
            // Convertir tamaño a MB o KB
            let size;
            if (fileSizeInBytes >= 1024 * 1024) {
                size = (fileSizeInBytes / (1024 * 1024)).toFixed(2) + ' MB';
            } else {
                size = (fileSizeInBytes / 1024).toFixed(2) + ' KB';
            }

            return {
                name: file,
                size: size,
                extension: path.extname(file).slice(1) // Extensión sin el punto
            };
        });

        res.json(fileInfo);
    });
});

// Ruta para descargar archivos
app.get('/download/:filename', (req, res) => {
    const file = path.join(uploadDir, req.params.filename);
    res.download(file);
});

// Iniciar el servidor
app.listen(port, localIP, () => {
    console.log(`Servidor funcionando en http://${localIP}:${port}`);
});
