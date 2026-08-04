const {
    getAllExpenses,
    createExpense,
    deleteExpense,
    updateExpense
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

const editExpense = (req, res) => {
    const updatedExpense = updateExpense(
        req.params.id,
        req.body
    );

    if (!updatedExpense) {
        return res.status(404).json({
            message: "Expense not found"
        });
    }

    res.json(updatedExpense);
};

module.exports = {
    getExpenses,
    addExpense,
    removeExpense,
    editExpense
};