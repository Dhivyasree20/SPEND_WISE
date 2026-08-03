const express = require('express');

const router = express.Router();

const {
    getExpenses
} = require('../controllers/expenseController');

router.get('/expenses', getExpenses);

module.exports = router;