


const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const jwt = require('jsonwebtoken');

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
  cargo: { type: String, required: true }
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
    
    
      const token = jwt.sign({ _id: user._id, nombre: user.nombre, rol: user.cargo }, 'tu_clave_secreta', { expiresIn: '1h' });
      res.status(200).json({ message: 'Login exitoso', token, rol: user.cargo });
    } else {
      res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error.message);
    res.status(500).json({ message: 'Error al iniciar sesión', error: error.message });
  }
});


// Ruta para obtener todas las incidencias (solo para supervisores)




// Ruta para obtener las incidencias de un ejecutivo específico

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

// Ruta para obtener las incidencias de un ejecutivo específico

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
  const { nombre, contrasena, cargo } = req.body;

  try {
    const nuevoUsuario = new Usuario({ nombre, contrasena, cargo });
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

//graficos
app.get('/api/reporte-incidencias', authenticateJWT, async (req, res) => {
  const { tipoError, fechaInicio, fechaFin } = req.query;

  console.log('Parámetros de la consulta recibidos:', req.query); // <---- AGREGAR ESTE LOG

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

  console.log('Consulta MongoDB construida:', query); // <---- AGREGAR ESTE LOG

  try {
    const incidencias = await Incidence.find(query);
    console.log('Incidencias encontradas:', incidencias); // <---- AGREGAR ESTE LOG
    res.status(200).json(incidencias);
  } catch (error) {
    console.error('Error al obtener el reporte de incidencias:', error.message);
    res.status(500).json({ message: 'Error al obtener el reporte', error: error.message });
  }
});



// Iniciar el servidor
app.listen(3000, () => {
  console.log('Servidor corriendo en http://localhost:3000');
});
