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
            const existingResult = await db.query('SELECT service_code, name, price, availability, description FROM Services WHERE service_id = $1', [id]);
            if (existingResult.rows.length === 0) return res.status(404).json({ message: 'Service not found' });
            const existing = existingResult.rows[0];

            const name = body.name !== undefined ? body.name : existing.name;
            const price = body.price !== undefined ? body.price : existing.price;
            const availability = body.availability !== undefined ? body.availability : existing.availability;
            const description = body.description !== undefined ? body.description : existing.description;

            if (!name || price === null || price === undefined) {
                 return res.status(400).json({ error: 'Service name and price cannot be null.' });
            }

            const result = await db.query(
                'UPDATE Services SET name = $1, price = $2, availability = $3, description = $4 WHERE service_id = $5 RETURNING *',
                [name, price, availability, description, id]
            );
            res.json(result.rows[0]);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    deleteService: async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.query('UPDATE Services SET availability = FALSE WHERE service_id = $1 RETURNING *', [id]);
            if (result.rows.length === 0) return res.status(404).json({ message: 'Service not found' });
            res.json({ message: 'Service deactivated successfully (Soft Delete)' });
        } catch (err) {
            if (err.code === '23503') {
                 return res.status(400).json({ error: 'Cannot delete: Booking records are linked to this service. Service set to inactive.' });
            }
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = ServiceController;