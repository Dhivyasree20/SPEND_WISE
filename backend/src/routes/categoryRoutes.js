const express = require('express');

const router = express.Router();

console.log('CATEGORY ROUTES LOADED');
const {
    getCategories,
    addCategory,
    removeCategory
} = require('../controllers/categoryController');

router.get('/categories', getCategories);

router.post('/categories', addCategory);

router.delete('/categories/:id', removeCategory);

module.exports = router;