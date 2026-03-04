import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UserCard from '../components/UserCard'

const availableMachine = { id: 1, status: 'available' }

const inUseMachine = {
  id: 2,
  status: 'in_use',
  user: { name: 'Alice Smith', apartment: '3B', phone: '555-1234' },
  expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  time_left_seconds: 1800,
}

const inUseMachineNoPhone = {
  id: 3,
  status: 'in_use',
  user: { name: 'Bob', apartment: '5A' },
  expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  time_left_seconds: 600,
}

describe('UserCard - available machine', () => {
  test('shows claim button when machine is available', () => {
    render(<UserCard machine={availableMachine} onClaimClick={() => {}} onRelease={() => {}} />)
    expect(screen.getByTestId('claim-btn-1')).toBeInTheDocument()
    expect(screen.getByTestId('claim-btn-1')).toHaveTextContent(/claim/i)
  })

  test('calls onClaimClick when claim button is clicked', async () => {
    const user = userEvent.setup()
    const onClaimClick = jest.fn()
    render(<UserCard machine={availableMachine} onClaimClick={onClaimClick} onRelease={() => {}} />)
    await user.click(screen.getByTestId('claim-btn-1'))
    expect(onClaimClick).toHaveBeenCalledTimes(1)
  })

  test('does not show user info when available', () => {
    render(<UserCard machine={availableMachine} onClaimClick={() => {}} onRelease={() => {}} />)
    expect(screen.queryByTestId('user-name-1')).not.toBeInTheDocument()
    expect(screen.queryByTestId('countdown-1')).not.toBeInTheDocument()
  })
})

describe('UserCard - in use machine', () => {
  test('shows user name when in use', () => {
    render(<UserCard machine={inUseMachine} onClaimClick={() => {}} onRelease={() => {}} />)
    expect(screen.getByTestId('user-name-2')).toHaveTextContent('Alice Smith')
  })

  test('shows apartment number', () => {
    render(<UserCard machine={inUseMachine} onClaimClick={() => {}} onRelease={() => {}} />)
    expect(screen.getByText(/Apt 3B/i)).toBeInTheDocument()
  })

  test('shows phone number when provided', () => {
    render(<UserCard machine={inUseMachine} onClaimClick={() => {}} onRelease={() => {}} />)
    expect(screen.getByText(/555-1234/)).toBeInTheDocument()
  })

  test('does not show phone when not provided', () => {
    render(<UserCard machine={inUseMachineNoPhone} onClaimClick={() => {}} onRelease={() => {}} />)
    expect(screen.queryByText(/📞/)).not.toBeInTheDocument()
  })

  test('shows countdown timer', () => {
    render(<UserCard machine={inUseMachine} onClaimClick={() => {}} onRelease={() => {}} />)
    expect(screen.getByTestId('countdown-2')).toBeInTheDocument()
    expect(screen.getByTestId('countdown-2')).toHaveTextContent('30:00')
  })

  test('does not show claim button when in use', () => {
    render(<UserCard machine={inUseMachine} onClaimClick={() => {}} onRelease={() => {}} />)
    expect(screen.queryByTestId('claim-btn-2')).not.toBeInTheDocument()
  })

  test('shows release button', () => {
    render(<UserCard machine={inUseMachine} onClaimClick={() => {}} onRelease={() => {}} />)
    expect(screen.getByTestId('release-btn-2')).toBeInTheDocument()
  })

  test('calls onRelease when release button clicked', async () => {
    const user = userEvent.setup()
    const onRelease = jest.fn()
    render(<UserCard machine={inUseMachine} onClaimClick={() => {}} onRelease={onRelease} />)
    await user.click(screen.getByTestId('release-btn-2'))
    expect(onRelease).toHaveBeenCalledWith(2)
  })

  test('shows Done when time is 0', () => {
    const doneMachine = { ...inUseMachine, time_left_seconds: 0 }
    render(<UserCard machine={doneMachine} onClaimClick={() => {}} onRelease={() => {}} />)
    expect(screen.getByTestId('countdown-2')).toHaveTextContent('Done!')
  })
})
