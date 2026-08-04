const {
    getAllCategories,
    createCategory,
    deleteCategory
} = require('../services/categoryService');

const getCategories = (req, res) => {
    res.json(getAllCategories());
};

const addCategory = (req, res) => {
    const category = createCategory(req.body);

    res.status(201).json(category);
};

const removeCategory = (req, res) => {
    const deletedCategory = deleteCategory(req.params.id);

    if (!deletedCategory) {
        return res.status(404).json({
            message: "Category not found"
        });
    }

    res.json(deletedCategory);
};

module.exports = {
    getCategories,
    addCategory,
    removeCategory
};