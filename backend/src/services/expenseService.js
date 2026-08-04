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

const deleteExpense = (id) => {
    const index = expenses.findIndex(
        expense => expense.id === parseInt(id)
    );

    if (index === -1) {
        return null;
    }

    const deletedExpense = expenses[index];

    expenses.splice(index, 1);

    return deletedExpense;
};

module.exports = {
    getAllExpenses,
    createExpense,
    deleteExpense
};