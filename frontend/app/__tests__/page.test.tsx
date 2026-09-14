import '@testing-library/jest-dom'
import { describe, expect, it } from '@jest/globals'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import SpendWisePage from '../page'

describe('SpendWise Page', () => {
  it('shows the SpendWise login screen', () => {
    render(<SpendWisePage />)

    expect(screen.getByText('💰 SpendWise')).toBeTruthy()
    expect(screen.getByText('Log in')).toBeTruthy()
  })

  it('switches from login to signup', async () => {
    const user = userEvent.setup()

    render(<SpendWisePage />)

    await user.click(screen.getByText('New here? Create an account'))

    expect(screen.getByText('Create your account')).toBeTruthy()
    expect(screen.getByPlaceholderText('Name')).toBeTruthy()
  })
})