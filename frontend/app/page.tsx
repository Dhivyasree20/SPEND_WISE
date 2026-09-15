'use client'

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'

type Expense = {
  id: number
  title: string
  amount: number | string
  category: string
  created_at: string
}

type Draft = {
  title: string
  amount: string
  category: string
}

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://192.168.1.6:5000'

const TOKEN_KEY = 'spendwise_token'

const EMPTY_DRAFT: Draft = {
  title: '',
  amount: '',
  category: '',
}

const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-violet-600 focus:ring-2 focus:ring-violet-200'

const buttonClass =
  'rounded-lg bg-violet-700 px-4 py-2 font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60'

async function responseData(response: Response): Promise<unknown> {
  const text = await response.text()

  if (!text) return null

  try {
    return JSON.parse(text) as unknown
  } catch {
    return { message: text }
  }
}

function message(data: unknown, fallback: string) {
  if (data && typeof data === 'object' && 'message' in data) {
    const value = (data as { message?: unknown }).message

    if (typeof value === 'string' && value.trim()) {
      return value
    }
  }

  return fallback
}

function isExpense(value: unknown): value is Expense {
  return Boolean(
    value &&
      typeof value === 'object' &&
      typeof (value as Expense).id === 'number' &&
      typeof (value as Expense).title === 'string' &&
      typeof (value as Expense).category === 'string'
  )
}

