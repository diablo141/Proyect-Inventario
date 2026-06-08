const pool = require('../config/db');

const getVentas = async (req, res) => {
  try {
    const [ventas] = await pool.query(
      `SELECT
        v.id_venta AS id,
        v.total,
        v.ganancia,
        v.creado_en,
        GROUP_CONCAT(CONCAT(d.cantidad, 'x ', p.nombre) SEPARATOR ', ') AS items
      FROM ventas v
      LEFT JOIN detalle_ventas d ON v.id_venta = d.venta_id
      LEFT JOIN productos p ON d.producto_id = p.id_producto
      GROUP BY v.id_venta
      ORDER BY v.creado_en DESC`
    );

    const [totales] = await pool.query(
      `SELECT
        SUM(total) AS ingresos_totales,
        SUM(ganancia) AS ganancias_totales,
        SUM(CASE WHEN DATE(creado_en) = CURDATE() THEN total ELSE 0 END) AS ingreso_diario,
        SUM(CASE WHEN MONTH(creado_en) = MONTH(CURDATE()) AND YEAR(creado_en) = YEAR(CURDATE()) THEN total ELSE 0 END) AS ingreso_mensual
      FROM ventas`
    );

    res.json({ ventas, totales: totales[0] || {} });
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ message: 'Error al obtener ventas' });
  }
};

const createVenta = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Debe enviar al menos un producto para la venta' });
    }

    await connection.beginTransaction();

    let totalVenta = 0;
    let gananciaTotal = 0;

    for (const item of items) {
      const [rows] = await connection.query('SELECT id_producto, nombre, precio, stock FROM productos WHERE id_producto = ?', [item.producto_id]);
      const producto = rows[0];

      if (!producto) {
        throw new Error(`Producto con id ${item.producto_id} no existe`);
      }

      if (producto.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para ${producto.nombre}`);
      }

      const subtotal = parseFloat(item.precio_unitario || producto.precio) * item.cantidad;
      totalVenta += subtotal;
      gananciaTotal += subtotal;

      await connection.query('UPDATE productos SET stock = stock - ? WHERE id_producto = ?', [item.cantidad, item.producto_id]);
    }

    const [result] = await connection.query('INSERT INTO ventas (total, ganancia) VALUES (?, ?)', [totalVenta, gananciaTotal]);
    const ventaId = result.insertId;

    for (const item of items) {
      const precioUnitario = parseFloat(item.precio_unitario || item.precio || 0);
      const subtotal = precioUnitario * item.cantidad;
      await connection.query(
        'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, total) VALUES (?, ?, ?, ?, ?)',
        [ventaId, item.producto_id, item.cantidad, precioUnitario, subtotal]
      );
    }

    const [lowStock] = await connection.query(
      'SELECT id_producto, nombre, stock FROM productos WHERE stock < 10 ORDER BY stock ASC'
    );

    for (const producto of lowStock) {
      await connection.query(
        'INSERT INTO notificaciones (mensaje, tipo) VALUES (?, ?)',
        [`El producto "${producto.nombre}" tiene stock bajo (${producto.stock}).`, 'warning']
      );
    }

    await connection.commit();

    res.status(201).json({ message: 'Venta registrada correctamente', ventaId, totalVenta });
  } catch (error) {
    await connection.rollback();
    console.error('Error al registrar venta:', error);
    res.status(500).json({ message: error.message || 'Error interno al registrar venta' });
  } finally {
    connection.release();
  }
};

module.exports = {
  getVentas,
  createVenta
};
