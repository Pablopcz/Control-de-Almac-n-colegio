const mongoose = require('mongoose');

const SolicitudActivoSchema = new mongoose.Schema({

    solicitado_por: String,

    archivo: String,

    estado: {
        type: String,
        default: 'Pendiente'
    }

},{
    timestamps: true
});

module.exports =
mongoose.model(
    'SolicitudActivo',
    SolicitudActivoSchema
);