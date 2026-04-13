import { Trade } from './types'

const KV_URL   = process.env.KV_REST_API_URL
const KV_TOKEN = process.env.KV_REST_API_TOKEN

export async function getTrades(): Promise<Trade[]> {
  if (!KV_URL || !KV_TOKEN) return []
  try {
    const res = await fetch(`${KV_URL}/get/fxa:trades`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      next: { revalidate: 30 },
    })
    if (!res.ok) return []
    const { result } = await res.json()
    if (!result) return []
    return typeof result === 'string' ? JSON.parse(result) : result
  } catch {
    return []
  }
}
