import { useEffect, useRef, useState } from 'react'
import { useFlow } from './useFlow'
import { searchTrials } from '../services/clinicalTrialsApi'

function searchKey(condition?: string, region?: string) {
  return `${condition ?? ''}|${region ?? ''}`
}

export function useTrialMatches() {
  const { state, dispatch } = useFlow()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState<number>(0)
  const [retryCount, setRetryCount] = useState(0)
  const fetchedKeyRef = useRef<string | null>(null)

  function retry() {
    fetchedKeyRef.current = null
    dispatch({ type: 'SET_TRIALS', trials: [] })
    setError(null)
    setRetryCount((n) => n + 1)
  }

  useEffect(() => {
    if (!state.quiz.condition) return

    const key = searchKey(state.quiz.condition, state.quiz.region)
    if (fetchedKeyRef.current === key) return

    let cancelled = false
    setLoading(true)
    setError(null)

    searchTrials({
      condition: state.quiz.condition,
      region: state.quiz.region,
    })
      .then(({ trials, totalCount }) => {
        if (cancelled) return
        fetchedKeyRef.current = key
        setTotalCount(totalCount)
        dispatch({ type: 'SET_TRIALS', trials })
      })
      .catch((e) => {
        if (cancelled) return
        fetchedKeyRef.current = key
        setError(e instanceof Error ? e.message : 'Search failed')
        dispatch({ type: 'SET_TRIALS', trials: [] })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [state.quiz.condition, state.quiz.region, dispatch, retryCount])

  return { trials: state.trials, loading, error, totalCount, retry }
}
