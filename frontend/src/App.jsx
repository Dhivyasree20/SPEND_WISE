import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [expenses, setExpenses] = useState([])

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')

  useEffect(() => {
    fetch('http://localhost:5000/expenses')
      .then((res) => res.json())
      .then((data) => setExpenses(data))
      .catch((err) => console.error(err))
  }, [])

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  )

  const uniqueCategories = new Set(
    expenses.map((expense) => expense.category)
  )

  const today = new Date()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()

  const thisMonthExpenses = expenses.filter((expense) => {
    const expenseDate = new Date(expense.expense_date)

    return (
      expenseDate.getMonth() === currentMonth &&
      expenseDate.getFullYear() === currentYear
    )
  })

  const thisMonthTotal = thisMonthExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  )

  const addExpense = async () => {
    if (!title || !amount || !category) {
      alert('Please fill all fields')
      return
    }

    try {
      const response = await fetch(
        'http://localhost:5000/expenses',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title,
            amount,
            category
          })
        }
      )

      const newExpense = await response.json()

      setExpenses([...expenses, newExpense])

      setTitle('')
      setAmount('')
      setCategory('')
    } catch (error) {
      console.error(error)
      alert('Failed to add expense')
    }
  }

  const editExpense = async (id) => {
    const expenseToUpdate = expenses.find(
      (expense) => expense.id === id
    )

    const newTitle = prompt(
      'Enter title',
      expenseToUpdate.title
    )

    if (!newTitle) return

    const newAmount = prompt(
      'Enter amount',
      expenseToUpdate.amount
    )

    if (!newAmount) return

    const newCategory = prompt(
      'Enter category',
      expenseToUpdate.category
    )

    if (!newCategory) return

    try {
      const response = await fetch(
        `http://localhost:5000/expenses/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: newTitle,
            amount: newAmount,
            category: newCategory
          })
        }
      )

      const updatedExpense = await response.json()

      setExpenses(
        expenses.map((expense) =>
          expense.id === id
            ? updatedExpense
            : expense
        )
      )
    } catch (error) {
      console.error(error)
      alert('Failed to update expense')
    }
  }

  const deleteExpense = async (id) => {
    try {
      await fetch(
        `http://localhost:5000/expenses/${id}`,
        {
          method: 'DELETE'
        }
      )

      setExpenses(
        expenses.filter(
          (expense) => expense.id !== id
        )
      )
    } catch (error) {
      console.error(error)
      alert('Failed to delete expense')
    }
  }

  return (
    <div className="app">
      <header className="header">
        <h1>💰 SpendWise</h1>
        <p>Track your expenses effortlessly</p>
      </header>

      <div className="stats">
        <div className="card">
          <h3>Total Expenses</h3>
          <h2>₹{total}</h2>
        </div>

        <div className="card">
          <h3>This Month</h3>
          <h2>₹{thisMonthTotal}</h2>
        </div>

        <div className="card">
          <h3>Categories</h3>
          <h2>{uniqueCategories.size}</h2>
        </div>
      </div>

      <div className="expenses-section">
        <h2>Add Expense</h2>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          <option value="Food">Food</option>
          <option value="Travel">Travel</option>
          <option value="Bills">Bills</option>
          <option value="Healthcare">Healthcare</option>
          <option value="Shopping">Shopping</option>
        </select>

        <button onClick={addExpense}>
          Add Expense
        </button>
      </div>

      <div className="expenses-section">
        <div className="section-header">
          <h2>Recent Expenses</h2>
        </div>

        <div className="expense-list">
          {expenses.map((expense) => (
            <div
              className="expense-item"
              key={expense.id}
            >
              <div>
                <strong>{expense.title}</strong>
                <br />
                <small>{expense.category}</small>
              </div>

              <span>
                ₹{expense.amount}

                <button
                  onClick={() =>
                    editExpense(expense.id)
                  }
                  style={{
                    marginLeft: '10px',
                    background: 'orange'
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() =>
                    deleteExpense(expense.id)
                  }
                  style={{
                    marginLeft: '10px',
                    background: 'red'
                  }}
                >
                  Delete
                </button>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App