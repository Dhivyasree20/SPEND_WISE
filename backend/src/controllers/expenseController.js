const {
    getAllExpenses
} = require('../services/expenseService');

const getExpenses = (req, res) => {
    res.json(getAllExpenses());
};

module.exports = {
    getExpenses
};