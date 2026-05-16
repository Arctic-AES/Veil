import { useContext } from 'react'
import { FlowContext } from '../state/FlowContext'

export function useFlow() {
  const ctx = useContext(FlowContext)
  if (!ctx) throw new Error('useFlow must be used inside <FlowProvider>')
  return ctx
}
