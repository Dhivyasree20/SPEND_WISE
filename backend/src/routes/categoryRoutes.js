const express = require('express');

console.log('CATEGORY ROUTES LOADED');

const router = express.Router();



const {
    getCategories,
    addCategory,
    editCategory,
    removeCategory
} = require('../controllers/categoryController');

router.get('/categories', getCategories);
router.post('/categories', addCategory);
router.put('/categories/:id', editCategory);
router.delete('/categories/:id', removeCategory);

module.exports = router;