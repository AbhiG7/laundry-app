import { useMemo } from 'react'

export function useQRParam() {
  return useMemo(() => {
    const params = new URLSearchParams(window.location.search)
    const val = params.get('claim')
    const id = parseInt(val, 10)
    return !isNaN(id) && id >= 1 && id <= 3 ? id : null
  }, [])
}
