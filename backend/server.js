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

    try {
        await newIncidence.save();
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

app.get('/api/usuarios', authenticateJWT, async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al obtener los usuarios:', error.message);
        res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
    }
});

// Ruta para registrar un nuevo usuario
app.post('/api/usuarios', authenticateJWT, async (req, res) => {
    const { nombre, contrasena, cargo, email } = req.body;

    try {
        const nuevoUsuario = new Usuario({ nombre, contrasena, cargo, email });
        await nuevoUsuario.save();
        res.status(201).json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        console.error('Error al crear el usuario:', error.message);
        res.status(500).json({ message: 'Error al crear el usuario', error: error.message });
    }
});

// Ruta para obtener un usuario por ID (si es necesario)
app.get('/api/usuarios/:id', authenticateJWT, async (req, res) => {
    try {
        const usuario = await Usuario.findById(req.params.id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json(usuario);
    } catch (error) {
        console.error('Error al obtener el usuario:', error.message);
        res.status(500).json({ message: 'Error al obtener el usuario', error: error.message });
    }
});

// Ruta para actualizar un usuario
app.put('/api/usuarios/:id', authenticateJWT, async (req, res) => {
    try {
        const usuario = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json({ message: 'Usuario actualizado exitosamente', usuario });
    } catch (error) {
        console.error('Error al actualizar el usuario:', error.message);
        res.status(500).json({ message: 'Error al actualizar el usuario', error: error.message });
    }
});

// Ruta para eliminar un usuario
app.delete('/api/usuarios/:id', authenticateJWT, async (req, res) => {
    try {
        const usuario = await Usuario.findByIdAndDelete(req.params.id);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.status(200).json({ message: 'Usuario eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar el usuario:', error.message);
        res.status(500).json({ message: 'Error al eliminar el usuario', error: error.message });
    }
});

//uta para eliminar la solicitud de restablecimiento
app.delete('/api/reset-requests/:id', authenticateJWT, async (req, res) => {
    if (req.user.rol !== 'supervisor') {
        return res.status(403).json({ message: 'Acceso prohibido' });
    }
    try {
        const requestId = req.params.id;
        const result = await TipoError.findByIdAndDelete(requestId);
        if (result) {
            res.status(200).json({ message: 'Solicitud de restablecimiento marcada como atendida.' });
        } else {
            res.status(404).json({ message: 'Solicitud de restablecimiento no encontrada.' });
        }
    } catch (error) {
        console.error('Error al marcar la solicitud como atendida:', error.message);
        res.status(500).json({ message: 'Error al marcar la solicitud como atendida.' });
    }
});

// Ruta para obtener el reporte de incidencias
app.get('/api/reporte-incidencias', authenticateJWT, async (req, res) => {
    const { tipoError, fechaInicio, fechaFin } = req.query;

    console.log('Parámetros de la consulta recibidos:', req.query);

    let query = {};

    if (tipoError) {
        query.type = tipoError;
    }

    if (fechaInicio && fechaFin) {
        query.createdAt = {
            $gte: new Date(fechaInicio),
            $lte: new Date(fechaFin),
        };
    } else if (fechaInicio) {
        query.createdAt = { $gte: new Date(fechaInicio) };
    } else if (fechaFin) {
        query.createdAt = { $lte: new Date(fechaFin) };
    }

    console.log('Consulta MongoDB construida:', query);

    try {
        const incidencias = await Incidence.find(query);
        console.log('Incidencias encontradas:', incidencias);

        // Generar el resumen
        const resumen = generarResumen(incidencias);

        // Almacenar el reporte en la nueva colección
        const nuevoReporte = new Reporte({
            fechaGeneracion: new Date(),
            totalIncidencias: incidencias.length,
            resumenErrores: Object.entries(incidencias.reduce((acc, curr) => {
                acc[curr.type] = (acc[curr.type] || 0) + 1;
                return acc;
            }, {})).map(([error, cantidad]) => ({ error, cantidad })),
            detalles: incidencias
        });
        await nuevoReporte.save();

        res.status(200).json({ incidencias, resumen }); // Enviar el resumen en la respuesta
    } catch (error) {
        console.error('Error al obtener el reporte de incidencias:', error.message);
        res.status(500).json({ message: 'Error al obtener el reporte', error: error.message });
    }
});

app.get('/api/reporte-incidencias/download', authenticateJWT, async (req, res) => {
    const { tipoError, fechaInicio, fechaFin } = req.query;

    let query = {};

    if (tipoError) {
        query.type = tipoError;
    }

    if (fechaInicio && fechaFin) {
        query.createdAt = {
            $gte: new Date(fechaInicio),
            $lte: new Date(fechaFin),
        };
    } else if (fechaInicio) {
        query.createdAt = { $gte: new Date(fechaInicio) };
    } else if (fechaFin) {
        query.createdAt = { $lte: new Date(fechaFin) };
    }

    try {
        const incidencias = await Incidence.find(query);

        // Generar el CSV
        let csvContent = "Tipo de Incidencia,Descripción,Nombre Ejecutivo,Fecha,Hora,Estado\n";
        incidencias.forEach(incidencia => {
            const row = [
                incidencia.type,
                incidencia.description.replace(/,/g, ""),
                incidencia.executiveName,
                new Date(incidencia.createdAt).toLocaleDateString(),
                new Date(incidencia.updatedAt).toLocaleTimeString(),
                incidencia.estado ? incidencia.estado.replace(/,/g, "") : "",
            ];
            csvContent += row.join(",") + "\n";
        });

        // Enviar el CSV como descarga
        const buffer = Buffer.from(csvContent, 'utf-8');
        const stream = new Readable();
        stream.push(buffer);
        stream.push(null);

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_incidencias.csv');
        stream.pipe(res);

    } catch (error) {
        console.error('Error al generar el reporte CSV:', error.message);
        res.status(500).json({ message: 'Error al generar el reporte CSV', error: error.message });
    }
});

// Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

function generarResumen(data) {
    if (!data || data.length === 0) {
        return 'No se encontraron incidencias en el período seleccionado.';
    }

    const conteoPorTipo = {};
    let totalIncidencias = 0;

    data.forEach(incidencia => {
        const tipo = incidencia.type;
        conteoPorTipo[tipo] = (conteoPorTipo[tipo] || 0) + 1;
        totalIncidencias++;
    });

    let resumen = `Se encontraron ${totalIncidencias} incidencias en el período seleccionado. Detalles: `;
    for (const tipo in conteoPorTipo) {
        resumen += `${tipo}: ${conteoPorTipo[tipo]}, `;
    }
    return resumen.slice(0, -2) + '.';
}


// Ruta para editar una incidencia (solo para el ejecutivo que la creó)
app.put('/api/incidencias/:id', authenticateJWT, async (req, res) => {
    try {
        const { type, description, estado, otroTipoError } = req.body;
        const executiveName = req.user.nombre;
        const incidencia = await Incidence.findById(req.params.id);

        if (!incidencia) {
            return res.status(404).json({ message: 'Incidencia no encontrada' });
        }

        // Permitir editar solo al supervisor o al ejecutivo que creó la incidencia
        if (req.user.rol === 'supervisor' || incidencia.executiveName === executiveName) {
            incidencia.type = otroTipoError || type || incidencia.type;
            incidencia.description = description || incidencia.description;
            incidencia.estado = estado || incidencia.estado;
            incidencia.updatedAt = Date.now();
            await incidencia.save();
            return res.status(200).json({ message: 'Incidencia actualizada exitosamente', incidencia });
        } else {
            return res.status(403).json({ message: 'No tienes permiso para editar esta incidencia' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la incidencia', error: error.message });
    }
});



// Ruta para obtener el CONTEO de las solicitudes de restablecimiento (solo para supervisores)
app.get('/api/reset-requests/count', authenticateJWT, async (req, res) => {
    if (req.user.rol !== 'supervisor') {
        return res.status(403).json({ message: 'Acceso prohibido' });
    }
    try {
        const count = await TipoError.countDocuments({ tipoerror: 'solicitud_reset_password' });
        res.status(200).json({ count });
    } catch (error) {
        console.error('Error al obtener el conteo de solicitudes de reset:', error.message);
        res.status(500).json({ message: 'Error al obtener el conteo de solicitudes de reset.' });
    }
});

// server.js

// Ruta para crear un nuevo tipo de falla
app.post('/api/tipos-fallas', authenticateJWT, async (req, res) => {
    if (req.user.rol !== 'supervisor') {
        return res.status(403).json({ message: 'Acceso prohibido' });
    }
    const { tipodefalla } = req.body;
    try {
        const nuevoTipoFalla = new TipoFalla({
            tipodefalla,
            supervisor_ud: req.user.nombre,
            createdAt: new Date()
        });
        await nuevoTipoFalla.save();
        res.status(201).json({ message: 'Tipo de falla creado exitosamente', nuevoTipoFalla });
    } catch (error) {
        console.error('Error al crear el tipo de falla:', error.message);
        res.status(500).json({ message: 'Error al crear el tipo de falla' });
    }
});

// Ruta para obtener todos los tipos de fallas
app.get('/api/tipos-fallas', authenticateJWT, async (req, res) => {
    try {
        const tiposFallas = await TipoFalla.find();
        res.status(200).json(tiposFallas);
    } catch (error) {
        console.error('Error al obtener los tipos de fallas:', error.message);
        res.status(500).json({ message: 'Error al obtener los tipos de fallas' });
    }
});






//guarda la solicitud de restablecimiento de contraseña
app.post('/api/notify-supervisor-reset', async (req, res) => {
    const { userInfo } = req.body;

    try {
        const newForgotPasswordRequest = new TipoError({
            tipoerror: 'solicitud_reset_password',
            supervisor_ud: 'pendiente',
            descripcion: `Usuario/Correo: ${userInfo}`, // <---- Asegúrate de que esto esté así
            createdAt: new Date()
        });

        await newForgotPasswordRequest.save();
        res.status(200).json({ message: 'Se ha registrado tu solicitud. Tu supervisor se contactara contigo.' });

    } catch (error) {
        // ...
    }
});

// Ruta para obtener las solicitudes de restablecimiento (solo para supervisores - ¡protégela con authenticateJWT!)
app.get('/api/reset-requests', authenticateJWT, async (req, res) => {
    if (req.user.rol !== 'supervisor') {
        return res.status(403).json({ message: 'Acceso prohibido' });
    }
    try {
        const resetRequests = await TipoError.find({ tipoerror: 'solicitud_reset_password' });
        res.status(200).json(resetRequests);
    } catch (error) {
        console.error('Error al obtener las solicitudes de reset:', error.message);
        res.status(500).json({ message: 'Error al obtener las solicitudes de reset.' });
    }
});

// ... (el resto de tus rutas)

// Ruta para eliminar una incidencia (solo para el ejecutivo que la creó)
app.delete('/api/incidencias/:id', authenticateJWT, async (req, res) => {
    try {
        const executiveName = req.user.nombre;
        const incidencia = await Incidence.findById(req.params.id);

        if (!incidencia) {
            return res.status(404).json({ message: 'Incidencia no encontrada' });
        }

        // Permitir eliminar solo al supervisor o al ejecutivo que creó la incidencia
        if (req.user.rol === 'supervisor' || incidencia.executiveName === executiveName) {
            await Incidence.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: 'Incidencia eliminada exitosamente' });
        } else {
            return res.status(403).json({ message: 'No tienes permiso para eliminar esta incidencia' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la incidencia', error: error.message });
    }
});

