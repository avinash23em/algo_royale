const Problem = require('../models/Problem');

const getProblems = async (req, res) => {
  try {
    const problems = await Problem.find({}, 'title difficulty');
    res.json(problems);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }
    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getProblems,
  getProblemById
};

