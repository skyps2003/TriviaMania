const Question = require('../models/Question');

// @desc    Get random questions
// @route   GET /api/questions
// @access  Public
const getQuestions = async (req, res) => {
    try {
        // Get 10 random questions
        const questions = await Question.aggregate([{ $sample: { size: 10 } }]);
        res.json(questions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { getQuestions };
