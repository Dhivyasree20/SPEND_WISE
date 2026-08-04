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

const updateExpense = (id, expenseData) => {
    const expense = expenses.find(
        expense => expense.id === parseInt(id)
    );

    if (!expense) {
        return null;
    }

    expense.title = expenseData.title;
    expense.amount = expenseData.amount;
    expense.category = expenseData.category;

    return expense;
};

module.exports = {
    getAllExpenses,
    createExpense,
    deleteExpense,
    updateExpense
};