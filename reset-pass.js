const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');

// Coloca aquí la misma cadena de MongoDB Atlas que usas en tu index.js
const MONGO_URI = 'mongodb+srv://...'; // <-- REEMPLAZA ESTO CON TU URI DE MONGO ATLAS

async function cambiarPassword() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Conectado a MongoDB Atlas...');

    // Nueva contraseña para pruebas
    const nuevaClave = 'Admin2026*';

    // Buscamos al usuario
    const usuario = await Usuario.findOne({ usuario: 'admin' });

    if (!usuario) {
      console.log('❌ No se encontró el usuario "admin".');
      return;
    }

    // Si tu modelo Usuario usa un pre-save hook para encriptar la contraseña:
    usuario.password = nuevaClave;
    await usuario.save();

    console.log('===========================================');
    console.log('✅ CONTRASEÑA ACTUALIZADA CON ÉXITO');
    console.log('Usuario: admin');
    console.log('Nueva Contraseña: Admin2026*');
    console.log('===========================================');

  } catch (error) {
    console.error('Error al actualizar:', error);
  } finally {
    await mongoose.connection.close();
    process.exit();
  }
}

cambiarPassword();