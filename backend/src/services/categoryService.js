const categories = [
    {
        id: 1,
        name: "Food"
    },
    {
        id: 2,
        name: "Travel"
    }
];

const getAllCategories = () => {
    return categories;
};

const createCategory = (categoryData) => {
    const newCategory = {
        id: categories.length + 1,
        ...categoryData
    };

    categories.push(newCategory);

    return newCategory;
};

const deleteCategory = (id) => {
    const index = categories.findIndex(
        category => category.id === parseInt(id)
    );

    if (index === -1) {
        return null;
    }

    const deletedCategory = categories[index];

    categories.splice(index, 1);

    return deletedCategory;
};

module.exports = {
    getAllCategories,
    createCategory,
    deleteCategory
};