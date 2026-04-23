const db = require('../config/db');
const crypto = require('crypto');
const fs = require('fs');

const deleteUploadedFiles = (files = []) => {
    files.forEach((file) => {
        if (file && file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
    });
};

const updatePassword = async (req, res) => {
    try {

        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                message: "Email and new password are required"
            });
        }

        const result = await db.query(
            "UPDATE Users SET password_hash = $1 WHERE email = $2 AND is_staff = FALSE RETURNING user_id, email",
            [newPassword, email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        res.json({
            message: "Password updated successfully",
            user: result.rows[0]
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};
const getCustomerByEmail = async (req, res) => {
    try {
        const { email } = req.params;

        const result = await db.query(
            'SELECT user_id, username, email, first_name, last_name, phone_number, address, date_of_birth, id_card_front_image_url, id_card_back_image_url, is_active FROM Users WHERE email = $1 AND is_staff = FALSE',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};
const getAllCustomers = async (req, res) => {
    try {
        const result = await db.query('SELECT user_id, username, email,password_hash, first_name, last_name, phone_number, address, date_of_birth, id_card_front_image_url, id_card_back_image_url, is_active FROM Users WHERE is_staff = FALSE');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
const login = async (req, res) => {
   try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const result = await db.query(
            "SELECT * FROM Users WHERE email = $1 AND password_hash = $2",
            [email, password]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
	const user = result.rows[0];
        res.json({
            message: "Login successful",
		user: user
        });

    } catch (err) {
        res.status(500).json({
            error: err.message
        });
    }
};
const getCustomerById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.query('SELECT * FROM Users WHERE user_id = $1 AND is_staff = FALSE', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const createCustomer = async (req, res) => {
    const { username, password, email, first_name, last_name, phone_number, address, date_of_birth } = req.body;
    const uploadedFiles = [
        ...(req.files && req.files.id_card_front ? req.files.id_card_front : []),
        ...(req.files && req.files.id_card_back ? req.files.id_card_back : [])
    ];

    try {
        const idCardFrontFile = req.files && req.files.id_card_front ? req.files.id_card_front[0] : null;
        const idCardBackFile = req.files && req.files.id_card_back ? req.files.id_card_back[0] : null;

        if (!idCardFrontFile || !idCardBackFile) {
            deleteUploadedFiles(uploadedFiles);
            return res.status(400).json({ error: 'Both id_card_front and id_card_back images are required' });
        }

        const passwordHash = password;
        const query = `
            INSERT INTO Users (username, password_hash, email, first_name, last_name, phone_number, address, date_of_birth, gender, is_staff, id_card_front_image_url, id_card_back_image_url)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8,'male', FALSE, $9, $10) RETURNING user_id, username, id_card_front_image_url, id_card_back_image_url;
        `;
        const result = await db.query(query, [
            username,
            passwordHash,
            email,
            first_name,
            last_name,
            phone_number,
            address,
            date_of_birth,
            `/uploads/customers/${idCardFrontFile.filename}`,
            `/uploads/customers/${idCardBackFile.filename}`
        ]);
        res.status(201).json({ message: 'Customer created', user: result.rows[0] });
    } catch (err) {
        deleteUploadedFiles(uploadedFiles);
        res.status(500).json({ error: err.message });
    }
};

const updateCustomer = async (req, res) => {
    const { id } = req.params;
    const { email, first_name, last_name, phone_number, address, date_of_birth, is_active } = req.body;

    try {
        const result = await db.query(
            'UPDATE Users SET email = $1, first_name = $2, last_name = $3, phone_number = $4, address = $5, date_of_birth = $6, is_active = $7 WHERE user_id = $8 AND is_staff = FALSE RETURNING *',
            [email, first_name, last_name, phone_number, address, date_of_birth, is_active !== undefined ? is_active : true, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const deleteCustomer = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM Users WHERE user_id = $1 AND is_staff = FALSE RETURNING user_id', [id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.json({ message: 'Customer deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {updatePassword, getCustomerByEmail, getAllCustomers,login, getCustomerById, createCustomer, updateCustomer, deleteCustomer };
