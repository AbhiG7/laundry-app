import styles from './UserCard.module.css'

function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function UserCard({ machine, onClaimClick, onRelease }) {
  const isInUse = machine.status === 'in_use'
  const timeLeft = machine.time_left_seconds ?? 0
  const isUrgent = isInUse && timeLeft > 0 && timeLeft <= 120

  if (!isInUse) {
    return (
      <div className={`${styles.card} ${styles.cardAvailable}`} data-testid={`user-card-${machine.id}`}>
        <p className={styles.availableText}>Machine is free!</p>
        <button
          className={styles.claimBtn}
          onClick={onClaimClick}
          data-testid={`claim-btn-${machine.id}`}
          aria-label={`Claim machine ${machine.id}`}
        >
          ▶ Claim
        </button>
      </div>
    )
  }

  const { user } = machine

  return (
    <div className={`${styles.card} ${styles.cardInUse}`} data-testid={`user-card-${machine.id}`}>
      <div className={styles.row}>
        <span className={styles.userLabel}>In use by</span>
        <span className={styles.userName} data-testid={`user-name-${machine.id}`}>
          {user?.name ?? 'Unknown'}
        </span>
      </div>

      <div className={styles.row}>
        <span className={styles.aptBadge}>
          🏢 Apt {user?.apartment ?? '—'}
        </span>
      </div>

      {user?.phone && (
        <div className={styles.row}>
          <span className={styles.phoneBadge}>
            📞 {user.phone}
          </span>
        </div>
      )}

      <hr className={styles.divider} />

      <div className={styles.row}>
        <span className={styles.countdownLabel}>Time remaining</span>
        <span
          className={`${styles.countdown} ${isUrgent ? styles.countdownUrgent : ''}`}
          data-testid={`countdown-${machine.id}`}
          aria-label={`${formatTime(timeLeft)} remaining`}
        >
          {timeLeft > 0 ? formatTime(timeLeft) : 'Done!'}
        </span>
      </div>

      <button
        className={styles.releaseBtn}
        onClick={() => onRelease(machine.id)}
        data-testid={`release-btn-${machine.id}`}
      >
        Release Machine
      </button>
    </div>
  )
}
