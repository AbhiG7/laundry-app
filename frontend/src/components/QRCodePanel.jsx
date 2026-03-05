import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import styles from './QRCodePanel.module.css'

const WASHERS = [1, 2, 3]
const DRYERS = [4, 5, 6]

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
        <div className={styles.sections}>
          <div className={styles.section}>
            <h3 className={styles.sectionHeader}>WASHERS</h3>
            <div className={styles.codes}>
              {WASHERS.map((id, idx) => (
                <div key={id} className={styles.qrItem}>
                  <div className={styles.qrWrapper}>
                    <QRCodeSVG
                      value={`${baseUrl}/?claim=${id}`}
                      size={110}
                      level="M"
                      data-testid={`qr-code-${id}`}
                    />
                  </div>
                  <span className={styles.qrLabel}>Washer {idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.section}>
            <h3 className={styles.sectionHeader}>DRYERS</h3>
            <div className={styles.codes}>
              {DRYERS.map((id, idx) => (
                <div key={id} className={styles.qrItem}>
                  <div className={styles.qrWrapper}>
                    <QRCodeSVG
                      value={`${baseUrl}/?claim=${id}`}
                      size={110}
                      level="M"
                      data-testid={`qr-code-${id}`}
                    />
                  </div>
                  <span className={styles.qrLabel}>Dryer {idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
