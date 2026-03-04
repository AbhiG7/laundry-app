import { render, screen } from '@testing-library/react'
import MachineDisplay from '../components/MachineDisplay'

describe('MachineDisplay', () => {
  test('renders machine image', () => {
    render(<MachineDisplay status="available" machineId={1} />)
    expect(screen.getByRole('img', { name: /washing machine 1/i })).toBeInTheDocument()
  })

  test('shows AVAILABLE badge when status is available', () => {
    render(<MachineDisplay status="available" machineId={1} />)
    expect(screen.getByTestId('status-badge-1')).toHaveTextContent('AVAILABLE')
  })

  test('shows IN USE badge when status is in_use', () => {
    render(<MachineDisplay status="in_use" machineId={2} />)
    expect(screen.getByTestId('status-badge-2')).toHaveTextContent('IN USE')
  })

  test('applies available class when available', () => {
    render(<MachineDisplay status="available" machineId={1} />)
    const display = screen.getByTestId('machine-display-1')
    expect(display.className).toContain('available')
  })

  test('applies inUse class when in use', () => {
    render(<MachineDisplay status="in_use" machineId={1} />)
    const display = screen.getByTestId('machine-display-1')
    expect(display.className).toContain('inUse')
  })

  test('renders different machine IDs correctly', () => {
    const { rerender } = render(<MachineDisplay status="available" machineId={1} />)
    expect(screen.getByTestId('status-badge-1')).toBeInTheDocument()

    rerender(<MachineDisplay status="in_use" machineId={3} />)
    expect(screen.getByTestId('status-badge-3')).toBeInTheDocument()
  })
})
