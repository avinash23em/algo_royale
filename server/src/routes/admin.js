const express = require('express');
const router = express.Router();
const { addProblem, seedProblems } = require('../controllers/adminController');

// POST /api/admin/problems - Add a new problem
router.post('/problems', addProblem);

// POST /api/admin/seed - Seed sample problems
router.post('/seed', seedProblems);

module.exports = router;

