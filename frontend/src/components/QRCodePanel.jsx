import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import styles from './QRCodePanel.module.css'

export default function QRCodePanel() {
  const [expanded, setExpanded] = useState(false)
  const baseUrl = window.location.origin

  return (
    <div className={styles.panel} data-testid="qr-panel">
      <h2 className={styles.title}>QR Codes</h2>
      <p className={styles.subtitle}>Print and post these to let residents claim machines directly</p>

      <div className={styles.toggle}>
        <button className={styles.toggleBtn} onClick={() => setExpanded(e => !e)}>
          {expanded ? '▲ Hide QR Codes' : '▼ Show QR Codes'}
        </button>
      </div>

      {expanded && (
        <div className={styles.codes}>
          {[1, 2, 3].map(id => (
            <div key={id} className={styles.qrItem}>
              <div className={styles.qrWrapper}>
                <QRCodeSVG
                  value={`${baseUrl}/?claim=${id}`}
                  size={128}
                  level="M"
                  data-testid={`qr-code-${id}`}
                />
              </div>
              <span className={styles.qrLabel}>Machine {id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