export default function SpendWisePage() {
  const [token, setToken] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const [signup, setSignup] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authBusy, setAuthBusy] = useState(false)

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT)

  const [editing, setEditing] = useState<Expense | null>(null)
  const [editDraft, setEditDraft] = useState<Draft>(EMPTY_DRAFT)

  const [saving, setSaving] = useState(false)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [sort, setSort] = useState('newest')

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  setToken(window.localStorage.getItem(TOKEN_KEY))
  setReady(true)
}, [])

  const logout = useCallback(() => {
    window.localStorage.removeItem(TOKEN_KEY)

    setToken(null)
    setExpenses([])
    setError('')
    setPassword('')
    setSearch('')
    setCategory('All')
    setSort('newest')
  }, [])

  const loadExpenses = useCallback(
    async (authToken: string) => {
      setLoading(true)
      setError('')

      try {
        const response = await fetch(`${API_URL}/api/expenses`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        })

        const data = await responseData(response)

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            logout()
            throw new Error(
              'Your session has expired. Please log in again.'
            )
          }

          throw new Error(message(data, 'Failed to load expenses.'))
        }

        if (!Array.isArray(data) || !data.every(isExpense)) {
          throw new Error(
            'The expense list returned by the server is invalid.'
          )
        }

        setExpenses(data)
      } catch (reason) {
        setError(
          reason instanceof Error
            ? reason.message
            : 'Failed to load expenses.'
        )
      } finally {
        setLoading(false)
      }
    },
    [logout]
  )

  useEffect(() => {
  if (token) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadExpenses(token)
  }
}, [loadExpenses, token])

  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthMessage('')

    const cleanName = name.trim()
    const cleanEmail = email.trim()

    if (signup && !cleanName) {
      return setAuthMessage('Please enter your name.')
    }

    if (!cleanEmail || !password) {
      return setAuthMessage(
        'Please enter your email and password.'
      )
    }

    if (signup && password.length < 6) {
      return setAuthMessage(
        'Password must be at least 6 characters.'
      )
    }

    setAuthBusy(true)

    try {
      const response = await fetch(
        `${API_URL}/api/auth/${signup ? 'signup' : 'login'}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(
            signup
              ? {
                  name: cleanName,
                  email: cleanEmail,
                  password,
                }
              : {
                  email: cleanEmail,
                  password,
                }
          ),
        }
      )

      const data = await responseData(response)

      if (!response.ok) {
        throw new Error(
          message(
            data,
            signup ? 'Signup failed.' : 'Login failed.'
          )
        )
      }

      if (signup) {
        setSignup(false)
        setName('')
        setPassword('')
        setAuthMessage(
          'Account created. Please log in.'
        )

        return
      }

      const newToken =
        data && typeof data === 'object'
          ? (data as { token?: unknown }).token
          : null

      if (typeof newToken !== 'string' || !newToken) {
        throw new Error(
          'Login response did not include a token.'
        )
      }

      window.localStorage.setItem(TOKEN_KEY, newToken)
      setToken(newToken)
      setPassword('')
    } catch (reason) {
      setAuthMessage(
        reason instanceof Error
          ? reason.message
          : 'Authentication failed.'
      )
    } finally {
      setAuthBusy(false)
    }
  }

  function valid(value: Draft) {
    if (
      !value.title.trim() ||
      !value.amount.trim() ||
      !value.category.trim()
    ) {
      return 'Please fill in the title, amount, and category.'
    }

    if (
      !Number.isFinite(Number(value.amount)) ||
      Number(value.amount) <= 0
    ) {
      return 'Please enter an amount greater than zero.'
    }

    return null
  }

  async function save(
    event: FormEvent<HTMLFormElement>,
    existing?: Expense
  ) {
    event.preventDefault()

    if (!token) return

    const value = existing ? editDraft : draft
    const validation = valid(value)

    if (validation) {
      return setError(validation)
    }

    setSaving(true)
    setError('')

    try {
      const response = await fetch(
        `${API_URL}/api/expenses${
          existing ? `/${existing.id}` : ''
        }`,
        {
          method: existing ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: value.title.trim(),
            amount: Number(value.amount),
            category: value.category.trim(),
          }),
        }
      )

      const data = await responseData(response)

      if (!response.ok) {
        throw new Error(
          message(
            data,
            existing
              ? 'Failed to update expense.'
              : 'Failed to add expense.'
          )
        )
      }

      if (!isExpense(data)) {
        throw new Error(
          'The saved expense returned by the server is invalid.'
        )
      }

      setExpenses(current =>
        existing
          ? current.map(item =>
              item.id === existing.id ? data : item
            )
          : [...current, data]
      )

      setDraft(EMPTY_DRAFT)
      setEditing(null)
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Could not save the expense.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function remove(expense: Expense) {
    if (
      !token ||
      !window.confirm(`Remove “${expense.title}”?`)
    ) {
      return
    }

    setError('')

    try {
      const response = await fetch(
        `${API_URL}/api/expenses/${expense.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await responseData(response)

      if (!response.ok) {
        throw new Error(
          message(data, 'Failed to delete expense.')
        )
      }

      setExpenses(current =>
        current.filter(item => item.id !== expense.id)
      )
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : 'Could not delete the expense.'
      )
    }
  }

  const categories = useMemo(
    () =>
      Array.from(
        new Set(expenses.map(item => item.category))
      ).sort(),
    [expenses]
  )

  const visible = useMemo(() => {
    const filtered = expenses.filter(
      item =>
        (category === 'All' ||
          item.category === category) &&
        item.title
          .toLowerCase()
          .includes(search.trim().toLowerCase())
    )

    return [...filtered].sort((a, b) => {
      if (sort === 'amount-low') {
        return Number(a.amount) - Number(b.amount)
      }

      if (sort === 'amount-high') {
        return Number(b.amount) - Number(a.amount)
      }

      if (sort === 'oldest') {
        return (
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
        )
      }

      return (
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
      )
    })
  }, [category, expenses, search, sort])

  const total = expenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  )

  if (!ready) {
    return (
      <main className="min-h-screen bg-slate-100 p-6 text-center text-slate-600">
        Restoring your session…
      </main>
    )
  }

  if (!token) {
    return (
      <main className="min-h-screen bg-slate-100 px-4 py-12">
        <section className="mx-auto w-full max-w-md rounded-2xl bg-white p-7 shadow-sm">
          <h1 className="text-3xl font-bold text-violet-700">
            💰 SpendWise
          </h1>

          <p className="mt-2 text-slate-600">
            {signup
              ? 'Create your account'
              : 'Log in to manage your expenses'}
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={authenticate}
          >
            {signup && (
              <input
                className={inputClass}
                placeholder="Name"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
              />
            )}

            <input
              className={inputClass}
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />

            <input
              className={inputClass}
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete={
                signup
                  ? 'new-password'
                  : 'current-password'
              }
            />

            {authMessage && (
              <p
                className={
                  authMessage.includes('created')
                    ? 'text-sm text-green-700'
                    : 'text-sm text-red-600'
                }
              >
                {authMessage}
              </p>
            )}

            <button
              className={`${buttonClass} w-full`}
              disabled={authBusy}
              type="submit"
            >
              {authBusy
                ? 'Please wait…'
                : signup
                  ? 'Create account'
                  : 'Log in'}
            </button>
          </form>

          <button
            className="mt-5 w-full text-sm font-semibold text-violet-700"
            type="button"
            onClick={() => {
              setSignup(value => !value)
              setAuthMessage('')
            }}
          >
            {signup
              ? 'Already have an account? Log in'
              : 'New here? Create an account'}
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-4xl space-y-5">

        {/* Header */}
        <header className="flex items-center justify-between rounded-2xl bg-violet-700 p-6 text-white shadow-sm">
          <div>
            <h1 className="text-3xl font-bold">
              💰 SpendWise
            </h1>

            <p className="mt-1 text-violet-100">
              Your expenses
            </p>
          </div>

          <button
            className="font-semibold"
            type="button"
            onClick={logout}
          >
            Log out
          </button>
        </header>

        {/* Total Expenses */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-slate-500">
            Total expenses
          </p>

          <p className="mt-1 text-3xl font-bold text-violet-700">
            ₹{total.toFixed(2)}
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {expenses.length} expense
            {expenses.length === 1 ? '' : 's'} ·{' '}
            {categories.length} categor
            {categories.length === 1 ? 'y' : 'ies'}
          </p>
        </section>

        {/* Add Expense */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">
            Add expense
          </h2>

          <form
            className="mt-4 grid gap-3 sm:grid-cols-4"
            onSubmit={e => void save(e)}
          >
            <input
              className={`${inputClass} sm:col-span-2`}
              placeholder="Title"
              value={draft.title}
              onChange={e =>
                setDraft(value => ({
                  ...value,
                  title: e.target.value,
                }))
              }
            />

            <input
              className={inputClass}
              inputMode="decimal"
              placeholder="Amount"
              value={draft.amount}
              onChange={e =>
                setDraft(value => ({
                  ...value,
                  amount: e.target.value,
                }))
              }
            />

            <input
              className={inputClass}
              placeholder="Category"
              value={draft.category}
              onChange={e =>
                setDraft(value => ({
                  ...value,
                  category: e.target.value,
                }))
              }
            />

            <button
              className={`${buttonClass} sm:col-span-4`}
              disabled={saving}
              type="submit"
            >
              {saving ? 'Saving…' : 'Add expense'}
            </button>
          </form>
        </section>

        {/* Expenses */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap justify-between gap-3">
            <h2 className="text-xl font-bold">
              Expenses
            </h2>

            <button
              className="text-sm font-semibold text-violet-700"
              type="button"
              onClick={() => void loadExpenses(token)}
              disabled={loading}
            >
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>

          {/* Search, Category Filter and Sort */}
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              className={`${inputClass} flex-1`}
              placeholder="Search expenses"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <select
              className={`${inputClass} sm:w-48`}
              value={category}
              onChange={e =>
                setCategory(e.target.value)
              }
            >
              <option>All</option>

              {categories.map(value => (
                <option key={value}>
                  {value}
                </option>
              ))}
            </select>

            <select
              className={`${inputClass} sm:w-52`}
              value={sort}
              onChange={e =>
                setSort(e.target.value)
              }
            >
              <option value="newest">
                Newest → Oldest
              </option>

              <option value="oldest">
                Oldest → Newest
              </option>

              <option value="amount-low">
                Amount: Low → High
              </option>

              <option value="amount-high">
                Amount: High → Low
              </option>
            </select>
          </div>

          {error && (
            <p
              className="mt-4 text-sm text-red-600"
              role="alert"
            >
              {error}
            </p>
          )}

          {/* Expense List */}
          <div className="mt-5 space-y-3">
            {visible.length ? (
              visible.map(expense => (
                <article
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"
                  key={expense.id}
                >
                  <div>
                    <h3 className="font-semibold">
                      {expense.title}
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                      {expense.category}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <strong className="text-violet-700">
                      ₹{Number(expense.amount).toFixed(2)}
                    </strong>

                    <button
                      className="font-semibold text-amber-700"
                      type="button"
                      onClick={() => {
                        setEditing(expense)

                        setEditDraft({
                          title: expense.title,
                          amount: String(expense.amount),
                          category: expense.category,
                        })
                      }}
                    >
                      Edit
                    </button>

                    <button
                      className="font-semibold text-red-600"
                      type="button"
                      onClick={() =>
                        void remove(expense)
                      }
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="py-4 text-center text-slate-500">
                {loading
                  ? 'Loading expenses…'
                  : 'No expenses found.'}
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Edit Expense Modal */}
      {editing && (
        <div
          className="fixed inset-0 grid place-items-center bg-slate-950/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <form
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onSubmit={e =>
              void save(e, editing)
            }
          >
            <h2 className="text-xl font-bold">
              Edit expense
            </h2>

            <div className="mt-4 space-y-3">
              <input
                className={inputClass}
                placeholder="Title"
                value={editDraft.title}
                onChange={e =>
                  setEditDraft(value => ({
                    ...value,
                    title: e.target.value,
                  }))
                }
              />

              <input
                className={inputClass}
                inputMode="decimal"
                placeholder="Amount"
                value={editDraft.amount}
                onChange={e =>
                  setEditDraft(value => ({
                    ...value,
                    amount: e.target.value,
                  }))
                }
              />

              <input
                className={inputClass}
                placeholder="Category"
                value={editDraft.category}
                onChange={e =>
                  setEditDraft(value => ({
                    ...value,
                    category: e.target.value,
                  }))
                }
              />
            </div>

            <div className="mt-5 flex justify-end gap-3">
              <button
                className="rounded-lg px-4 py-2 font-semibold text-slate-600"
                type="button"
                onClick={() =>
                  setEditing(null)
                }
              >
                Cancel
              </button>

              <button
                className={buttonClass}
                disabled={saving}
                type="submit"
              >
                {saving
                  ? 'Saving…'
                  : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </main>
  )
}