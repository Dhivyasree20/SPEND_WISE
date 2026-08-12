'use client'

import { useEffect, useState } from 'react'

type Expense = {
  id: number
  title: string
  amount: number
  category: string
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] =
  useState('All')
  const [expenses, setExpenses] = useState<Expense[]>([])
  
  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('http://localhost:5000/expenses')
      .then((res) => res.json())
      .then((data) => setExpenses(data))
      .catch((err) => console.error(err))
  }, [])

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
    }
  }

  const editExpense = async (id: number) => {
    const expense = expenses.find(
      (e) => e.id === id
    )

    if (!expense) return

    const newTitle = prompt(
      'Title',
      expense.title
    )

    if (!newTitle) return

    const newAmount = prompt(
      'Amount',
      String(expense.amount)
    )

    if (!newAmount) return

    const newCategory = prompt(
      'Category',
      expense.category
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

      const updatedExpense =
        await response.json()

      setExpenses(
        expenses.map((exp) =>
          exp.id === id
            ? updatedExpense
            : exp
        )
      )
    } catch (error) {
      console.error(error)
    }
  }

  const deleteExpense = async (id: number) => {
    try {
      await fetch(
        `http://localhost:5000/expenses/${id}`,
        {
          method: 'DELETE'
        }
      )

      setExpenses(
        expenses.filter(
          (exp) => exp.id !== id
        )
      )
    } catch (error) {
      console.error(error)
    }
  }

  const total = expenses.reduce(
    (sum, expense) =>
      sum + Number(expense.amount),
    0
  )

  const categories = new Set(
    expenses.map(
      (expense) => expense.category
    )
  )

  const filteredExpenses = expenses.filter(
  expense =>
    (selectedCategory === 'All' ||
      expense.category === selectedCategory) &&
    expense.title
      .toLowerCase()
      .includes(search.toLowerCase())
)

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-6 rounded-xl">
          <h1 className="text-4xl font-bold">
            💰 SpendWise
          </h1>

          <p className="mt-2">
            Track your expenses effortlessly
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mt-6">

          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-gray-500">
              Total Expenses
            </h3>

            <h2 className="text-3xl font-bold text-purple-600">
              ₹{total}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-gray-500">
              Expense Count
            </h3>

            <h2 className="text-3xl font-bold text-purple-600">
              {expenses.length}
            </h2>
          </div>

          <div className="bg-white p-5 rounded-xl shadow">
            <h3 className="text-gray-500">
              Categories
            </h3>

            <h2 className="text-3xl font-bold text-purple-600">
              {categories.size}
            </h2>
          </div>

        </div>

        <div className="bg-white p-5 rounded-xl shadow mt-6">
          <h2 className="text-xl font-bold mb-4">
            Add Expense
          </h2>

          <div className="grid gap-3">

            <input
              className="border p-2 rounded"
              placeholder="Title"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />

            <input
              className="border p-2 rounded"
              placeholder="Amount"
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value)
              }
            />

            <input
              className="border p-2 rounded"
              placeholder="Category"
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            />

            <button
              onClick={addExpense}
              className="bg-purple-600 text-white p-2 rounded"
            >
              Add Expense
            </button>

          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow mt-6">
          <h2 className="text-xl font-bold mb-4">
            Recent Expenses
          </h2>

          <div className="space-y-3">
          
          <input
  type="text"
  placeholder="Search expenses..."
  value={search}
  onChange={(e) =>
    setSearch(e.target.value)
  }
  className="border p-2 rounded mb-4 w-full"
/>

            <select
  value={selectedCategory}
  onChange={(e) =>
    setSelectedCategory(e.target.value)
  }
  className="border p-2 rounded mb-4"
>
  <option value="All">All</option>

  {Array.from(categories).map((cat) => (
    <option key={cat} value={cat}>
      {cat}
    </option>
  ))}
</select>

            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex justify-between bg-gray-50 p-3 rounded-lg"
              >
                <div>
                  <p className="font-semibold">
                    {expense.title}
                  </p>

                  <p className="text-sm text-gray-500">
                    {expense.category}
                  </p>
                </div>

                <div className="flex gap-2 items-center">

                  <p className="font-bold text-purple-600">
                    ₹{expense.amount}
                  </p>

                  <button
                    onClick={() =>
                      editExpense(expense.id)
                    }
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      deleteExpense(expense.id)
                    }
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Delete
                  </button>

                </div>
              </div>
            ))}

          </div>
        </div>

      </div>
    </main>
  )
}