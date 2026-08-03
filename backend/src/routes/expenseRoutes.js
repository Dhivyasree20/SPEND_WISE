const express = require('express');

const router = express.Router();

const {
    getExpenses,
    addExpense
} = require('../controllers/expenseController');

router.get('/expenses', getExpenses);

router.post('/expenses', addExpense);

module.exports = router;