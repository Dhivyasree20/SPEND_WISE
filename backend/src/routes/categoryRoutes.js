const express = require('express');

const router = express.Router();

const {
    getCategories,
    addCategory,
    removeCategory
} = require('../controllers/categoryController');

router.get('/categories', getCategories);

router.post('/categories', addCategory);

router.delete('/categories/:id', removeCategory);

module.exports = router;