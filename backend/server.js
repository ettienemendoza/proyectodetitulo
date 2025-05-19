// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // Añadimos Nodemailer
const { Readable } = require('stream'); //Para la descarga

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Conectar a MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Definir el esquema para los usuarios
const UsuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    contrasena: { type: String, required: true },
    cargo: { type: String, required: true },
    email: { type: String, required: true, unique: true } // Agregamos el campo email
});

// Método para cifrar la contraseña antes de guardarla
UsuarioSchema.pre('save', async function (next) {
    if (this.isModified('contrasena')) {
        const salt = await bcrypt.genSalt(10);
        this.contrasena = await bcrypt.hash(this.contrasena, salt);
    }
    next();
});

// Crear el modelo de Usuario
const Usuario = mongoose.model('Usuario', UsuarioSchema);

// Middleware de autenticación para verificar el JWT
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'Acceso denegado, token no proporcionado' });

    jwt.verify(token, 'tu_clave_secreta', (err, user) => {
        if (err) return res.status(403).json({ message: 'Token no válido' });
        req.user = user;
        next();
    });
};

// Definir el esquema para las incidencias
const IncidenceSchema = new mongoose.Schema({
    type: { type: String, required: true },
    description: { type: String, required: true },
    executiveName: { type: String, required: true },
    comments: {
        type: String,
        required: function () { return this.rol === 'supervisor'; } // Solo obligatorio para el supervisor
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

// Crear el modelo de Incidencia
const Incidence = mongoose.model('Incidence', IncidenceSchema);

// Esquemas para las nuevas colecciones
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
    createdAt: { type: Date, default: Date.now },
});
const ReporteSchema = new mongoose.Schema({ //Esquema para almacenar los reportes
    fechaGeneracion: { type: Date, required: true },
    totalIncidencias: { type: Number, required: true },
    resumenErrores: [{
        error: { type: String, required: true },
        cantidad: { type: Number, required: true }
    }],
    detalles: { type: Array, required: true } // Almacena los detalles del reporte
});

// Crear los modelos para las nuevas colecciones
const TipoError = mongoose.model('TipoError', TipoErrorSchema);
const TipoFalla = mongoose.model('TipoFalla', TipoFallaSchema);
const Estadisticas = mongoose.model('Estadisticas', EstadisticasSchema);
const Reporte = mongoose.model('Reporte', ReporteSchema); //Modelo para Reportes

// Ruta para obtener todas las incidencias
app.get('/api/incidencias', authenticateJWT, async (req, res) => {
    try {
        const incidencias = await Incidence.find();
        res.status(200).json(incidencias);
    } catch (error) {
        console.error('Error al obtener las incidencias:', error.message);
        res.status(500).json({ message: 'Error al obtener las incidencias', error: error.message });
    }
});

// Configuración de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail', // o tu servicio de correo
    auth: {
        user: 'tu_correo@gmail.com', // Coloca tu correo electrónico aquí
        pass: 'tu_contraseña' // Coloca tu contraseña aquí (¡NO RECOMENDABLE PARA PRODUCCIÓN!)
    }
});

// Ruta para resetear la contraseña
app.post('/api/reset-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await Usuario.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Correo electrónico no encontrado' });
        }

        // Enviar la contraseña no cifrada por correo electrónico (¡Solo para desarrollo!)
        const mailOptions = {
            from: 'tu_correo@gmail.com', // Coloca tu correo electrónico aquí
            to: email,
            subject: 'Tu Contraseña',
            text: `Tu contraseña es: ${user.contrasena}
             Por favor, cambia tu contraseña después de iniciar sesión.` //Agregar mensaje de cambiar contraseña
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error al enviar el correo electrónico:', error);
                return res.status(500).json({ message: 'Error al enviar el correo electrónico', error: error.message });
            } else {
                console.log('Correo electrónico enviado:', info.response);
                res.status(200).json({ message: 'Contraseña enviada al correo electrónico' });
            }
        });
    } catch (error) {
        console.error('Error al resetear la contraseña:', error.message);
        res.status(500).json({ message: 'Error al resetear la contraseña', error: error.message });
    }
});

