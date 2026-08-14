import { useEffect, useState } from 'react'

/**
 * `true` quando la tab del browser è in primo piano.
 * Serve a sospendere le animazioni delle orbite quando non si vedono (§7.1).
 */
export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(() =>
    typeof document === 'undefined' ? true : !document.hidden
  )

  useEffect(() => {
    const onChange = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  return visible
}
