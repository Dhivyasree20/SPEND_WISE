const {
    getAllExpenses,
    createExpense
} = require('../services/expenseService');

const getExpenses = (req, res) => {
    res.json(getAllExpenses());
};

const addExpense = (req, res) => {
    const expense = createExpense(req.body);

    res.status(201).json(expense);
};

module.exports = {
    getExpenses,
    addExpense
};