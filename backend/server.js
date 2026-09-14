require('dotenv').config();

console.log('SERVER FILE LOADED');
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const healthRoutes = require('./src/routes/healthRoutes');
const userRoutes = require('./src/routes/userRoutes');
const expenseRoutes = require('./src/routes/expenseRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');

console.log('EXPENSE ROUTES LOADED');

// Prefixed routes to match Next.js frontend calls and avoid endpoint conflicts
app.use('/health', healthRoutes);
app.use('/api/auth', userRoutes);     // Maps /login to /api/auth/login
app.use('/api/expenses', expenseRoutes); // Connects your existing expenses table
app.use('/api/categories', categoryRoutes);

app.get('/test-user', (req, res) => {
    res.json({
        id: 2,
        name: 'Priya',
        email: 'priya@gmail.com'
    });
});

app.get('/cors-test', (req, res) => {
  res.json({ message: 'cors working' });
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});