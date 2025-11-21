const db = require('../config/db');

const getAllServices = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Services');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getServiceById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM Services WHERE service_id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Service not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createService = async (req, res) => {
    const { service_code, name, price, availability, description } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO Services (service_code, name, price, availability, description) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [service_code, name, price, availability || true, description]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const updateService = async (req, res) => {
    const { id } = req.params;
    const { name, price, availability, description } = req.body;
    try {
        const result = await db.query(
            'UPDATE Services SET name=$1, price=$2, availability=$3, description=$4 WHERE service_id=$5 RETURNING *',
            [name, price, availability, description, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Service not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteService = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM Services WHERE service_id = $1 RETURNING service_id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Service not found' });
        res.json({ message: 'Service deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getAllServices, getServiceById, createService, updateService, deleteService };