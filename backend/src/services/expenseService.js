const pool = require('../config/db');

const getAllExpenses = async (userId) => {
    const result = await pool.query(
        `SELECT *
         FROM expenses
         WHERE user_id = $1
         ORDER BY id DESC`,
        [userId]
    );

    return result.rows;
};

const createExpense = async (expenseData, userId) => {
    const { title, amount, category } = expenseData;

    const result = await pool.query(
        `INSERT INTO expenses (title, amount, category, user_id)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [title, amount, category, userId]
    );

    return result.rows[0];
};

const updateExpense = async (id, expenseData, userId) => {
    const { title, amount, category } = expenseData;

    const result = await pool.query(
        `UPDATE expenses
         SET title = $1,
             amount = $2,
             category = $3
         WHERE id = $4
           AND user_id = $5
         RETURNING *`,
        [title, amount, category, id, userId]
    );

    return result.rows[0] || null;
};

const deleteExpense = async (id, userId) => {
    const result = await pool.query(
        `DELETE FROM expenses
         WHERE id = $1
           AND user_id = $2
         RETURNING *`,
        [id, userId]
    );

    return result.rows[0] || null;
};

module.exports = {
    getAllExpenses,
    createExpense,
    updateExpense,
    deleteExpense
};