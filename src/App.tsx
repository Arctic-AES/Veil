import TopBar from './components/layout/TopBar'
import EnvBanner from './components/layout/EnvBanner'
import Stepper from './components/layout/Stepper'
import Footer from './components/layout/Footer'
import QuizPage from './pages/QuizPage'
import MatchesPage from './pages/MatchesPage'
import VerifyPage from './pages/VerifyPage'
import ProvePage from './pages/ProvePage'
import { useFlow } from './hooks/useFlow'

function Stage() {
  const { state } = useFlow()
  const isLanding = state.step === 1
  return (
    <main
      style={
        isLanding
          ? { flex: 1, padding: 0 }
          : {
              flex: 1,
              maxWidth: 1180,
              width: '100%',
              margin: '0 auto',
              padding: '32px 28px 60px',
            }
      }
    >
      {state.step === 1 && <QuizPage />}
      {state.step === 2 && <MatchesPage />}
      {state.step === 3 && <VerifyPage />}
      {state.step === 4 && <ProvePage />}
    </main>
  )
}

function Shell() {
  const { state } = useFlow()
  const isLanding = state.step === 1
  return (
    <>
      <EnvBanner />
      {!isLanding && <TopBar />}
      {!isLanding && <Stepper />}
      <Stage />
      {!isLanding && <Footer />}
    </>
  )
}

export default function App() {
  return <Shell />
}
