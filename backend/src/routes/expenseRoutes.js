const express = require('express');

const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const {
    getExpenses,
    addExpense,
    removeExpense,
    editExpense
} = require('../controllers/expenseController');

router.get('/', authMiddleware, getExpenses);

router.post('/', authMiddleware, addExpense);

router.delete('/:id', authMiddleware, removeExpense);

router.put('/:id', authMiddleware, editExpense);

module.exports = router;