import styles from './MachineDisplay.module.css'

export default function MachineDisplay({ status, machineId }) {
  const isInUse = status === 'in_use'

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.machine} ${isInUse ? styles.inUse : styles.available}`}
        data-testid={`machine-display-${machineId}`}
        aria-label={`Machine ${machineId} is ${isInUse ? 'in use' : 'available'}`}
      >
        <img src="/machine.svg" alt={`Washing machine ${machineId}`} />
      </div>
      <span
        className={`${styles.statusBadge} ${isInUse ? styles.badgeInUse : styles.badgeAvailable}`}
        data-testid={`status-badge-${machineId}`}
      >
        {isInUse ? 'IN USE' : 'AVAILABLE'}
      </span>
    </div>
  )
}
