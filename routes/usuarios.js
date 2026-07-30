const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');

// POST: /api/usuarios/login
router.post('/login', async (req, res) => {
  try {
    const { usuario, password } = req.body;

    // Buscar coincidencia por usuario, cédula o código
    const user = await Usuario.findOne({
      $or: [
        { usuario: usuario },
        { cedula: usuario },
        { codigo: usuario },
        { username: usuario }
      ]
    });

    if (!user) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado' });
    }

    if (user.password !== password) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta' });
    }

    res.json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: {
        _id: user._id,
        usuario: user.usuario || user.cedula || user.codigo,
        nombre_completo: user.nombre_completo,
        rol: user.rol
      }
    });

  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// POST: /api/usuarios (AQUÍ SE AGREGA LA RUTA PARA CREAR EL DOCENTE)
router.post('/', async (req, res) => {
  try {
    const nuevoUsuario = new Usuario(req.body);
    await nuevoUsuario.save();

    res.status(201).json({ 
      mensaje: 'Docente creado con éxito',
      usuario: nuevoUsuario 
    });

  } catch (error) {
    console.error('Error detallado al crear el docente:', error);
    
    // Control por si la cédula o usuario ya existen en la base de datos
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'El usuario o número de identificación ya se encuentra registrado.' });
    }

    res.status(500).json({ mensaje: 'Error al crear el docente.', error: error.message });
  }
});

module.exports = router;