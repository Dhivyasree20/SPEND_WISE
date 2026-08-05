const {
    getAllExpenses,
    createExpense,
    deleteExpense,
    updateExpense
} = require('../services/expenseService');

const getExpenses = async (req, res) => {
    const expenses = await getAllExpenses();
    res.json(expenses);
};

const addExpense = async (req, res) => {
    const expense = await createExpense(req.body);
    res.status(201).json(expense);
};

const removeExpense = async (req, res) => {
    const deletedExpense = await deleteExpense(req.params.id);

    if (!deletedExpense) {
        return res.status(404).json({
            message: 'Expense not found'
        });
    }

    res.json(deletedExpense);
};

const editExpense = async (req, res) => {
    const updatedExpense = await updateExpense(
        req.params.id,
        req.body
    );

    if (!updatedExpense) {
        return res.status(404).json({
            message: 'Expense not found'
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