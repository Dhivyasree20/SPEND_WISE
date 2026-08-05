const updateExpense = async (id, expenseData) => {
    const { title, amount, category } = expenseData;

    const result = await pool.query(
        `UPDATE expenses
         SET title = $1,
             amount = $2,
             category = $3
         WHERE id = $4
         RETURNING *`,
        [title, amount, category, id]
    );

    return result.rows[0] || null;
};