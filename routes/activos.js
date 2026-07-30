const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const SolicitudActivo = require('../models/SolicitudActivo');

const storage = multer.diskStorage({
  

    destination: function (req, file, cb) {
        cb(null, 'uploads/activos/');
    },

    filename: function (req, file, cb) {

        const nombre =
            Date.now() + '-' + file.originalname;

        cb(null, nombre);

    }

});

const upload = multer({ storage });


// SUBIR ARCHIVO
router.post(
    '/',
    upload.single('archivo'),
    async (req, res) => {

        try {

            const nuevaSolicitud =
                new SolicitudActivo({

                    solicitado_por: req.body.docente,

                    archivo: req.file.filename,

                    estado: 'Pendiente'

                });

            await nuevaSolicitud.save();

            res.json({
                mensaje: 'Archivo almacenado correctamente'
            });

        } catch (error) {

            console.error(error);

            res.status(500).json({
                mensaje: 'Error al guardar archivo'
            });

        }

    }
);


// LISTAR SOLICITUDES
router.get('/', async (req, res) => {

    const solicitudes =
        await SolicitudActivo.find()
        .sort({ createdAt: -1 });

    res.json(solicitudes);

});
// ELIMINAR SOLICITUD
router.delete('/:id', async (req, res) => {

    try {

        const solicitud =
            await SolicitudActivo.findById(
                req.params.id
            );

        if (!solicitud) {

            return res.status(404).json({
                mensaje: 'Solicitud no encontrada'
            });

        }

        const rutaArchivo =
            `uploads/activos/${solicitud.archivo}`;

        if (fs.existsSync(rutaArchivo)) {

            fs.unlinkSync(rutaArchivo);

        }

        await SolicitudActivo.findByIdAndDelete(
            req.params.id
        );

        res.json({
            mensaje: 'Solicitud eliminada'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al eliminar'
        });

    }

});


module.exports = router;