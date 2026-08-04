const {
    getAllExpenses,
    createExpense,
    deleteExpense
} = require('../services/expenseService');

const getExpenses = (req, res) => {
    res.json(getAllExpenses());
};

const addExpense = (req, res) => {
    const expense = createExpense(req.body);

    res.status(201).json(expense);
};

const removeExpense = (req, res) => {
    const deletedExpense = deleteExpense(req.params.id);

    if (!deletedExpense) {
        return res.status(404).json({
            message: "Expense not found"
        });
    }

    res.json(deletedExpense);
};

module.exports = {
    getExpenses,
    addExpense,
    removeExpense
};