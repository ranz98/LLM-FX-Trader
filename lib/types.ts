export interface ChecklistItem {
  passed: boolean
  earned: number
  max: number
  detail: string
}

export interface ChannelData {
  action: string | null
  age: number | null
}

export interface Trade {
  id: number
  timestamp: string
  symbol: string
  action: string
  entry_price: number | null
  sl: number | null
  tp1: number | null
  all_tps: number[] | null
  lot_size: number | null
  trust_score: number
  llm_reasoning: string | null
  llm_suggestion: string | null
  key_concerns: string[] | null
  checklist_json: Record<string, ChecklistItem> | null
  channels_json: Record<string, ChannelData> | null
  session: string | null
  spread_at_entry: number | null
  rsi_at_entry: number | null
  ema_trend: string | null
  adx_at_entry: number | null
  h1_bias: string | null
  h4_bias: string | null
  dxy_alignment: string | null
  deviation_pips: number | null
  ticket: number | null
  signal_magic: number | null
  outcome: string
  close_price: number | null
  pips_gained: number | null
  pnl: number | null
  close_reason: string | null
  close_time: string | null
  signal_age_secs: number | null
  rr_ratio: number | null
}
