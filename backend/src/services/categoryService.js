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

module.exports = {
    getAllCategories,
    createCategory
};