const express = require('express');

const router = express.Router();

const {
    getExpenses,
    addExpense,
    removeExpense
} = require('../controllers/expenseController');

router.get('/expenses', getExpenses);

router.post('/expenses', addExpense);

router.delete('/expenses/:id', removeExpense);

module.exports = router;