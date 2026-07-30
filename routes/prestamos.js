const express = require('express');
const router = express.Router();
const Prestamo = require('../models/Prestamo');
const Elemento = require('../models/Elemento');

// ==========================================
// 1. OBTENER TODOS LOS PRÉSTAMOS (CON NOMBRE DEL DOCENTE)
// ==========================================
router.get('/', async (req, res) => {
  try {
    const prestamos = await Prestamo.find()
      .populate('solicitado_por')
      .sort({ createdAt: -1 });
      
    res.json(prestamos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener préstamos', error: error.message });
  }
});

// ==========================================
// 2. CREAR NUEVA SOLICITUD (VALIDACIÓN DE STOCK BLINDADA)
// ==========================================
router.post('/', async (req, res) => {
  try {
    const { solicitado_por, estudiante_final, dias_prestamo, elementos, observaciones } = req.body;

    if (!elementos || !Array.isArray(elementos) || elementos.length === 0) {
      return res.status(400).json({ mensaje: 'La solicitud debe incluir al menos un elemento.' });
    }

    const listaElementos = elementos.map(item => ({
      elemento: item.elemento,
      cantidad: Number(item.cantidad) || 1
    }));

    for (const item of listaElementos) {
      const el = await Elemento.findById(item.elemento);
      if (!el) {
        return res.status(404).json({ mensaje: `Elemento no encontrado ID: ${item.elemento}` });
      }

      // Conversión estricta a número para evitar fallos de validación
      const stockDisponible = Number(el.cantidad_disponible ?? 0);
      const cantidadPedida = Number(item.cantidad);

      if (stockDisponible < cantidadPedida) {
        return res.status(400).json({ 
          mensaje: `Stock insuficiente para "${el.nombre || 'Elemento'}". Requeridos: ${cantidadPedida}, Disponibles: ${stockDisponible}` 
        });
      }
    }

    for (const item of listaElementos) {
      await Elemento.findByIdAndUpdate(item.elemento, {
        $inc: { cantidad_disponible: -item.cantidad }
      });
    }

    const fecha_devolucion_esperada = new Date();
    fecha_devolucion_esperada.setDate(fecha_devolucion_esperada.getDate() + Number(dias_prestamo || 1));

    const nuevoPrestamo = new Prestamo({
      solicitado_por,
      estudiante_final,
      dias_prestamo: Number(dias_prestamo) || 1,
      fecha_devolucion_esperada,
      elementos: listaElementos,
      observaciones,
      estado: 'Pendiente'
    });

    await nuevoPrestamo.save();

    res.status(201).json({ 
      mensaje: 'Solicitud creada con éxito y stock descontado', 
      prestamo: nuevoPrestamo 
    });
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al procesar la solicitud', error: error.message });
  }
});

// ==========================================
// 3. AUTORIZAR Y ENTREGAR
// ==========================================
router.put('/:id/entregar', async (req, res) => {
  try {
    const prestamo = await Prestamo.findById(req.params.id);
    if (!prestamo) return res.status(404).json({ mensaje: 'Préstamo no encontrado' });

    prestamo.estado = 'Entregado';
    prestamo.fecha_entrega = new Date();
    await prestamo.save();

    res.json({ mensaje: 'Préstamo marcado como entregado.', prestamo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar entrega', error: error.message });
  }
});

// ==========================================
// 4. RECIBIR DEVOLUCIÓN (RECOMPONE STOCK)
// ==========================================
router.put('/:id/devolver', async (req, res) => {
  try {
    const prestamo = await Prestamo.findById(req.params.id);
    if (!prestamo) return res.status(404).json({ mensaje: 'Préstamo no encontrado' });

    const itemsAProcesar = (prestamo.elementos && prestamo.elementos.length > 0) 
      ? prestamo.elementos 
      : (prestamo.elemento ? [{ elemento: prestamo.elemento, cantidad: prestamo.cantidad_solicitada || 1 }] : []);

    for (const item of itemsAProcesar) {
      await Elemento.findByIdAndUpdate(item.elemento, {
        $inc: { cantidad_disponible: item.cantidad }
      });
    }

    prestamo.estado = 'Devuelto';
    prestamo.fecha_devolucion_real = new Date();
    await prestamo.save();

    res.json({ mensaje: 'Devolución registrada correctamente y stock reabastecido.', prestamo });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al registrar devolución', error: error.message });
  }
});

module.exports = router;