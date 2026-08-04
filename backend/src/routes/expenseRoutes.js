const express = require('express');

const router = express.Router();

const {
    getExpenses,
    addExpense,
    removeExpense,
    editExpense
} = require('../controllers/expenseController');

router.get('/expenses', getExpenses);

router.post('/expenses', addExpense);

router.delete('/expenses/:id', removeExpense);

router.put('/expenses/:id', editExpense);

module.exports = router;