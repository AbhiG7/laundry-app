import { useCallback, useEffect, useState } from 'react'
import { useMachines } from './hooks/useMachines'
import { useWebSocket } from './hooks/useWebSocket'
import { useQRParam } from './hooks/useQRParam'
import MachineRow from './components/MachineRow'
import QRCodePanel from './components/QRCodePanel'
import './styles/global.css'
import './styles/animations.css'
import appStyles from './App.module.css'

export default function App() {
  const { machines, dispatch, claimMachine, releaseMachine } = useMachines()
  const claimFromQR = useQRParam()

  // Handle WebSocket messages
  const handleWSMessage = useCallback((msg) => {
    switch (msg.type) {
      case 'init':
        dispatch({ type: 'INIT', machines: msg.machines })
        break
      case 'machine_update':
        dispatch({ type: 'UPDATE', machine: msg.machine })
        break
      case 'machine_released':
        dispatch({ type: 'RELEASED', machineId: msg.machine_id })
        break
    }
  }, [dispatch])

  useWebSocket(handleWSMessage)

  const handleClaim = useCallback(async (id, formData) => {
    await claimMachine(id, formData)
  }, [claimMachine])

  const handleRelease = useCallback(async (id) => {
    await releaseMachine(id)
  }, [releaseMachine])

  return (
    <div className={appStyles.app}>
      <header className={appStyles.header}>
        <div className={appStyles.headerContent}>
          <div className={appStyles.logo}>🫧</div>
          <div>
            <h1 className={appStyles.title}>Laundry Tracker</h1>
            <p className={appStyles.subtitle}>Building Laundry Room Status</p>
          </div>
          <div className={appStyles.statusLight} aria-label="System active" />
        </div>
      </header>

      <main className={appStyles.main}>
        {machines.length === 0 ? (
          <div className={appStyles.loading}>
            <span className={appStyles.loadingDot}>●</span>
            <span>Connecting...</span>
          </div>
        ) : (
          <div className={appStyles.machineList}>
            {machines.map(machine => (
              <MachineRow
                key={machine.id}
                machine={machine}
                onClaim={handleClaim}
                onRelease={handleRelease}
                autoOpenDialog={claimFromQR === machine.id && machine.status === 'available'}
              />
            ))}
          </div>
        )}

        <QRCodePanel />
      </main>

      <footer className={appStyles.footer}>
        <p>© {new Date().getFullYear()} Building Laundry Tracker</p>
      </footer>
    </div>
  )
}
