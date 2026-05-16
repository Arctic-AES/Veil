import TopBar from './components/layout/TopBar'
import Stepper from './components/layout/Stepper'
import Footer from './components/layout/Footer'
import QuizPage from './pages/QuizPage'
import MatchesPage from './pages/MatchesPage'
import VerifyPage from './pages/VerifyPage'
import ProvePage from './pages/ProvePage'
import { useFlow } from './hooks/useFlow'

function Stage() {
  const { state } = useFlow()
  return (
    <main
      style={{
        flex: 1,
        maxWidth: 1180,
        width: '100%',
        margin: '0 auto',
        padding: '32px 28px 60px',
      }}
    >
      {state.step === 1 && <QuizPage />}
      {state.step === 2 && <MatchesPage />}
      {state.step === 3 && <VerifyPage />}
      {state.step === 4 && <ProvePage />}
    </main>
  )
}

export default function App() {
  return (
    <>
      <TopBar />
      <Stepper />
      <Stage />
      <Footer />
    </>
  )
}
