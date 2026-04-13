import { getTrades } from '@/lib/kv'
import { Trade, ChecklistItem } from '@/lib/types'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export const revalidate = 15

export default async function TradePage({ params }: { params: { id: string } }) {
  const trades = await getTrades()
  const trade  = trades.find(t => String(t.id) === params.id)
  if (!trade) notFound()

  const checklist = trade.checklist_json ?? {}
  const channels  = trade.channels_json  ?? {}
  const concerns  = trade.key_concerns   ?? []
  const allTps    = trade.all_tps        ?? []

  return (
    <main className="min-h-screen bg-black p-6 max-w-[1200px] mx-auto">

      <Link href="/" className="text-zinc-500 hover:text-zinc-300 text-sm flex items-center gap-1 mb-6 transition-colors">
        ← Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-white font-mono">{trade.symbol}</h1>
          <span className={`px-3 py-1 rounded-lg text-sm font-bold border ${
            trade.action === 'BUY'
              ? 'bg-green-400/15 text-green-400 border-green-400/30'
              : 'bg-red-400/15 text-red-400 border-red-400/30'
          }`}>{trade.action}</span>
          <OutcomeBadge outcome={trade.outcome} />
          <p className="text-zinc-500 text-sm">
            {new Date(trade.timestamp).toLocaleString('en-GB', {
              weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })} UTC
          </p>
        </div>
        <div className="text-right">
          <div className={`text-5xl font-bold ${
            trade.trust_score >= 70 ? 'text-green-400' :
            trade.trust_score >= 50 ? 'text-yellow-400' : 'text-red-400'
          }`}>{trade.trust_score}</div>
          <div className="text-zinc-500 text-xs uppercase tracking-wider">Trust Score</div>
        </div>
      </div>

      {/* Meta strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-4">
        <MetaCell label="Entry"   value={trade.entry_price?.toFixed(2) ?? '—'} />
        <MetaCell label="SL"      value={trade.sl?.toFixed(2) ?? '—'}  color="text-red-400" />
        <MetaCell label="TP1"     value={trade.tp1?.toFixed(2) ?? '—'} color="text-green-400" />
        <MetaCell label="Lot"     value={trade.lot_size?.toFixed(2) ?? '—'} />
        <MetaCell label="R:R"     value={trade.rr_ratio?.toFixed(2) ?? '—'} />
        <MetaCell label="Spread"  value={trade.spread_at_entry != null ? `${trade.spread_at_entry.toFixed(1)}p` : '—'} />
        <MetaCell label="Session" value={trade.session ?? '—'} />
        <MetaCell label="Magic"   value={trade.signal_magic?.toString() ?? '—'} mono />
      </div>

      {/* All TPs */}
      {allTps.length > 1 && (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">All TP Levels</p>
          <div className="flex flex-wrap gap-2">
            {allTps.map((tp, i) => (
              <span key={i} className="px-2 py-1 bg-zinc-800 rounded text-xs font-mono text-green-400">
                TP{i + 1}: {tp.toFixed(2)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Checklist + Market Context */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Checklist</p>
          <div className="space-y-1">
            {Object.entries(checklist).filter(([k]) => !k.startsWith('_')).map(([key, item]) => {
              const ci = item as ChecklistItem
              return (
                <div key={key} className="flex items-center justify-between py-1 border-b border-zinc-800/50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${ci.passed ? 'text-green-400' : 'text-zinc-600'}`}>
                      {ci.passed ? '✓' : '✗'}
                    </span>
                    <span className="text-zinc-300 text-xs">{key.replace(/_/g, ' ')}</span>
                    {ci.detail && <span className="text-zinc-600 text-xs">— {ci.detail}</span>}
                  </div>
                  <span className={`text-xs font-mono font-bold ml-2 ${ci.passed ? 'text-green-400' : 'text-zinc-600'}`}>
                    {ci.passed ? `+${ci.earned}` : `0/${ci.max}`}
                  </span>
                </div>
              )
            })}
          </div>
          {(checklist as any)._total != null && (
            <div className="mt-3 pt-3 border-t border-zinc-700 flex justify-between text-xs">
              <span className="text-zinc-500">Raw</span>
              <span className="font-mono text-zinc-300">{(checklist as any)._total}/{(checklist as any)._max}</span>
            </div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Market Context</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <CtxRow label="RSI (M5)"   value={trade.rsi_at_entry?.toFixed(1) ?? '—'}
              color={getRsiColor(trade.rsi_at_entry, trade.action)} />
            <CtxRow label="EMA Trend"  value={trade.ema_trend ?? '—'}
              color={getBiasColor(trade.ema_trend, trade.action)} />
            <CtxRow label="ADX"        value={trade.adx_at_entry?.toFixed(1) ?? '—'}
              color={(trade.adx_at_entry ?? 0) > 20 ? 'text-green-400' : 'text-yellow-400'} />
            <CtxRow label="H1 Bias"    value={trade.h1_bias ?? '—'}
              color={getBiasColor(trade.h1_bias, trade.action)} />
            <CtxRow label="H4 Bias"    value={trade.h4_bias ?? '—'}
              color={getBiasColor(trade.h4_bias, trade.action)} />
            <CtxRow label="DXY"        value={trade.dxy_alignment ?? '—'}
              color={trade.dxy_alignment === 'WITH' ? 'text-green-400' :
                     trade.dxy_alignment === 'AGAINST' ? 'text-red-400' : 'text-yellow-400'} />
            <CtxRow label="Entry Dev"  value={trade.deviation_pips != null ? `${trade.deviation_pips.toFixed(1)}p` : '—'}
              color={(trade.deviation_pips ?? 0) < 5 ? 'text-green-400' : 'text-yellow-400'} />
            <CtxRow label="Spread"     value={trade.spread_at_entry != null ? `${trade.spread_at_entry.toFixed(1)}p` : '—'}
              color={(trade.spread_at_entry ?? 0) < 25 ? 'text-green-400' : 'text-red-400'} />
          </div>
        </div>
      </div>

      {/* Channels */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 mb-4">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Channel Consensus</p>
        {Object.keys(channels).length === 0
          ? <p className="text-zinc-600 text-sm">No channel data</p>
          : (
            <div className="flex flex-wrap gap-3">
              {Object.entries(channels).map(([role, data]) => {
                const agreed = data?.action === trade.action
                return (
                  <div key={role} className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                    agreed ? 'bg-green-400/5 border-green-400/20'
                           : data?.action ? 'bg-red-400/5 border-red-400/20'
                                          : 'bg-zinc-800 border-zinc-700'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${agreed ? 'bg-green-400' : data?.action ? 'bg-red-400' : 'bg-zinc-600'}`} />
                    <span className="text-zinc-300 text-sm font-medium">{role}</span>
                    {data?.action && (
                      <span className={`text-xs font-bold ${agreed ? 'text-green-400' : 'text-red-400'}`}>{data.action}</span>
                    )}
                    {data?.age != null && (
                      <span className="text-zinc-600 text-xs">{formatAge(data.age)}</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}
      </div>

      {/* LLM */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">LLM Analysis</p>
          <p className="text-zinc-300 text-sm leading-relaxed">{trade.llm_reasoning ?? '—'}</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Suggestion</p>
          <p className="text-zinc-300 text-sm leading-relaxed">{trade.llm_suggestion ?? '—'}</p>
          {concerns.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Concerns</p>
              <ul className="space-y-1">
                {concerns.map((c, i) => (
                  <li key={i} className="text-yellow-400 text-xs flex gap-2"><span>⚠</span><span>{c}</span></li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Outcome */}
      {trade.outcome !== 'OPEN' && (
        <div className={`rounded-xl border p-5 ${
          trade.outcome === 'WIN' ? 'bg-green-400/5 border-green-400/20' : 'bg-red-400/5 border-red-400/20'
        }`}>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Outcome</p>
          <div className="flex flex-wrap gap-6">
            <OCell label="Result"      value={trade.outcome} bold
              color={trade.outcome === 'WIN' ? 'text-green-400' : 'text-red-400'} />
            <OCell label="Close Price" value={trade.close_price?.toFixed(2) ?? '—'} />
            <OCell label="Pips"
              value={trade.pips_gained != null ? `${trade.pips_gained >= 0 ? '+' : ''}${trade.pips_gained.toFixed(1)}` : '—'}
              color={(trade.pips_gained ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'} />
            <OCell label="PnL"
              value={trade.pnl != null ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}` : '—'}
              color={(trade.pnl ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'} />
            <OCell label="Reason"      value={trade.close_reason ?? '—'} />
          </div>
        </div>
      )}

      <div className="mt-4 text-center text-zinc-700 text-xs">
        Ticket: {trade.ticket ?? '—'} · Magic: {trade.signal_magic ?? '—'} · Signal age: {
          trade.signal_age_secs != null ? `${trade.signal_age_secs.toFixed(1)}s` : '—'
        }
      </div>
    </main>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getBiasColor(bias: string | null, action: string) {
  if (!bias) return 'text-zinc-400'
  const aligned = (action === 'BUY' && bias.includes('BULL')) || (action === 'SELL' && bias.includes('BEAR'))
  return aligned ? 'text-green-400' : 'text-red-400'
}

function getRsiColor(rsi: number | null, action: string) {
  if (rsi == null) return 'text-zinc-400'
  if (action === 'BUY'  && rsi >= 40 && rsi <= 65) return 'text-green-400'
  if (action === 'SELL' && rsi >= 35 && rsi <= 60) return 'text-green-400'
  if (rsi > 70 || rsi < 30) return 'text-red-400'
  return 'text-yellow-400'
}

function formatAge(secs: number) {
  if (secs < 60)  return `${secs.toFixed(0)}s ago`
  if (secs < 300) return `${(secs / 60).toFixed(0)}m ago`
  return 'older'
}

function MetaCell({ label, value, color, mono }: { label: string; value: string; color?: string; mono?: boolean }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-center">
      <p className="text-zinc-600 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`font-semibold text-sm ${color ?? 'text-zinc-200'} ${mono ? 'font-mono' : ''}`}>{value}</p>
    </div>
  )
}

function CtxRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-zinc-500 text-xs">{label}</span>
      <span className={`text-xs font-semibold font-mono ${color ?? 'text-zinc-300'}`}>{value}</span>
    </div>
  )
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const cls: Record<string, string> = {
    WIN: 'bg-green-400/10 text-green-400 border-green-400/20',
    LOSS: 'bg-red-400/10 text-red-400 border-red-400/20',
    OPEN: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  }
  return <span className={`px-2 py-0.5 rounded text-xs font-bold border ${cls[outcome] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>{outcome}</span>
}

function OCell({ label, value, color, bold }: { label: string; value: string; color?: string; bold?: boolean }) {
  return (
    <div>
      <p className="text-zinc-500 text-xs mb-0.5">{label}</p>
      <p className={`${bold ? 'text-lg font-bold' : 'text-sm font-semibold'} ${color ?? 'text-zinc-200'}`}>{value}</p>
    </div>
  )
}
