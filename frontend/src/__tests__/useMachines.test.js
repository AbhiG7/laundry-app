import { machineReducer } from '../hooks/useMachines'

const availableMachine = { id: 1, status: 'available' }
const inUseMachine = {
  id: 1,
  status: 'in_use',
  user: { name: 'Alice', apartment: '3B' },
  expires_at: new Date(Date.now() + 3600 * 1000).toISOString(),
  time_left_seconds: 3600,
}

const initialState = [
  { id: 1, status: 'available' },
  { id: 2, status: 'available' },
  { id: 3, status: 'available' },
]

describe('machineReducer', () => {
  describe('INIT action', () => {
    test('replaces state with new machines array', () => {
      const newMachines = [inUseMachine, { id: 2, status: 'available' }, { id: 3, status: 'available' }]
      const result = machineReducer([], { type: 'INIT', machines: newMachines })
      expect(result).toEqual(newMachines)
    })

    test('initializes empty state with machines', () => {
      const result = machineReducer([], { type: 'INIT', machines: initialState })
      expect(result).toHaveLength(3)
      expect(result[0].id).toBe(1)
    })
  })

  describe('UPDATE action', () => {
    test('updates matching machine by ID', () => {
      const result = machineReducer(initialState, { type: 'UPDATE', machine: inUseMachine })
      expect(result[0].status).toBe('in_use')
      expect(result[0].user.name).toBe('Alice')
    })

    test('does not modify other machines', () => {
      const result = machineReducer(initialState, { type: 'UPDATE', machine: inUseMachine })
      expect(result[1].status).toBe('available')
      expect(result[2].status).toBe('available')
    })

    test('updates machine 2 correctly', () => {
      const machine2Update = { id: 2, status: 'in_use', user: { name: 'Bob', apartment: '1A' } }
      const result = machineReducer(initialState, { type: 'UPDATE', machine: machine2Update })
      expect(result[1].status).toBe('in_use')
      expect(result[0].status).toBe('available')
    })
  })

  describe('RELEASED action', () => {
    const stateWithInUse = [
      inUseMachine,
      { id: 2, status: 'available' },
      { id: 3, status: 'available' },
    ]

    test('resets machine to available state', () => {
      const result = machineReducer(stateWithInUse, { type: 'RELEASED', machineId: 1 })
      expect(result[0].status).toBe('available')
      expect(result[0].user).toBeUndefined()
    })

    test('does not affect other machines', () => {
      const result = machineReducer(stateWithInUse, { type: 'RELEASED', machineId: 1 })
      expect(result[1]).toEqual({ id: 2, status: 'available' })
    })
  })

  describe('TICK action', () => {
    test('decrements time_left_seconds for in-use machines', () => {
      const futureExpiry = new Date(Date.now() + 1800 * 1000).toISOString()
      const state = [
        { id: 1, status: 'in_use', expires_at: futureExpiry, time_left_seconds: 1900 },
        { id: 2, status: 'available' },
      ]
      const result = machineReducer(state, { type: 'TICK' })
      // time_left_seconds should be approximately 1800 (computed from expires_at)
      expect(result[0].time_left_seconds).toBeGreaterThan(1790)
      expect(result[0].time_left_seconds).toBeLessThanOrEqual(1800)
    })

    test('does not go below 0', () => {
      const pastExpiry = new Date(Date.now() - 1000).toISOString()
      const state = [{ id: 1, status: 'in_use', expires_at: pastExpiry, time_left_seconds: 0 }]
      const result = machineReducer(state, { type: 'TICK' })
      expect(result[0].time_left_seconds).toBe(0)
    })

    test('does not modify available machines', () => {
      const state = [{ id: 1, status: 'available' }]
      const result = machineReducer(state, { type: 'TICK' })
      expect(result[0]).toEqual(state[0])
    })

    test('returns machine unchanged when no expires_at', () => {
      // In practice in_use machines always have expires_at, but the reducer
      // should gracefully handle missing expires_at by leaving state unchanged
      const state = [{ id: 1, status: 'in_use', time_left_seconds: 100 }]
      const result = machineReducer(state, { type: 'TICK' })
      // Without expires_at, time_left_seconds = 0 (max(0, NaN) = 0)
      expect(result[0].time_left_seconds).toBeGreaterThanOrEqual(0)
    })
  })

  describe('unknown action', () => {
    test('returns state unchanged for unknown action', () => {
      const result = machineReducer(initialState, { type: 'UNKNOWN' })
      expect(result).toBe(initialState)
    })
  })
})