// Ruta de login en el backend
app.post('/api/login', async (req, res) => {
    const { usuario, contrasena } = req.body;

    console.log('Datos recibidos del frontend:', { usuario, contrasena });

    try {
        const user = await Usuario.findOne({ nombre: usuario });

        console.log('Usuario encontrado en la base de datos:', user);

        if (!user) {
            return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }

        const validPassword = await bcrypt.compare(contrasena, user.contrasena);

        console.log('Resultado de la comparación de contraseñas:', validPassword);

        if (validPassword) {
            const token = jwt.sign({ _id: user._id, nombre: user.nombre, rol: user.cargo, email: user.email }, 'tu_clave_secreta', { expiresIn: '1h' }); // Incluimos el email en el token
            res.status(200).json({ message: 'Login exitoso', token, rol: user.cargo, email: user.email }); // Devolvemos el email
        } else {
            res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
    } catch (error) {
        console.error('Error al iniciar sesión:', error.message);
        res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
    }
});

// Ruta para obtener todas las incidencias (solo para supervisores)
app.get('/api/incidencias/supervisor', authenticateJWT, async (req, res) => {
    if (req.user.rol !== 'supervisor') {
        return res.status(403).json({ message: 'Acceso prohibido' });
    }
    try {
        const incidencias = await Incidence.find();
        res.status(200).json(incidencias);
    } catch (error) {
        console.error('Error al obtener las incidencias:', error.message);
        res.status(500).json({ message: 'Error al obtener las incidencias', error: error.message });
    }
});

// Ruta para obtener las incidencias de un ejecutivo específico
app.get('/api/incidencias/ejecutivo', authenticateJWT, async (req, res) => {
    try {
        const incidencias = await Incidence.find({ executiveName: req.user.nombre });
        res.status(200).json(incidencias);
    } catch (error) {
        console.error('Error al obtener las incidencias del ejecutivo:', error.message);
        res.status(500).json({ message: 'Error al obtener las incidencias del ejecutivo', error: error.message });
    }
});

// Ruta para registrar una incidencia
app.post('/api/incidencias', authenticateJWT, async (req, res) => {
    const { type, description, executiveName, comments } = req.body;

    // Si no es supervisor, asegurarse de que el campo de comentarios no se envíe
    if (req.user.rol !== 'supervisor' && comments) {
        return res.status(400).json({ message: 'Solo los supervisores pueden agregar comentarios' });
    }

    const newIncidence = new Incidence({
        type,
        description,
        executiveName,
        comments
    });

    try {
        await newIncidence.save();
        res.status(201).json({ message: 'Incidencia registrada exitosamente' });
    } catch (error) {
        console.error('Error al guardar la incidencia:', error.message);
        res.status(500).json({ message: 'Error al registrar la incidencia', error: error.message });
    }
});

// Ruta para obtener una incidencia por ID
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

// Ruta para actualizar una incidencia
app.put('/api/incidencias/:id', authenticateJWT, async (req, res) => {
    try {
        const incidencia = await Incidence.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!incidencia) {
            return res.status(404).json({ message: 'Incidencia no encontrada' });
        }
        res.status(200).json({ message: 'Incidencia actualizada exitosamente', incidencia });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la incidencia', error: error.message });
    }
});

// Ruta para eliminar una incidencia
app.delete('/api/incidencias/:id', authenticateJWT, async (req, res) => {
    try {
        const incidencia = await Incidence.findByIdAndDelete(req.params.id);
        if (!incidencia) {
            return res.status(404).json({ message: 'Incidencia no encontrada' });
        }
        res.status(200).json({ message: 'Incidencia eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la incidencia', error: error.message });
    }
});

// Ruta para agregar/actualizar comentarios
app.put('/api/incidencias/:id', authenticateJWT, async (req, res) => {
    try {
        const incidencia = await Incidence.findByIdAndUpdate(
            req.params.id,
            { comments: req.body.comments }, // Actualiza solo el campo de comentarios
            { new: true }
        );
        if (!incidencia) {
            return res.status(404).json({ message: 'Incidencia no encontrada' });
        }
        res.status(200).json({ message: 'Comentario agregado/actualizado', incidencia });
    } catch (error) {
        console.error("Error al agregar/actualizar comentario:", error);
        res.status(500).json({ message: 'Error al agregar/actualizar comentario', error: error.message });
    }
});

// Ruta para obtener todos los usuarios (solo para depuración, ¡protégela en producción!)
app.get('/api/usuarios', async (req, res) => {
    try {
        const usuarios = await Usuario.find();
        res.status(200).json(usuarios);
    } catch (error) {
        console.error('Error al obtener los usuarios:', error.message);
        res.status(500).json({ message: 'Error al obtener los usuarios', error: error.message });
    }
});

// Ruta para registrar un nuevo usuario
app.post('/api/usuarios', async (req, res) => {
    const { nombre, contrasena, cargo, email } = req.body; // Incluimos el email

    try {
        const nuevoUsuario = new Usuario({ nombre, contrasena, cargo, email }); // Incluimos el email
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

// Función para generar el resumen del reporte
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
            detalles: incidencias // Guardamos los detalles
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
        let csvContent = "Tipo de Incidencia,Descripción,Nombre Ejecutivo,Fecha,Hora,Comentarios\n";
        incidencias.forEach(incidencia => {
            const row = [
                incidencia.type,
                incidencia.description.replace(/,/g, ""),
                incidencia.executiveName,
                new Date(incidencia.createdAt).toLocaleDateString(),
                new Date(incidencia.updatedAt).toLocaleTimeString(),
                incidencia.comments ? incidencia.comments.replace(/,/g, "") : "",
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