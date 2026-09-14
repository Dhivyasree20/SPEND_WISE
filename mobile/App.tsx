import AsyncStorage from '@react-native-async-storage/async-storage'
import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'

type Expense = {
  id: number
  title: string
  amount: number | string
  category: string
}

type ExpenseDraft = {
  title: string
  amount: string
  category: string
}

const API_URL = 'http://192.168.1.7:5000'
const TOKEN_KEY = 'spendwise_token'
const emptyDraft: ExpenseDraft = { title: '', amount: '', category: '' }

async function readResponse(response: Response) {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text) as unknown
  } catch {
    return { message: text }
  }
}

function messageFrom(data: unknown, fallback: string) {
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message?: unknown }).message
    if (typeof message === 'string' && message.trim()) return message
  }
  return fallback
}

export default function App() {
  const [token, setToken] = useState<string | null>(null)
  const [restoringSession, setRestoringSession] = useState(true)
  const [isSignup, setIsSignup] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [authBusy, setAuthBusy] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loadingExpenses, setLoadingExpenses] = useState(false)
  const [expenseError, setExpenseError] = useState('')
  const [draft, setDraft] = useState<ExpenseDraft>(emptyDraft)
  const [savingExpense, setSavingExpense] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [editDraft, setEditDraft] = useState<ExpenseDraft>(emptyDraft)

  useEffect(() => {
    const restoreSession = async () => {
      try {
        setToken(await AsyncStorage.getItem(TOKEN_KEY))
      } catch {
        setAuthMessage('Could not restore your saved login.')
      } finally {
        setRestoringSession(false)
      }
    }
    void restoreSession()
  }, [])

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY)
    } catch {
      // Clear the in-memory session even if storage is unavailable.
    }
    setToken(null)
    setExpenses([])
    setExpenseError('')
    setPassword('')
    setSearch('')
    setSelectedCategory('All')
  }

  const fetchExpenses = async (authToken: string) => {
    setLoadingExpenses(true)
    setExpenseError('')
    try {
      const response = await fetch(`${API_URL}/api/expenses`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      const data = await readResponse(response)
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          await logout()
          throw new Error('Your session has expired. Please log in again.')
        }
        throw new Error(messageFrom(data, 'Failed to load expenses'))
      }
      if (!Array.isArray(data)) throw new Error('The expense list is invalid.')
      setExpenses(data as Expense[])
    } catch (error) {
      setExpenseError(error instanceof Error ? error.message : 'Failed to load expenses')
    } finally {
      setLoadingExpenses(false)
    }
  }

  useEffect(() => {
    if (token) void fetchExpenses(token)
  }, [token])

  const authenticate = async () => {
    setAuthMessage('')
    const cleanEmail = email.trim()
    const cleanName = name.trim()
    if (isSignup && !cleanName) return setAuthMessage('Please enter your name.')
    if (!cleanEmail || !password) return setAuthMessage('Please enter your email and password.')
    if (isSignup && password.length < 6) return setAuthMessage('Password must be at least 6 characters.')

    setAuthBusy(true)
    try {
      const response = await fetch(`${API_URL}/api/auth/${isSignup ? 'signup' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isSignup
          ? { name: cleanName, email: cleanEmail, password }
          : { email: cleanEmail, password }),
      })
      const data = await readResponse(response)
      if (!response.ok) throw new Error(messageFrom(data, isSignup ? 'Signup failed' : 'Login failed'))

      if (isSignup) {
        setIsSignup(false)
        setName('')
        setPassword('')
        setAuthMessage('Account created. Please log in.')
        return
      }

      const newToken = data && typeof data === 'object' ? (data as { token?: unknown }).token : null
      if (typeof newToken !== 'string' || !newToken) throw new Error('Login response did not include a token.')
      await AsyncStorage.setItem(TOKEN_KEY, newToken)
      setToken(newToken)
      setPassword('')
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : 'Authentication failed')
    } finally {
      setAuthBusy(false)
    }
  }

  const validateDraft = (value: ExpenseDraft) => {
    const amount = Number(value.amount)
    if (!value.title.trim() || !value.category.trim() || !value.amount.trim()) return 'Please fill in the title, amount, and category.'
    if (!Number.isFinite(amount) || amount <= 0) return 'Please enter an amount greater than zero.'
    return null
  }

  const saveExpense = async (existing?: Expense) => {
    if (!token) return
    const value = existing ? editDraft : draft
    const validationError = validateDraft(value)
    if (validationError) return Alert.alert('Invalid expense', validationError)

    setSavingExpense(true)
    try {
      const response = await fetch(existing ? `${API_URL}/api/expenses/${existing.id}` : `${API_URL}/api/expenses`, {
        method: existing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: value.title.trim(), amount: Number(value.amount), category: value.category.trim() }),
      })
      const data = await readResponse(response)
      if (!response.ok) throw new Error(messageFrom(data, existing ? 'Failed to update expense' : 'Failed to add expense'))
      if (!data || typeof data !== 'object') throw new Error('The saved expense is invalid.')

      const savedExpense = data as Expense
      setExpenses(current => existing
        ? current.map(expense => expense.id === existing.id ? savedExpense : expense)
        : [...current, savedExpense])
      setDraft(emptyDraft)
      setEditingExpense(null)
    } catch (error) {
      Alert.alert('Could not save expense', error instanceof Error ? error.message : 'Please try again.')
    } finally {
      setSavingExpense(false)
    }
  }

  const deleteExpense = (expense: Expense) => {
    Alert.alert('Delete expense?', `Remove “${expense.title}”?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            if (!token) return
            try {
              const response = await fetch(`${API_URL}/api/expenses/${expense.id}`, {
                method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
              })
              const data = await readResponse(response)
              if (!response.ok) throw new Error(messageFrom(data, 'Failed to delete expense'))
              setExpenses(current => current.filter(item => item.id !== expense.id))
            } catch (error) {
              Alert.alert('Could not delete expense', error instanceof Error ? error.message : 'Please try again.')
            }
          })()
        },
      },
    ])
  }

  const categories = useMemo(() => Array.from(new Set(expenses.map(expense => expense.category))).sort(), [expenses])
  const filteredExpenses = useMemo(() => expenses.filter(expense =>
    (selectedCategory === 'All' || expense.category === selectedCategory) &&
    expense.title.toLowerCase().includes(search.trim().toLowerCase()),
  ), [expenses, search, selectedCategory])
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0)

  if (restoringSession) {
    return <SafeAreaView style={styles.center}><ActivityIndicator size="large" color="#6d28d9" /></SafeAreaView>
  }

  if (!token) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView style={styles.authWrap} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.authCard}>
            <Text style={styles.brand}>💰 SpendWise</Text>
            <Text style={styles.subtitle}>{isSignup ? 'Create your account' : 'Log in to manage your expenses'}</Text>
            {isSignup && <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} autoCapitalize="words" />}
            <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry onSubmitEditing={() => void authenticate()} />
            {!!authMessage && <Text style={authMessage.includes('created') ? styles.successText : styles.errorText}>{authMessage}</Text>}
            <Pressable style={[styles.primaryButton, authBusy && styles.disabled]} disabled={authBusy} onPress={() => void authenticate()}>
              {authBusy ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>{isSignup ? 'Create account' : 'Log in'}</Text>}
            </Pressable>
            <Pressable onPress={() => { setIsSignup(value => !value); setAuthMessage('') }}>
              <Text style={styles.link}>{isSignup ? 'Already have an account? Log in' : 'New here? Create an account'}</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredExpenses}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={styles.list}
        refreshing={loadingExpenses}
        onRefresh={() => void fetchExpenses(token)}
        ListHeaderComponent={<>
          <View style={styles.header}><View><Text style={styles.headerTitle}>💰 SpendWise</Text><Text style={styles.headerSubtitle}>Your expenses</Text></View><Pressable onPress={() => void logout()}><Text style={styles.logout}>Logout</Text></Pressable></View>
          <View style={styles.summaryCard}><Text style={styles.summaryLabel}>Total expenses</Text><Text style={styles.summaryAmount}>₹{total.toFixed(2)}</Text><Text style={styles.countText}>{expenses.length} expense{expenses.length === 1 ? '' : 's'} · {categories.length} categor{categories.length === 1 ? 'y' : 'ies'}</Text></View>
          <View style={styles.card}><Text style={styles.cardTitle}>Add expense</Text><TextInput style={styles.input} placeholder="Title" value={draft.title} onChangeText={title => setDraft(value => ({ ...value, title }))} /><TextInput style={styles.input} placeholder="Amount" value={draft.amount} onChangeText={amount => setDraft(value => ({ ...value, amount }))} keyboardType="decimal-pad" /><TextInput style={styles.input} placeholder="Category" value={draft.category} onChangeText={category => setDraft(value => ({ ...value, category }))} /><Pressable style={[styles.primaryButton, savingExpense && styles.disabled]} disabled={savingExpense} onPress={() => void saveExpense()}><Text style={styles.primaryButtonText}>{savingExpense ? 'Saving…' : 'Add expense'}</Text></Pressable></View>
          <View style={styles.card}><Text style={styles.cardTitle}>Expenses</Text><TextInput style={styles.input} placeholder="Search expenses" value={search} onChangeText={setSearch} /><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryRow}>{['All', ...categories].map(category => <Pressable key={category} onPress={() => setSelectedCategory(category)} style={[styles.categoryChip, selectedCategory === category && styles.categoryChipSelected]}><Text style={selectedCategory === category ? styles.categoryChipTextSelected : styles.categoryChipText}>{category}</Text></Pressable>)}</ScrollView>{!!expenseError && <Text style={styles.errorText}>{expenseError}</Text>}</View>
        </>}
        ListEmptyComponent={!loadingExpenses ? <Text style={styles.emptyText}>No expenses found.</Text> : <ActivityIndicator color="#6d28d9" />}
        renderItem={({ item }) => <View style={styles.expenseCard}><View style={styles.expenseInfo}><Text style={styles.expenseTitle}>{item.title}</Text><Text style={styles.categoryText}>{item.category}</Text></View><View style={styles.actions}><Text style={styles.amount}>₹{Number(item.amount).toFixed(2)}</Text><Pressable onPress={() => { setEditingExpense(item); setEditDraft({ title: item.title, amount: String(item.amount), category: item.category }) }}><Text style={styles.edit}>Edit</Text></Pressable><Pressable onPress={() => deleteExpense(item)}><Text style={styles.delete}>Delete</Text></Pressable></View></View>}
      />
      <Modal visible={editingExpense !== null} transparent animationType="slide" onRequestClose={() => setEditingExpense(null)}><View style={styles.modalBackdrop}><View style={styles.modalCard}><Text style={styles.cardTitle}>Edit expense</Text><TextInput style={styles.input} placeholder="Title" value={editDraft.title} onChangeText={title => setEditDraft(value => ({ ...value, title }))} /><TextInput style={styles.input} placeholder="Amount" value={editDraft.amount} onChangeText={amount => setEditDraft(value => ({ ...value, amount }))} keyboardType="decimal-pad" /><TextInput style={styles.input} placeholder="Category" value={editDraft.category} onChangeText={category => setEditDraft(value => ({ ...value, category }))} /><Pressable style={[styles.primaryButton, savingExpense && styles.disabled]} disabled={savingExpense} onPress={() => editingExpense && void saveExpense(editingExpense)}><Text style={styles.primaryButtonText}>{savingExpense ? 'Saving…' : 'Save changes'}</Text></Pressable><Pressable onPress={() => setEditingExpense(null)}><Text style={styles.link}>Cancel</Text></Pressable></View></View></Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' }, center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }, authWrap: { flex: 1, justifyContent: 'center', padding: 20 }, authCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, elevation: 3 }, brand: { color: '#6d28d9', fontSize: 30, fontWeight: 'bold' }, subtitle: { color: '#6b7280', fontSize: 16, marginTop: 6, marginBottom: 20 }, input: { backgroundColor: '#fff', borderColor: '#d1d5db', borderRadius: 10, borderWidth: 1, color: '#111827', fontSize: 16, marginBottom: 12, paddingHorizontal: 14, paddingVertical: 12 }, primaryButton: { alignItems: 'center', backgroundColor: '#6d28d9', borderRadius: 10, marginBottom: 16, padding: 14 }, primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' }, disabled: { opacity: 0.55 }, link: { color: '#6d28d9', fontWeight: '600', textAlign: 'center' }, errorText: { color: '#dc2626', marginBottom: 12, textAlign: 'center' }, successText: { color: '#15803d', marginBottom: 12, textAlign: 'center' }, list: { padding: 16, paddingBottom: 36 }, header: { alignItems: 'center', backgroundColor: '#6d28d9', borderRadius: 16, flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16, padding: 20 }, headerTitle: { color: '#fff', fontSize: 26, fontWeight: 'bold' }, headerSubtitle: { color: '#ede9fe', marginTop: 4 }, logout: { color: '#fff', fontWeight: '700' }, summaryCard: { backgroundColor: '#fff', borderRadius: 14, elevation: 2, marginBottom: 16, padding: 20 }, summaryLabel: { color: '#6b7280' }, summaryAmount: { color: '#6d28d9', fontSize: 30, fontWeight: 'bold', marginTop: 5 }, countText: { color: '#6b7280', marginTop: 4 }, card: { backgroundColor: '#fff', borderRadius: 14, elevation: 2, marginBottom: 16, padding: 16 }, cardTitle: { color: '#111827', fontSize: 19, fontWeight: '700', marginBottom: 14 }, categoryRow: { gap: 8 }, categoryChip: { backgroundColor: '#ede9fe', borderRadius: 20, paddingHorizontal: 13, paddingVertical: 8 }, categoryChipSelected: { backgroundColor: '#6d28d9' }, categoryChipText: { color: '#5b21b6' }, categoryChipTextSelected: { color: '#fff', fontWeight: '700' }, expenseCard: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, elevation: 1, flexDirection: 'row', marginBottom: 10, padding: 15 }, expenseInfo: { flex: 1, paddingRight: 8 }, expenseTitle: { color: '#111827', fontSize: 17, fontWeight: '600' }, categoryText: { color: '#6b7280', marginTop: 4 }, actions: { alignItems: 'flex-end', gap: 6 }, amount: { color: '#6d28d9', fontSize: 16, fontWeight: '700' }, edit: { color: '#a16207', fontWeight: '700' }, delete: { color: '#dc2626', fontWeight: '700' }, emptyText: { color: '#6b7280', marginTop: 8, textAlign: 'center' }, modalBackdrop: { backgroundColor: 'rgba(0,0,0,0.45)', flex: 1, justifyContent: 'flex-end' }, modalCard: { backgroundColor: '#f9fafb', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
})
