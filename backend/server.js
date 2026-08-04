const express = require('express');

const app = express();

app.use(express.json());

const healthRoutes = require('./src/routes/healthRoutes');
const userRoutes = require('./src/routes/userRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');

console.log('EXPENSE ROUTES LOADED');

app.use('/', healthRoutes);
app.use('/', userRoutes);
app.use('/', expenseRoutes);
app.use('/', categoryRoutes);

app.get('/test-user', (req, res) => {
    res.json({
        id: 2,
        name: 'Priya',
        email: 'priya@gmail.com'
    });
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});