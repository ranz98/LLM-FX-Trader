-- Run this in your Supabase SQL editor (supabase.com → project → SQL Editor)

create table if not exists trades (
  id              bigint primary key,
  timestamp       text,
  symbol          text,
  action          text,
  entry_price     float8,
  sl              float8,
  tp1             float8,
  all_tps         jsonb,
  lot_size        float8,
  trust_score     int,
  llm_reasoning   text,
  llm_suggestion  text,
  key_concerns    jsonb,
  checklist_json  jsonb,
  channels_json   jsonb,
  session         text,
  spread_at_entry float8,
  rsi_at_entry    float8,
  ema_trend       text,
  adx_at_entry    float8,
  h1_bias         text,
  h4_bias         text,
  dxy_alignment   text,
  deviation_pips  float8,
  ticket          bigint unique,
  signal_magic    bigint,
  outcome         text default 'OPEN',
  close_price     float8,
  pips_gained     float8,
  pnl             float8,
  close_reason    text,
  close_time      text,
  signal_age_secs float8,
  rr_ratio        float8
);

-- Allow public read (dashboard is read-only)
alter table trades enable row level security;
create policy "Public read" on trades for select using (true);

-- Allow insert/update via anon key (your Python bot)
create policy "Anon upsert" on trades for insert with check (true);
create policy "Anon update" on trades for update using (true);
