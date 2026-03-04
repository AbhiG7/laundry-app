import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ClaimDialog from '../components/ClaimDialog'

const defaultProps = {
  open: true,
  machineId: 1,
  onClose: jest.fn(),
  onSubmit: jest.fn().mockResolvedValue(),
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('ClaimDialog - rendering', () => {
  test('renders when open=true', () => {
    render(<ClaimDialog {...defaultProps} />)
    expect(screen.getByTestId('claim-dialog')).toBeInTheDocument()
  })

  test('does not render when open=false', () => {
    render(<ClaimDialog {...defaultProps} open={false} />)
    expect(screen.queryByTestId('claim-dialog')).not.toBeInTheDocument()
  })

  test('shows correct machine number in title', () => {
    render(<ClaimDialog {...defaultProps} machineId={3} />)
    expect(screen.getByText(/Claim Machine 3/i)).toBeInTheDocument()
  })

  test('shows name, apartment, duration, and phone fields', () => {
    render(<ClaimDialog {...defaultProps} />)
    expect(screen.getByTestId('input-name')).toBeInTheDocument()
    expect(screen.getByTestId('input-apartment')).toBeInTheDocument()
    expect(screen.getByTestId('select-duration')).toBeInTheDocument()
    expect(screen.getByTestId('input-phone')).toBeInTheDocument()
  })
})

describe('ClaimDialog - validation', () => {
  test('shows error when name is empty', async () => {
    const user = userEvent.setup()
    render(<ClaimDialog {...defaultProps} />)
    await user.click(screen.getByTestId('btn-claim-submit'))
    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
  })

  test('shows error when apartment is empty', async () => {
    const user = userEvent.setup()
    render(<ClaimDialog {...defaultProps} />)
    await user.type(screen.getByTestId('input-name'), 'Alice')
    await user.click(screen.getByTestId('btn-claim-submit'))
    expect(screen.getByText(/apartment is required/i)).toBeInTheDocument()
  })

  test('clears name error when user types', async () => {
    const user = userEvent.setup()
    render(<ClaimDialog {...defaultProps} />)
    await user.click(screen.getByTestId('btn-claim-submit'))
    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
    await user.type(screen.getByTestId('input-name'), 'Alice')
    expect(screen.queryByText(/name is required/i)).not.toBeInTheDocument()
  })
})

describe('ClaimDialog - form submission', () => {
  test('calls onSubmit with correct data on valid submit', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn().mockResolvedValue()
    render(<ClaimDialog {...defaultProps} onSubmit={onSubmit} />)

    await user.type(screen.getByTestId('input-name'), 'Alice')
    await user.type(screen.getByTestId('input-apartment'), '3B')
    await user.click(screen.getByTestId('btn-claim-submit'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Alice',
        apartment: '3B',
        duration_min: 60,
        phone: '',
      })
    })
  })

  test('calls onSubmit with phone when provided', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn().mockResolvedValue()
    render(<ClaimDialog {...defaultProps} onSubmit={onSubmit} />)

    await user.type(screen.getByTestId('input-name'), 'Bob')
    await user.type(screen.getByTestId('input-apartment'), '5A')
    await user.type(screen.getByTestId('input-phone'), '555-9999')
    await user.click(screen.getByTestId('btn-claim-submit'))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ phone: '555-9999' })
      )
    })
  })

  test('phone field is optional - no validation error if empty', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn().mockResolvedValue()
    render(<ClaimDialog {...defaultProps} onSubmit={onSubmit} />)
    await user.type(screen.getByTestId('input-name'), 'Alice')
    await user.type(screen.getByTestId('input-apartment'), '3B')
    await user.click(screen.getByTestId('btn-claim-submit'))
    // Should submit successfully with no phone - no phone-required error
    await waitFor(() => expect(onSubmit).toHaveBeenCalled())
    expect(screen.queryByText(/phone.*required/i)).not.toBeInTheDocument()
  })

  test('does not call onSubmit when validation fails', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()
    render(<ClaimDialog {...defaultProps} onSubmit={onSubmit} />)
    await user.click(screen.getByTestId('btn-claim-submit'))
    expect(onSubmit).not.toHaveBeenCalled()
  })
})

describe('ClaimDialog - closing', () => {
  test('calls onClose when close button clicked', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    render(<ClaimDialog {...defaultProps} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /close dialog/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  test('calls onClose when cancel button clicked', async () => {
    const user = userEvent.setup()
    const onClose = jest.fn()
    render(<ClaimDialog {...defaultProps} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onClose).toHaveBeenCalledTimes(1)
  })
})
