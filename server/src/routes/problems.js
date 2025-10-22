const express = require('express');
const router = express.Router();
const { getProblems, getProblemById } = require('../controllers/problemController');

// GET /api/problems - Get all problems
router.get('/', getProblems);

// GET /api/problems/:id - Get specific problem
router.get('/:id', getProblemById);

module.exports = router;

