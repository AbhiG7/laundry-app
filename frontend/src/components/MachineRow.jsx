import { useState } from 'react'
import MachineDisplay from './MachineDisplay'
import UserCard from './UserCard'
import ClaimDialog from './ClaimDialog'
import styles from './MachineRow.module.css'

export default function MachineRow({ machine, onClaim, onRelease, autoOpenDialog }) {
  const [dialogOpen, setDialogOpen] = useState(autoOpenDialog ?? false)

  const handleClaimSubmit = async (formData) => {
    await onClaim(machine.id, formData)
    setDialogOpen(false)
  }

  return (
    <>
      <div
        className={`${styles.row} ${machine.status === 'in_use' ? styles.rowInUse : ''}`}
        data-testid={`machine-row-${machine.id}`}
      >
        <span className={styles.machineNumber}>Machine {machine.id}</span>
        <div className={styles.content}>
          <MachineDisplay status={machine.status} machineId={machine.id} />
          <UserCard
            machine={machine}
            onClaimClick={() => setDialogOpen(true)}
            onRelease={onRelease}
          />
        </div>
      </div>

      <ClaimDialog
        open={dialogOpen}
        machineId={machine.id}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleClaimSubmit}
      />
    </>
  )
}
