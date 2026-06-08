const pool = require('../config/db');

const ventasReport = async (req, res) => {
  try {
    const [ventasDiarias] = await pool.query(
      `SELECT DATE(creado_en) AS fecha, SUM(total) AS total
       FROM ventas
       WHERE DATE(creado_en) = CURDATE()
       GROUP BY DATE(creado_en)`
    );

    const [ventasMensuales] = await pool.query(
      `SELECT MONTH(creado_en) AS mes, YEAR(creado_en) AS anio, SUM(total) AS total
       FROM ventas
       WHERE YEAR(creado_en) = YEAR(CURDATE())
       GROUP BY YEAR(creado_en), MONTH(creado_en)
       ORDER BY mes ASC`
    );

    const [ventasAnuales] = await pool.query(
      `SELECT YEAR(creado_en) AS anio, SUM(total) AS total
       FROM ventas
       GROUP BY YEAR(creado_en)
       ORDER BY anio ASC`
    );

    res.json({ ventasDiarias: ventasDiarias[0] || { fecha: null, total: 0 }, ventasMensuales, ventasAnuales });
  } catch (error) {
    console.error('Error en reporte de ventas:', error);
    res.status(500).json({ message: 'Error interno en reporte de ventas' });
  }
};

const gananciasReport = async (req, res) => {
  try {
    const [resumen] = await pool.query(
      `SELECT
        SUM(total) AS ventas_totales,
        SUM(ganancia) AS ganancias_totales,
        SUM(CASE WHEN DATE(creado_en) = CURDATE() THEN ganancia ELSE 0 END) AS ganancias_dia,
        SUM(CASE WHEN MONTH(creado_en) = MONTH(CURDATE()) AND YEAR(creado_en) = YEAR(CURDATE()) THEN ganancia ELSE 0 END) AS ganancias_mes,
        SUM(CASE WHEN YEAR(creado_en) = YEAR(CURDATE()) THEN ganancia ELSE 0 END) AS ganancias_anio
       FROM ventas`
    );

    res.json(resumen[0] || {});
  } catch (error) {
    console.error('Error en reporte de ganancias:', error);
    res.status(500).json({ message: 'Error interno en reporte de ganancias' });
  }
};

const productosReport = async (req, res) => {
  try {
    const [masVendidos] = await pool.query(
      `SELECT p.id_producto AS id, p.nombre, SUM(d.cantidad) AS cantidad_vendida
       FROM detalle_ventas d
       JOIN productos p ON d.producto_id = p.id_producto
       GROUP BY p.id_producto
       ORDER BY cantidad_vendida DESC
       LIMIT 5`
    );

    const [stockBajo] = await pool.query(
      `SELECT p.id_producto AS id, p.nombre, p.stock, pr.nombre AS proveedor, pr.correo, pr.telefono
       FROM productos p
       JOIN proveedores pr ON p.proveedor_id = pr.id_proveedor
       WHERE p.stock < 10
       ORDER BY p.stock ASC`
    );

    const [productosMenosVendidos] = await pool.query(
      `SELECT p.id_producto AS id, p.nombre, COALESCE(SUM(d.cantidad), 0) AS cantidad_vendida
       FROM productos p
       LEFT JOIN detalle_ventas d ON p.id_producto = d.producto_id
       GROUP BY p.id_producto
       ORDER BY cantidad_vendida ASC
       LIMIT 5`
    );

    res.json({ masVendidos, stockBajo, productosMenosVendidos });
  } catch (error) {
    console.error('Error en reporte de productos:', error);
    res.status(500).json({ message: 'Error interno en reporte de productos' });
  }
};

module.exports = {
  ventasReport,
  gananciasReport,
  productosReport
};
