// seed.js
const mongoose = require('mongoose');
const Usuario = require('./models/Usuario');

const URI = "mongodb+srv://pcz7910_db_user:David0820@cluster0.rjgwc4i.mongodb.net/inventario_robotica?retryWrites=true&w=majority";

async function crearUsuariosIniciales() {
  try {
    await mongoose.connect(URI);
    console.log("Conectado a la base de datos...");

    // 1. Borrar todos los usuarios antiguos
    await Usuario.deleteMany({});
    
    // 2. Eliminar índices viejos conflicto (como documento_1 o email_1)
    try {
      await Usuario.collection.dropIndexes();
      console.log("Índices antiguos eliminados correctamente.");
    } catch (e) {
      console.log("No había índices antiguos por eliminar.");
    }

    // 3. Crear Administrador
    const admin = new Usuario({
      usuario: "admin",
      nombre_completo: "Pablo Zúñiga (Administrador)",
      password: "Admin2026",
      rol: "Admin"
    });
    await admin.save();
    console.log("-> Administrador creado: usuario 'admin' | contraseña 'Admin2026'");

    // 4. Crear Docente de prueba
    const docente = new Usuario({
      usuario: "123456789",
      nombre_completo: "Carlos Pérez",
      password: "docente123",
      rol: "Docente"
    });
    await docente.save();
    console.log("-> Docente creado: usuario '123456789' | contraseña 'docente123'");

    console.log("========================================");
    console.log("¡USUARIOS CREADOS CON ÉXITO!");
    console.log("========================================");

  } catch (error) {
    console.error("Error al registrar usuarios:", error.message);
  } finally {
    await mongoose.connection.close();
  }
}

crearUsuariosIniciales();