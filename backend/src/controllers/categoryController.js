const {
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../services/categoryService');

const getCategories = async (req, res) => {
    const categories = await getAllCategories();
    res.json(categories);
};

const addCategory = async (req, res) => {
    const category = await createCategory(req.body);
    res.status(201).json(category);
};

const editCategory = async (req, res) => {
    const updatedCategory = await updateCategory(
        req.params.id,
        req.body
    );

    if (!updatedCategory) {
        return res.status(404).json({
            message: 'Category not found'
        });
    }

    res.json(updatedCategory);
};

const removeCategory = async (req, res) => {
    const deletedCategory = await deleteCategory(
        req.params.id
    );

    if (!deletedCategory) {
        return res.status(404).json({
            message: 'Category not found'
        });
    }

    res.json(deletedCategory);
};

module.exports = {
    getCategories,
    addCategory,
    editCategory,
    removeCategory
};