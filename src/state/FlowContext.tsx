import { createContext, useReducer, type ReactNode, type Dispatch } from 'react'
import {
  flowReducer,
  initialFlowState,
  type FlowState,
  type FlowAction,
} from './flowReducer'

type FlowContextValue = {
  state: FlowState
  dispatch: Dispatch<FlowAction>
}

export const FlowContext = createContext<FlowContextValue | null>(null)

export function FlowProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(flowReducer, initialFlowState)
  return (
    <FlowContext.Provider value={{ state, dispatch }}>
      {children}
    </FlowContext.Provider>
  )
}
