
const db = require("../config/database");

// Barcha eslatmalarni olish
const getAllNotes = async (req, res, next) => {
    try {
        const [notes] = await db.execute(
            `SELECT id, name, description,
                    created_at AS createdAt,
                    updated_at AS updatedAt
             FROM notes
             ORDER BY id DESC`
        );

        res.status(200).json({
            success: true,
            count: notes.length,
            data: notes
        });
    } catch (error) {
        console.error("MYSQL GET ERROR:", error);
        next(error);
    }
};

// Yangi eslatma yaratish
const createNote = async (req, res, next) => {
    try {
        const { name, description } = req.body;

        const [result] = await db.execute(
            `INSERT INTO notes (name, description)
             VALUES (?, ?)`,
            [name, description || null]
        );

        const [rows] = await db.execute(
            `SELECT id, name, description,
                    created_at AS createdAt,
                    updated_at AS updatedAt
             FROM notes
             WHERE id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            message: "Eslatma yaratildi",
            data: rows[0]
        });
    } catch (error) {
        console.error("MYSQL CREATE ERROR:", error);
        next(error);
    }
};

// Eslatmani yangilash
const updateNote = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const [result] = await db.execute(
            `UPDATE notes
             SET name = ?, description = ?
             WHERE id = ?`,
            [name, description || null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Eslatma topilmadi"
            });
        }

        const [rows] = await db.execute(
            `SELECT id, name, description,
                    created_at AS createdAt,
                    updated_at AS updatedAt
             FROM notes
             WHERE id = ?`,
            [id]
        );

        res.status(200).json({
            success: true,
            message: "Eslatma yangilandi",
            data: rows[0]
        });
    } catch (error) {
        console.error("MYSQL UPDATE ERROR:", error);
        next(error);
    }
};

// Eslatmani o'chirish
const deleteNote = async (req, res, next) => {
    try {
        const { id } = req.params;

        const [result] = await db.execute(
            "DELETE FROM notes WHERE id = ?",
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Eslatma topilmadi"
            });
        }

        res.status(200).json({
            success: true,
            message: "Eslatma o'chirildi"
        });
    } catch (error) {
        console.error("MYSQL DELETE ERROR:", error);
        next(error);
    }
};

module.exports = {
    getAllNotes,
    createNote,
    updateNote,
    deleteNote
};
