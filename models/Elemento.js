// models/Elemento.js
const mongoose = require('mongoose');

const elementoSchema = new mongoose.Schema({
  codigo_placa: { type: String, required: true, unique: true, trim: true },
  nombre: { type: String, required: true, trim: true },
  categoria: { 
    type: String, 
    enum: ['Microcontroladores', 'Sensores', 'Actuadores/Motores', 'Kits de Robótica', 'Herramientas', 'Otros'],
    default: 'Otros'
  },
  cantidad_total: { type: Number, required: true, min: 0, default: 1 },
  cantidad_disponible: { type: Number, required: true, min: 0, default: 1 },
  ubicacion: { type: String, trim: true, default: 'Depósito Principal' },
  estado_conservacion: { 
    type: String, 
    enum: ['Excelente', 'Bueno', 'Regular', 'Dañado/En reparación'], 
    default: 'Bueno' 
  }
}, { timestamps: true });

module.exports = mongoose.model('Elemento', elementoSchema);