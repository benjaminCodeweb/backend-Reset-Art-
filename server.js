import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();

const PORT = 3000;

app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
  host: 'yamabiko.proxy.rlwy.net',
  user: 'root',
  password: 'gpvUcKzmCyRaEHPbyzBUmOGZnFPwJDZq',
  database: 'railway',
  port: 12209
});

/// ✅ Obtener reservas de un barbero específico
app.get('/reservas', async (req, res) => {
 
  try {
    const connection = await pool.getConnection();
    const [reservas] = await connection.query(
      'SELECT * FROM reservas ORDER BY fecha_reserva'
    );
    connection.release();
    res.json(reservas);
  } catch (error) {
    console.error('❌ Error al obtener reservas:', error.message);
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
});


app.get('reservas/:barbero', async (req, res) => {
  const {barbero} = req.params
  try {
    const connection = await pool.getConnection();
    const [reservasBarbero] = await connection.query(
      'SELECT * FROM reservas WHERE barbero = ? ORDER BY fecha_reserva ASC',
      [barbero]

    );
    res.json(rows);
  } catch(error) {
    console.error('error al obtener las reservas', error)
    res.status(500).json({error: 'Error al obtener las reservas'})
  }
}); 

/// ❌ Cancelar una reserva por ID
app.delete('/reservas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'DELETE FROM reservas WHERE id = ?',
      [id]
    );
    connection.release();
    if (result.affectedRows > 0) {
      res.json({ success: 'Reserva cancelada correctamente.' });
    } else {
      res.status(404).json({ error: 'Reserva no encontrada.' });
    }
  } catch (error) {
    console.error('❌ Error al cancelar reserva:', error.message);
    res.status(500).json({ error: 'Error al cancelar reserva' });
  }
});

/// ✅ Confirmar una reserva (opcional, usando campo `estado`)
app.put('/reservas/:id/confirmar', async (req, res) => {
  const { id } = req.params;
  try {
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE reservas SET estado = "confirmada" WHERE id = ?',
      [id]
    );
    connection.release();
    res.json({ success: 'Reserva confirmada correctamente.' });
  } catch (error) {
    console.error('❌ Error al confirmar reserva:', error.message);
    res.status(500).json({ error: 'Error al confirmar reserva' });
  }
});

/// 🟢 Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend escuchando en http://localhost:${PORT}`);
});
