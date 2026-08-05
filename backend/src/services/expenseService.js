const pool = require('../config/db');

const getAllExpenses = async () => {
    const result = await pool.query(
        'SELECT * FROM expenses ORDER BY id'
    );

    return result.rows;
};

const createExpense = async (expenseData) => {
    const { title, amount, category } = expenseData;

    const result = await pool.query(
        `INSERT INTO expenses (title, amount, category)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [title, amount, category]
    );

    return result.rows[0];
};

const deleteExpense = async (id) => {
    const result = await pool.query(
        'DELETE FROM expenses WHERE id = $1 RETURNING *',
        [id]
    );

    return result.rows[0] || null;
};

module.exports = {
    getAllExpenses,
    createExpense,
    deleteExpense
};