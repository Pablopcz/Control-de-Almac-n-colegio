const express = require('express');
const router = express.Router();
const Elemento = require('../models/Elemento');

// GET: Consultar todos los elementos
router.get('/', async (req, res) => {
  try {
    const elementos = await Elemento.find();
    res.json(elementos);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// GET: Consultar un solo elemento por su ID
router.get('/:id', async (req, res) => {
  try {
    const elemento = await Elemento.findById(req.params.id);
    if (!elemento) return res.status(404).json({ mensaje: 'Elemento no encontrado' });
    res.json(elemento);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});

// POST: Crear un nuevo elemento individual
router.post('/', async (req, res) => {
  try {
    const nuevoElemento = new Elemento(req.body);
    const guardado = await nuevoElemento.save();
    res.status(201).json(guardado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});

// 📌 RUTA ACTUALIZADA: POST para Carga Masiva Acumulativa desde Excel
router.post('/masivo', async (req, res) => {
  try {
    const elementosArray = req.body; // Recibe el array de objetos procesados por SheetJS

    if (!Array.isArray(elementosArray) || elementosArray.length === 0) {
      return res.status(400).json({ mensaje: 'El archivo Excel está vacío o no tiene un formato válido.' });
    }

    let registrosProcesados = 0;

    // Recorrer cada fila del Excel para actualizar acumulando o insertar si es nuevo
    for (const item of elementosArray) {
      const codigoPlaca = String(item['Código / Placa'] || item.codigo_placa || '').trim();
      
      if (!codigoPlaca) continue; // Si la fila no tiene código, se omite

      const nombre = String(item['Nombre del Elemento'] || item.nombre || '').trim();
      const categoria = String(item['Categoría'] || item.categoria || 'Otros').trim();
      const ubicacion = String(item['Ubicación Física'] || item.ubicacion || 'N/A').trim();
      
      // Cantidades que vienen en el Excel para sumar al inventario existente
      const cantTotalAportar = Number(item['Cantidad Total'] || item.cantidad_total || 0);
      const cantDisponibleAportar = Number(item['Cantidad Disponible'] || item.cantidad_disponible || cantTotalAportar);

      // Buscar por código de placa: si existe suma con $inc, si no existe lo crea con upsert: true
      await Elemento.findOneAndUpdate(
        { codigo_placa: codigoPlaca },
        {
          $set: {
            nombre: nombre,
            categoria: categoria,
            ubicacion: ubicacion
          },
          $inc: {
            cantidad_total: cantTotalAportar,
            cantidad_disponible: cantDisponibleAportar
          },
          $setOnInsert: {
            estado_conservacion: 'Bueno'
          }
        },
        { upsert: true, new: true, runValidators: true }
      );

      registrosProcesados++;
    }

    res.status(201).json({
      mensaje: `¡Carga masiva exitosa! Se actualizaron y sumaron ${registrosProcesados} elementos en el almacén.`
    });

  } catch (error) {
    console.error("❌ ERROR DETALLADO EN MONGO (ACUMULATIVO):", error); 
    
    res.status(400).json({
      mensaje: 'Error durante la actualización masiva del inventario.',
      error: error.message
    });
  }
});

// PUT: Actualizar un elemento
router.put('/:id', async (req, res) => {
  try {
    const elementoActualizado = await Elemento.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!elementoActualizado) return res.status(404).json({ mensaje: 'Elemento no encontrado' });
    res.json(elementoActualizado);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
});

// DELETE: Eliminar un elemento
router.delete('/:id', async (req, res) => {
  try {
    const elementoEliminado = await Elemento.findByIdAndDelete(req.params.id);
    if (!elementoEliminado) return res.status(404).json({ mensaje: 'Elemento no encontrado' });
    res.json({ mensaje: 'Elemento eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
});
// 📌 RUTA TEMPORAL DE CORRECCIÓN: Recalcula y limpia los datos desconfigurados
router.get('/recalcular/inventario', async (req, res) => {
  try {
    const elementos = await Elemento.find();
    let contadorCorregidos = 0;

    for (let el of elementos) {
      // Supongamos que tienes una propiedad o lógica de prestados, 
      // o ajustamos el disponible asegurando que no supere el total ni sea negativo.
      // Fórmula lógica: Si el disponible quedó mayor que el total, lo igualamos al total o ajustamos.
      
      const total = Number(el.cantidad_total) || 0;
      let disponible = Number(el.cantidad_disponible) || 0;

      // Si por el error anterior el disponible es mayor que el total, lo corregimos temporalmente
      if (disponible > total) {
        disponible = total; // O puedes ajustarlo según lo que necesites
      }

      el.cantidad_disponible = disponible;
      await el.save();
      contadorCorregidos++;
    }

    res.json({
      mensaje: `¡Limpieza exitosa! Se recalcularon y corrigieron ${contadorCorregidos} elementos en la base de datos.`
    });

  } catch (error) {
    console.error("❌ ERROR AL RECALCULAR:", error);
    res.status(500).json({ mensaje: 'Error al recalcular el inventario', error: error.message });
  }
});

module.exports = router;