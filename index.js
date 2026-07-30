// index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const ExcelJS = require('exceljs');


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Servir automáticamente todos los archivos estáticos de la carpeta "public"
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  '/uploads',
  express.static(path.join(__dirname, 'uploads'))
);

app.get('/api/descargar-formato-activos', async (req, res) => {

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Formato Activos');

  worksheet.columns = [
    { header: 'Colegio', key: 'colegio', width: 20 },
    { header: 'Código de Material', key: 'codigo', width: 20 },
    { header: 'Descripción', key: 'descripcion', width: 30 },
    { header: 'Detalle del Material', key: 'detalle', width: 25 },
    { header: 'Especificaciones, (Medidas, colores, materiales, marca, etc)', key: 'especificaciones', width: 50 },
    { header: 'Link de referencia', key: 'link', width: 35 }
  ];

  worksheet.addRow({
    colegio: 'EL PRADO',
    codigo: '',
    descripcion: 'ANTENA PARA RADIO TELEFONO',
    detalle: 'PLÁSTICO/METAL FLEXIBLE',
    especificaciones: 'FRECUENCIA VHF/UHF, CONECTOR SMA-HEMBRA O BNC, COLOR NEGRO TELEFONO 450.',
    link: 'https://www.mercadolibre.com.co'
  });

  const encabezado = worksheet.getRow(1);

  encabezado.height = 40;

  encabezado.eachCell(cell => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: '08244D' }
    };

    cell.font = {
      color: { argb: 'FFFFFF' },
      bold: true,
      size: 11
    };

    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };

    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  const fila2 = worksheet.getRow(2);

  fila2.height = 80;

  fila2.eachCell(cell => {

    cell.alignment = {
      vertical: 'middle',
      horizontal: 'center',
      wrapText: true
    };

    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };

  });

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );

  res.setHeader(
    'Content-Disposition',
    'attachment; filename=Plantilla_Solicitud_Activos_Operacion.xlsx'
  );

  await workbook.xlsx.write(res);
  res.end();
});

// Conexión a MongoDB Atlas
const URI = "mongodb+srv://pcz7910_db_user:David0820@cluster0.rjgwc4i.mongodb.net/inventario_robotica?retryWrites=true&w=majority";

mongoose.connect(URI)
  .then(() => console.log('========================================\n ¡CONEXIÓN EXITOSA A MONGODB ATLAS! \n========================================'))
  .catch(err => console.error('Error de conexión:', err));

// Rutas API
app.use('/api/elementos', require('./routes/elementos'));
app.use('/api/usuarios', require('./routes/usuarios'));
app.use('/api/prestamos', require('./routes/prestamos'));
app.use('/api/activos', require('./routes/activos'));

// Ruta por defecto para enviar index.html si entra a la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PUERTO = 3000;
app.listen(PUERTO, () => {
  console.log(`Servidor corriendo en http://localhost:${PUERTO}`);
});