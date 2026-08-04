const {
    getAllCategories,
    createCategory
} = require('../services/categoryService');

const getCategories = (req, res) => {
    res.json(getAllCategories());
};

const addCategory = (req, res) => {
    const category = createCategory(req.body);

    res.status(201).json(category);
};

module.exports = {
    getCategories,
    addCategory
};