const DEFAULT_PROOF_SERVER = 'http://localhost:6300'

export type ProofServerStatus = 'online' | 'offline'

export async function checkProofServer(
  baseUrl = import.meta.env.VITE_PROOF_SERVER_URL?.trim() || DEFAULT_PROOF_SERVER,
): Promise<ProofServerStatus> {
  try {
    const res = await fetch(baseUrl, { method: 'GET', signal: AbortSignal.timeout(2000) })
    return res.ok || res.status === 404 ? 'online' : 'offline'
  } catch {
    return 'offline'
  }
}

export async function getProofServerHint(): Promise<string> {
  const status = await checkProofServer()
  if (status === 'online') {
    return 'Midnight proof server reachable at localhost:6300 (configure Lace → Settings → Midnight → Local).'
  }
  return 'Proof server not detected. Circuit + proofData still run locally; start Docker proof server for full ZK proving.'
}
