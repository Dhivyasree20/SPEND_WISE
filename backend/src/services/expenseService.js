const expenses = [
    {
        id: 1,
        title: "Lunch",
        amount: 120,
        category: "Food"
    }
];

const getAllExpenses = () => {
    return expenses;
};

const createExpense = (expenseData) => {
    const newExpense = {
        id: expenses.length + 1,
        ...expenseData
    };

    expenses.push(newExpense);

    return newExpense;
};

module.exports = {
    getAllExpenses,
    createExpense
};