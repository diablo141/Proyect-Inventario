const db = require('../config/db');

const ventasReport = async (req, res) => {
  try {
    const [ventasDiarias] = await db.query(
      `SELECT DATE(creado_en) AS fecha, SUM(total) AS total
       FROM ventas
       WHERE DATE(creado_en) = CURDATE()
       GROUP BY DATE(creado_en)`
    );

    const [ventasMensuales] = await db.query(
      `SELECT MONTH(creado_en) AS mes, YEAR(creado_en) AS anio, SUM(total) AS total
       FROM ventas
       WHERE YEAR(creado_en) = YEAR(CURDATE())
       GROUP BY YEAR(creado_en), MONTH(creado_en)
       ORDER BY mes ASC`
    );

    const [ventasAnuales] = await db.query(
      `SELECT YEAR(creado_en) AS anio, SUM(total) AS total
       FROM ventas
       GROUP BY YEAR(creado_en)
       ORDER BY anio ASC`
    );

    res.json({ ventasDiarias: ventasDiarias[0] || { fecha: null, total: 0 }, ventasMensuales, ventasAnuales });
  } catch (error) {
    console.error('Error al generar reporte de ventas:', error);
    res.status(500).json({ message: 'Error en reporte de ventas' });
  }
};

const productosReport = async (req, res) => {
  try {
    const [masVendidos] = await db.query(
      `SELECT p.id, p.nombre, SUM(d.cantidad) AS vendidas
       FROM detalle_ventas d
       JOIN productos p ON d.producto_id = p.id
       GROUP BY p.id
       ORDER BY vendidas DESC
       LIMIT 5`
    );

    const [menosVendidos] = await db.query(
      `SELECT p.id, p.nombre, COALESCE(SUM(d.cantidad), 0) AS vendidas
       FROM productos p
       LEFT JOIN detalle_ventas d ON p.id = d.producto_id
       GROUP BY p.id
       ORDER BY vendidas ASC
       LIMIT 5`
    );

    const [stockBajo] = await db.query(
      `SELECT p.id, p.nombre, p.stock, pr.nombre_proveedor AS proveedor, pr.correo, pr.telefono
       FROM productos p
       JOIN proveedores pr ON p.proveedor_id = pr.id_proveedor
       WHERE p.stock < 10
       ORDER BY p.stock ASC`
    );

    const [categoriaVentas] = await db.query(
      `SELECT c.nombre AS categoria, SUM(d.total) AS total_ventas
       FROM detalle_ventas d
       JOIN productos p ON d.producto_id = p.id
       JOIN categorias c ON p.categoria_id = c.id
       GROUP BY c.id
       ORDER BY total_ventas DESC`
    );

    res.json({ masVendidos, menosVendidos, stockBajo, categoriaVentas });
  } catch (error) {
    console.error('Error al generar reporte de productos:', error);
    res.status(500).json({ message: 'Error en reporte de productos' });
  }
};

const gananciasReport = async (req, res) => {
  try {
    const [resumen] = await db.query(
      `SELECT 
        SUM(total) AS ventas_totales,
        SUM(gana) AS ganancias_totales,
        SUM(CASE WHEN DATE(creado_en) = CURDATE() THEN total ELSE 0 END) AS ventas_dia,
        SUM(CASE WHEN MONTH(creado_en) = MONTH(CURDATE()) AND YEAR(creado_en) = YEAR(CURDATE()) THEN total ELSE 0 END) AS ventas_mes,
        SUM(CASE WHEN YEAR(creado_en) = YEAR(CURDATE()) THEN total ELSE 0 END) AS ventas_anio
      FROM ventas`
    );
    res.json(resumen[0] || {});
  } catch (error) {
    console.error('Error al generar reporte de ganancias:', error);
    res.status(500).json({ message: 'Error en reporte de ganancias' });
  }
};

module.exports = { ventasReport, productosReport, gananciasReport };
