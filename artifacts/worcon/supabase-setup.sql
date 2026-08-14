-- Worcon Supabase 初始化脚本
-- 在 Supabase 控制台 → SQL Editor 里整段运行一次即可

-- 聊天历史
create table if not exists public.messages (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;
drop policy if exists "own messages" on public.messages;
create policy "own messages" on public.messages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index if not exists messages_user_created on public.messages (user_id, created_at);

-- 偏好记忆（mem 对象整体存 JSON）
create table if not exists public.preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  mem jsonb not null default '{}',
  updated_at timestamptz not null default now()
);
alter table public.preferences enable row level security;
drop policy if exists "own preferences" on public.preferences;
create policy "own preferences" on public.preferences
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
