// models/Usuario.js
const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  usuario: { type: String, required: true, unique: true, trim: true }, // Ej: DOC-001 o Documento/Código
  nombre_completo: { type: String, required: true },
  password: { type: String, required: true },
  rol: { 
    type: String, 
    enum: ['Admin', 'Docente'], 
    default: 'Docente' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Usuario', usuarioSchema);