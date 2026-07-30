const mongoose = require('mongoose');

// Esquema secundario para cada ítem dentro del préstamo
const itemPrestamoSchema = new mongoose.Schema({
  elemento: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Elemento', 
    required: true 
  },
  cantidad: { 
    type: Number, 
    required: true, 
    min: 1, 
    default: 1 
  }
}, { _id: false });

// Esquema principal de Préstamo
const prestamoSchema = new mongoose.Schema({
  elementos: {
    type: [itemPrestamoSchema],
    required: true,
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'El préstamo debe contener al menos un elemento'
    }
  },
  solicitado_por: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Usuario', 
    required: true 
  },
  estudiante_final: { 
    type: String, 
    trim: true,
    required: true 
  },
  dias_prestamo: { 
    type: Number, 
    default: 1 
  },
  fecha_solicitud: { 
    type: Date, 
    default: Date.now 
  },
  fecha_entrega: { 
    type: Date 
  },
  fecha_devolucion_esperada: { 
    type: Date 
  },
  fecha_devolucion_real: { 
    type: Date 
  },
  estado: { 
    type: String, 
    enum: ['Pendiente', 'Entregado', 'Devuelto', 'Rechazado'], 
    default: 'Pendiente' 
  },
  observaciones: { 
    type: String, 
    trim: true 
  }
}, { timestamps: true });

module.exports = mongoose.model('Prestamo', prestamoSchema);