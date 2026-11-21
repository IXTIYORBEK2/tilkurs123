
const express = require("express");
const router = express.Router();

const {
    getAllNotes,
    createNote,
    updateNote,
    deleteNote
} = require("../controllers/notesController");

const validateNote = require("../middleware/validateNote");

router.get("/", getAllNotes);
router.post("/", validateNote, createNote);
router.put("/:id", validateNote, updateNote);
router.delete("/:id", deleteNote);

module.exports = router;
