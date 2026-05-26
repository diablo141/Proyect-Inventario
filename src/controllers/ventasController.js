const db = require('../config/db');

const getVentas = async (req, res) => {
  try {
    const [ventas] = await db.query(
      `SELECT v.id, v.total, v.gana, v.creado_en, GROUP_CONCAT(CONCAT(d.cantidad, 'x ', p.nombre) SEPARATOR ', ') AS items
      FROM ventas v
      LEFT JOIN detalle_ventas d ON v.id = d.venta_id
      LEFT JOIN productos p ON d.producto_id = p.id
      GROUP BY v.id
      ORDER BY v.creado_en DESC`
    );

    const [totales] = await db.query(
      `SELECT
        SUM(total) AS ingresos_totales,
        SUM(gana) AS ganancias_totales,
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
  const connection = await db.getConnection();
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Debe enviar al menos un producto en la venta' });
    }

    await connection.beginTransaction();

    let totalVenta = 0;
    let totalGanancia = 0;

    for (const item of items) {
      const [productos] = await connection.query('SELECT id, precio, stock FROM productos WHERE id = ?', [item.producto_id]);
      const producto = productos[0];

      if (!producto) {
        throw new Error(`Producto con id ${item.producto_id} no existe`);
      }
      if (producto.stock < item.cantidad) {
        throw new Error(`Stock insuficiente para ${item.nombre}`);
      }

      const totalItem = parseFloat(producto.precio) * item.cantidad;
      totalVenta += totalItem;
      totalGanancia += totalItem;

      await connection.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [item.cantidad, item.producto_id]);
    }

    const [result] = await connection.query('INSERT INTO ventas (total, gana) VALUES (?, ?)', [totalVenta, totalGanancia]);
    const ventaId = result.insertId;

    for (const item of items) {
      const subtotal = parseFloat(item.precio_unitario) * item.cantidad;
      await connection.query(
        'INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, total) VALUES (?, ?, ?, ?, ?)',
        [ventaId, item.producto_id, item.cantidad, item.precio_unitario, subtotal]
      );
    }

    const [lowStock] = await connection.query('SELECT p.nombre, c.nombre AS categoria, pr.nombre AS proveedor, pr.contacto FROM productos p JOIN categorias c ON p.categoria_id = c.id JOIN proveedores pr ON p.proveedor_id = pr.id WHERE p.stock < 10 ORDER BY p.stock ASC');

    for (const item of lowStock) {
      await connection.query('INSERT INTO notificaciones (mensaje, tipo) VALUES (?, ?)', [`Producto ${item.nombre} tiene stock bajo y puede requerir reposición.`, 'warning']);
    }

    await connection.commit();

    res.status(201).json({ message: 'Venta registrada correctamente', ventaId, totalVenta });
  } catch (error) {
    await connection.rollback();
    console.error('Error al registrar venta:', error);
    res.status(500).json({ message: error.message || 'Error al registrar venta' });
  } finally {
    connection.release();
  }
};

const getEstadisticas = async (req, res) => {
  try {
    const [categoriaVentas] = await db.query(
      `SELECT c.nombre AS categoria, SUM(d.total) AS total_ventas
      FROM detalle_ventas d
      JOIN productos p ON d.producto_id = p.id
      JOIN categorias c ON p.categoria_id = c.id
      GROUP BY c.id
      ORDER BY total_ventas DESC`
    );

    const [productosMasVendidos] = await db.query(
      `SELECT p.nombre, SUM(d.cantidad) AS cantidad_vendida
      FROM detalle_ventas d
      JOIN productos p ON d.producto_id = p.id
      GROUP BY p.id
      ORDER BY cantidad_vendida DESC
      LIMIT 5`
    );

    res.json({ categoriaVentas, productosMasVendidos });
  } catch (error) {
    console.error('Error al obtener estadísticas de ventas:', error);
    res.status(500).json({ message: 'Error al obtener estadísticas de ventas' });
  }
};

module.exports = {
  getVentas,
  createVenta,
  getEstadisticas
};
