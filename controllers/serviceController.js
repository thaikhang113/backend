const db = require('../config/db');

const ServiceController = {
    getAllServices: async (req, res) => {
        try {
            const result = await db.query('SELECT * FROM Services ORDER BY service_id ASC');
            res.json(result.rows);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    getServiceById: async (req, res) => {
        try {
            const { id } = req.params;
            const result = await db.query('SELECT * FROM Services WHERE service_id = $1', [id]);
            if (result.rows.length === 0) return res.status(404).json({ message: 'Service not found' });
            res.json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    createService: async (req, res) => {
        const { service_code, name, price, description } = req.body;
        if (!service_code || !name || price === undefined) {
             return res.status(400).json({ message: 'Code, name, and price are required.' });
        }
        try {
            const query = `
                INSERT INTO Services (service_code, name, price, description, availability)
                VALUES ($1, $2, $3, $4, TRUE) RETURNING *;
            `;
            const result = await db.query(query, [service_code, name, price, description]);
            res.status(201).json({ message: 'Service created', service: result.rows[0] });
        } catch (err) {
            if (err.code === '23505') return res.status(400).json({ error: 'Service code already exists.' });
            res.status(500).json({ error: err.message });
        }
    },

    updateService: async (req, res) => {
        const { id } = req.params;
        const body = req.body;
        
        try {
            const existingResult = await db.query('SELECT * FROM Services WHERE service_id = $1', [id]);
            if (existingResult.rows.length === 0) return res.status(404).json({ message: 'Service not found' });
            const existing = existingResult.rows[0];

            const name = body.name !== undefined ? body.name : existing.name;
            const price = body.price !== undefined ? body.price : existing.price;
            const description = body.description !== undefined ? body.description : existing.description;
            const availability = body.availability !== undefined ? body.availability : existing.availability;

            if (!name || price === null || price === undefined) {
                 return res.status(400).json({ error: 'Service name and price cannot be null.' });
            }

            const result = await db.query(
                'UPDATE Services SET name = $1, price = $2, description = $3, availability = $4 WHERE service_id = $5 RETURNING *',
                [name, price, description, availability, id]
            );
            res.json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // CẬP NHẬT: Xóa hẳn khỏi database (Hard Delete)
    deleteService: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.query('DELETE FROM Services WHERE service_id = $1 RETURNING *', [id]);
            if (result.rows.length === 0) return res.status(404).json({ message: 'Service not found' });
            res.json({ message: 'Service deleted permanently.' });
        } catch (err) {
            // Lỗi ràng buộc khóa ngoại
            if (err.code === '23503') {
                 return res.status(400).json({ error: 'Không thể xóa: Dịch vụ này đã có trong lịch sử đặt phòng.' });
            }
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = ServiceController;