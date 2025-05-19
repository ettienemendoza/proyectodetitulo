const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { Readable } = require('stream');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const UsuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    contrasena: { type: String, required: true },
    cargo: { type: String, required: true },
    email: { type: String, required: true, unique: true }
});

UsuarioSchema.pre('save', async function (next) {
    if (this.isModified('contrasena')) {
        const salt = await bcrypt.genSalt(10);
        this.contrasena = await bcrypt.hash(this.contrasena, salt);
    }
    next();
});

const Usuario = mongoose.model('Usuario', UsuarioSchema);

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Acceso denegado, token no proporcionado' });

    jwt.verify(token, 'tu_clave_secreta', (err, user) => {
        if (err) return res.status(403).json({ message: 'Token no válido' });
        req.user = user;
        next();
    });
};

const IncidenceSchema = new mongoose.Schema({
    type: { type: String, required: true },
    description: { type: String, required: true },
    executiveName: { type: String, required: true },
    estado: { type: String, required: true, default: 'pendiente' }, // Renamed 'comments' to 'estado' and set default
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Incidence = mongoose.model('Incidence', IncidenceSchema);

const TipoErrorSchema = new mongoose.Schema({
    tipoerror: { type: String, required: true },
    supervisor_ud: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const TipoFallaSchema = new mongoose.Schema({
    tipodefalla: { type: String, required: true },
    supervisor_ud: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});
const EstadisticasSchema = new mongoose.Schema({
    estadisticas: { type: String, required: true },
    supervisor_ud: { type: String, required: true },
    detalles: { type: Array },
    createdAt: { type: Date, default: Date.now },
});
const ReporteSchema = new mongoose.Schema({
    fechaGeneracion: { type: Date, required: true },
    totalIncidencias: { type: Number, required: true },
    resumenErrores: [{
        error: { type: String, required: true },
        cantidad: { type: Number, required: true }
    }],
    detalles: { type: Array, required: true }
});

const TipoError = mongoose.model('TipoError', TipoErrorSchema);
const TipoFalla = mongoose.model('TipoFalla', TipoFallaSchema);
const Estadisticas = mongoose.model('Estadisticas', EstadisticasSchema);
const Reporte = mongoose.model('Reporte', ReporteSchema);

app.get('/api/incidencias', authenticateJWT, async (req, res) => {
    try {
        const query = {};
        if (req.query.type) query.type = req.query.type;
        if (req.query.estado) query.estado = req.query.estado;
        if (req.query.fechaInicio && req.query.fechaFin) {
            query.createdAt = { $gte: new Date(req.query.fechaInicio), $lte: new Date(req.query.fechaFin) };
        } else if (req.query.fechaInicio) {
            query.createdAt = { $gte: new Date(req.query.fechaInicio) };
        } else if (req.query.fechaFin) {
            query.createdAt = { $lte: new Date(req.query.fechaFin) };
        }
        const incidencias = await Incidence.find(query);
        res.status(200).json(incidencias);
    } catch (error) {
        console.error('Error al obtener las incidencias:', error.message);
        res.status(500).json({ message: 'Error al obtener las incidencias', error: error.message });
    }
});

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'tu_correo@gmail.com',
        pass: 'tu_contraseña'
    }
});

app.post('/api/reset-password', async (req, res) => {
    const { usuario, email } = req.body;

    try {
        const user = await Usuario.findOne({ nombre: usuario, email: email });
        if (!user) {
            return res.status(404).json({ message: 'Usuario o correo electrónico no encontrados' });
        }

        const mailOptions = {
            from: 'tu_correo@gmail.com',
            to: email,
            subject: 'Tu Contraseña',
            text: `Tu contraseña es: ${user.contrasena}\nPor favor, cambia tu contraseña después de iniciar sesión.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo electrónico:', error);
                return res.status(500).json({ message: 'Error al enviar el correo electrónico: ' + error.message });
            } else {
                console.log('Correo electrónico enviado:', info.response);
                res.status(200).json({ message: 'Contraseña enviada al correo electrónico' });
            }
        });
    } catch (error) {
        console.error('Error al resetear la contraseña:', error.message);
        res.status(500).json({ message: 'Error al resetear la contraseña: ' + error.message });
    }
});

app.post('/api/login', async (req, res) => {
    const { usuario, contrasena } = req.body;

    console.log('Datos recibidos del frontend:', { usuario, contrasena });

    try {
        const user = await Usuario.findOne({ email: usuario }); // Login with email
        console.log('Usuario encontrado en la base de datos:', user);

        if (!user) {
            return res.status(401).json({ message: 'Correo electrónico o contraseña incorrectos' });
        }

        const validPassword = await bcrypt.compare(contrasena, user.contrasena);

        console.log('Resultado de la comparación de contraseñas:', validPassword);

        if (validPassword) {
            const token = jwt.sign({ _id: user._id, nombre: user.nombre, rol: user.cargo, email: user.email }, 'tu_clave_secreta', { expiresIn: '1h' });
            res.status(200).json({ message: 'Login exitoso', token, rol: user.cargo, nombre: user.nombre, email: user.email }); // Send back nombre
        } else {
            res.status(401).json({ message: 'Correo electrónico o contraseña incorrectos' });
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);
        res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
});

app.post('/api/incidencias', authenticateJWT, async (req, res) => {
    const { type, description, otroTipoError, estado } = req.body;
    const executiveName = req.user.nombre; // Get name from token

    const newIncidence = new Incidence({
        type: otroTipoError || type, // Use otroTipoError if provided, else use type
        description,
        executiveName,
        estado: estado || 'pendiente'
    });

    try {await newIncidence.save();
        res.status(201).json({ message: 'Incidencia registrada exitosamente' });
    } catch (error) {
        console.error('Error al guardar la incidencia:', error.message);
        res.status(500).json({ message: 'Error al registrar la incidencia', error: error.message });
    }
});

app.get('/api/incidencias/:id', authenticateJWT, async (req, res) => {
    try {
        const incidencia = await Incidence.findById(req.params.id);
        if (!incidencia) {
            return res.status(404).json({ message: 'Incidencia no encontrada' });
        }
        res.status(200).json(incidencia);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la incidencia', error: error.message });
    }
});

app.put('/api/incidencias/:id', authenticateJWT, async (req, res) => {
    try {
        const { estado } = req.body;
        const incidencia = await Incidence.findByIdAndUpdate(
            req.params.id,
            { estado, updatedAt: Date.now() },
            { new: true }
        );
        if (!incidencia) {
            return res.status(404).json({ message: 'Incidencia no encontrada' });
        }
        res.status(200).json({ message: 'Estado de la incidencia actualizado exitosamente', incidencia });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el estado de la incidencia', error: error.message });
    }
});

app.post('/api/guardar-reporte-errores', authenticateJWT, async (req, res) => {
    const { reporteErrores } = req.body;
    const usuarioGeneraReporte = req.user.nombre;

    try {
        const nuevoReporteEstadisticas = new Estadisticas({
            estadisticas: 'reporte_errores_comunes',
            supervisor_ud: usuarioGeneraReporte, // Usamos supervisor_ud para almacenar el nombre del usuario que generó el reporte
            detalles: reporteErrores, // Guardamos el detalle del reporte
            createdAt: new Date()
        });

        await nuevoReporteEstadisticas.save();
        res.status(200).json({ message: 'Reporte de errores guardado exitosamente.' });

    } catch (error) {
        console.error('Error al guardar el reporte de errores:', error.message);
        res.status(500).json({ message: 'Error al guardar el reporte de errores.' });
    }
});

// ... (el resto de tus rutas: delete, usuarios, reporte-incidencias, download)

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});