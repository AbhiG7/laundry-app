import { useState } from 'react'
import styles from './ClaimDialog.module.css'

const DURATION_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 45, label: '45 min' },
  { value: 60, label: '60 min' },
  { value: 75, label: '75 min' },
  { value: 90, label: '90 min' },
  { value: 120, label: '120 min' },
]

const initialForm = { name: '', apartment: '', duration_min: 60, phone: '' }

export default function ClaimDialog({ open, machineId, onClose, onSubmit }) {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  if (!open) return null

  const validate = () => {
    const errs = {}
    if (!form.name.trim()) errs.name = 'Name is required'
    if (!form.apartment.trim()) errs.apartment = 'Apartment is required'
    if (!form.duration_min) errs.duration_min = 'Duration is required'
    return errs
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === 'duration_min' ? parseInt(value, 10) : value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setLoading(true)
    try {
      await onSubmit({
        name: form.name.trim(),
        apartment: form.apartment.trim(),
        duration_min: form.duration_min,
        phone: form.phone.trim(),
      })
      setForm(initialForm)
      setErrors({})
    } catch (err) {
      setErrors({ submit: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setForm(initialForm)
    setErrors({})
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        data-testid="claim-dialog"
      >
        <div className={styles.header}>
          <h2 className={styles.title} id="dialog-title">
            Claim Machine {machineId}
          </h2>
          <button className={styles.closeBtn} onClick={handleClose} aria-label="Close dialog">✕</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="name">Your Name</label>
            <input
              id="name"
              name="name"
              className={`${styles.input} ${errors.name ? styles.error : ''}`}
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Alex Smith"
              autoFocus
              data-testid="input-name"
            />
            {errors.name && <span className={styles.errorText}>{errors.name}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="apartment">Apartment #</label>
            <input
              id="apartment"
              name="apartment"
              className={`${styles.input} ${errors.apartment ? styles.error : ''}`}
              value={form.apartment}
              onChange={handleChange}
              placeholder="e.g. 4B"
              data-testid="input-apartment"
            />
            {errors.apartment && <span className={styles.errorText}>{errors.apartment}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="duration_min">Wash Time</label>
            <select
              id="duration_min"
              name="duration_min"
              className={`${styles.select} ${errors.duration_min ? styles.error : ''}`}
              value={form.duration_min}
              onChange={handleChange}
              data-testid="select-duration"
            >
              {DURATION_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="phone">
              Phone # <span className={styles.optional}>(optional)</span>
            </label>
            <input
              id="phone"
              name="phone"
              className={styles.input}
              value={form.phone}
              onChange={handleChange}
              placeholder="e.g. 555-1234"
              type="tel"
              data-testid="input-phone"
            />
          </div>

          {errors.submit && (
            <div className={styles.errorText} style={{ marginBottom: '1rem' }}>
              {errors.submit}
            </div>
          )}

          <div className={styles.actions}>
            <button type="submit" className={styles.claimBtn} disabled={loading} data-testid="btn-claim-submit">
              {loading ? 'Claiming...' : '⚡ Claim Machine'}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={handleClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
