import { getTrades } from '@/lib/kv'
import { Trade } from '@/lib/types'
import Link from 'next/link'

export const revalidate = 30

export default async function Home() {
  const trades = await getTrades()

  const closed   = trades.filter(t => t.outcome !== 'OPEN')
  const wins     = closed.filter(t => t.outcome === 'WIN').length
  const losses   = closed.filter(t => t.outcome === 'LOSS').length
  const winRate  = closed.length > 0 ? Math.round((wins / closed.length) * 100) : 0
  const totalPnl = trades.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const totalPips = trades.reduce((s, t) => s + (t.pips_gained ?? 0), 0)

  return (
    <main className="min-h-screen bg-black p-6 max-w-[1400px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">FXAdvance</h1>
          <p className="text-zinc-500 text-sm mt-0.5">Signal Analytics Dashboard</p>
        </div>
        <div className="flex items-center gap-2 text-sm bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-zinc-400">Live · syncs every 30s</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        <StatCard label="Total Trades" value={String(trades.length)} />
        <StatCard label="Win / Loss"   value={`${wins} / ${losses}`} />
        <StatCard label="Win Rate"     value={`${winRate}%`}
          color={winRate >= 60 ? 'text-green-400' : winRate >= 45 ? 'text-yellow-400' : 'text-red-400'} />
        <StatCard label="Total PnL"    value={`${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`}
          color={totalPnl >= 0 ? 'text-green-400' : 'text-red-400'} />
        <StatCard label="Total Pips"   value={`${totalPips >= 0 ? '+' : ''}${totalPips.toFixed(1)}`}
          color={totalPips >= 0 ? 'text-green-400' : 'text-red-400'} />
      </div>

      {/* Table */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-800 flex justify-between items-center">
          <span className="text-sm font-medium text-zinc-300">All Signals</span>
          <span className="text-xs text-zinc-600">{trades.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Symbol</th>
                <th className="text-left px-5 py-3">Dir</th>
                <th className="text-left px-5 py-3">Entry</th>
                <th className="text-left px-5 py-3">Score</th>
                <th className="text-left px-5 py-3">Channels</th>
                <th className="text-left px-5 py-3">Market</th>
                <th className="text-left px-5 py-3">Outcome</th>
                <th className="text-right px-5 py-3">Pips</th>
                <th className="text-right px-5 py-3">PnL</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <tr key={trade.id} className="border-b border-zinc-800/40 hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-5 py-3 text-zinc-400 whitespace-nowrap text-xs">
                    {new Date(trade.timestamp).toLocaleString('en-GB', {
                      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="px-5 py-3 font-mono font-semibold text-white">{trade.symbol}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${
                      trade.action === 'BUY'
                        ? 'bg-green-400/10 text-green-400 border-green-400/20'
                        : 'bg-red-400/10 text-red-400 border-red-400/20'
                    }`}>{trade.action}</span>
                  </td>
                  <td className="px-5 py-3 font-mono text-zinc-300 text-xs">
                    {trade.entry_price?.toFixed(2) ?? '—'}
                  </td>
                  <td className="px-5 py-3"><ScoreBadge score={trade.trust_score} /></td>
                  <td className="px-5 py-3">
                    <ChannelDots channels={trade.channels_json} action={trade.action} />
                  </td>
                  <td className="px-5 py-3">
                    <MarketSnippet trade={trade} />
                  </td>
                  <td className="px-5 py-3"><OutcomeBadge outcome={trade.outcome} /></td>
                  <td className={`px-5 py-3 text-right font-mono text-xs ${
                    (trade.pips_gained ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.pips_gained != null
                      ? `${trade.pips_gained >= 0 ? '+' : ''}${trade.pips_gained.toFixed(1)}`
                      : '—'}
                  </td>
                  <td className={`px-5 py-3 text-right font-mono text-xs font-semibold ${
                    (trade.pnl ?? 0) >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {trade.pnl != null
                      ? `${trade.pnl >= 0 ? '+' : ''}$${trade.pnl.toFixed(2)}`
                      : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <Link href={`/trade/${trade.id}`}
                      className="text-blue-400 hover:text-blue-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                      Details →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {trades.length === 0 && (
          <div className="text-center py-20 text-zinc-600">
            <p className="text-lg">No trades yet</p>
            <p className="text-sm mt-1">Signals will appear once the bot places trades</p>
          </div>
        )}
      </div>
    </main>
  )
}

function StatCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
      <p className="text-zinc-500 text-xs uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-xl font-bold ${color ?? 'text-white'}`}>{value}</p>
    </div>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const cls = score >= 70 ? 'bg-green-400/10 text-green-400 border-green-400/20'
            : score >= 50 ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20'
            :               'bg-red-400/10 text-red-400 border-red-400/20'
  return <span className={`px-2 py-0.5 rounded text-xs font-bold border ${cls}`}>{score}</span>
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const cls: Record<string, string> = {
    WIN:       'bg-green-400/10 text-green-400 border-green-400/20',
    LOSS:      'bg-red-400/10 text-red-400 border-red-400/20',
    OPEN:      'bg-blue-400/10 text-blue-400 border-blue-400/20',
    BREAKEVEN: 'bg-zinc-400/10 text-zinc-400 border-zinc-400/20',
  }
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-bold border ${cls[outcome] ?? 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
      {outcome}
    </span>
  )
}

function ChannelDots({ channels, action }: { channels: Trade['channels_json']; action: string }) {
  if (!channels) return <span className="text-zinc-600 text-xs">—</span>
  return (
    <div className="flex gap-1.5 items-center">
      {Object.entries(channels).map(([role, data]) => (
        <span key={role} title={`${role}: ${data?.action ?? '?'}`}
          className={`w-2 h-2 rounded-full ${data?.action === action ? 'bg-green-400' : 'bg-red-400'}`} />
      ))}
    </div>
  )
}

function MarketSnippet({ trade }: { trade: Trade }) {
  const parts: string[] = []
  if (trade.rsi_at_entry != null) parts.push(`RSI ${trade.rsi_at_entry.toFixed(0)}`)
  if (trade.ema_trend) parts.push(trade.ema_trend)
  if (trade.h1_bias)   parts.push(`H1:${trade.h1_bias.replace('_BULL','↑').replace('_BEAR','↓')}`)
  return <span className="text-zinc-500 text-xs">{parts.join(' · ') || '—'}</span>
}
