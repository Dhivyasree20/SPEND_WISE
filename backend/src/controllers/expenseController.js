const expenseService = require('../services/expenseService');

const getExpenses = async (req, res) => {
    try {
        const expenses = await expenseService.getAllExpenses(
            req.user.id
        );

        res.json(expenses);
    } catch (error) {
        console.error('GET EXPENSES ERROR:', error);

        res.status(500).json({
            message: 'Failed to fetch expenses'
        });
    }
};

const addExpense = async (req, res) => {
    try {
        const expense = await expenseService.createExpense(
            req.body,
            req.user.id
        );

        res.status(201).json(expense);
    } catch (error) {
        console.error('ADD EXPENSE ERROR:', error);

        res.status(500).json({
            message: 'Failed to add expense'
        });
    }
};

const removeExpense = async (req, res) => {
    try {
        const deletedExpense =
            await expenseService.deleteExpense(
                req.params.id,
                req.user.id
            );

        if (!deletedExpense) {
            return res.status(404).json({
                message: 'Expense not found'
            });
        }

        res.json(deletedExpense);
    } catch (error) {
        console.error('DELETE EXPENSE ERROR:', error);

        res.status(500).json({
            message: 'Failed to delete expense'
        });
    }
};

const editExpense = async (req, res) => {
    try {
        const updatedExpense =
            await expenseService.updateExpense(
                req.params.id,
                req.body,
                req.user.id
            );

        if (!updatedExpense) {
            return res.status(404).json({
                message: 'Expense not found'
            });
        }

        res.json(updatedExpense);
    } catch (error) {
        console.error('EDIT EXPENSE ERROR:', error);

        res.status(500).json({
            message: 'Failed to update expense'
        });
    }
};

module.exports = {
    getExpenses,
    addExpense,
    removeExpense,
    editExpense
};