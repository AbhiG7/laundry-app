import { useReducer, useEffect, useCallback } from 'react'

export function machineReducer(state, action) {
  switch (action.type) {
    case 'INIT':
      return action.machines
    case 'UPDATE': {
      const updated = action.machine
      return state.map(m => m.id === updated.id ? { ...m, ...updated } : m)
    }
    case 'RELEASED': {
      const { machineId } = action
      return state.map(m =>
        m.id === machineId
          ? { id: m.id, status: 'available' }
          : m
      )
    }
    case 'TICK':
      return state.map(m => {
        if (m.status !== 'in_use' || !m.expires_at) return m
        const remaining = Math.max(
          0,
          Math.floor((new Date(m.expires_at) - Date.now()) / 1000)
        )
        return { ...m, time_left_seconds: remaining }
      })
    default:
      return state
  }
}

export function useMachines() {
  const [machines, dispatch] = useReducer(machineReducer, [])

  // Initial fetch
  useEffect(() => {
    fetch('/api/machines')
      .then(r => r.json())
      .then(data => dispatch({ type: 'INIT', machines: data }))
      .catch(err => console.error('Failed to fetch machines:', err))
  }, [])

  // Local 1-second tick for smooth countdown
  useEffect(() => {
    const id = setInterval(() => dispatch({ type: 'TICK' }), 1000)
    return () => clearInterval(id)
  }, [])

  const claimMachine = useCallback(async (id, formData) => {
    const res = await fetch(`/api/machines/${id}/claim`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to claim machine')
    }
    const machine = await res.json()
    dispatch({ type: 'UPDATE', machine })
    return machine
  }, [])

  const releaseMachine = useCallback(async (id) => {
    const res = await fetch(`/api/machines/${id}/release`, { method: 'POST' })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || 'Failed to release machine')
    }
    const machine = await res.json()
    dispatch({ type: 'UPDATE', machine })
    return machine
  }, [])

  return { machines, dispatch, claimMachine, releaseMachine }
}
