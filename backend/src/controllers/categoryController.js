const {
    getAllCategories
} = require('../services/categoryService');

const getCategories = (req, res) => {
    res.json(getAllCategories());
};

module.exports = {
    getCategories
};