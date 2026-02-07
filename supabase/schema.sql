-- 1. 이미지 메타데이터 테이블 생성
-- 이 테이블은 업로드된 이미지의 제목, URL, 카테고리 기적을 저장합니다.
create table public.gallery (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  src text not null,
  category text not null
);

-- 2. 스토리지 버킷 생성
-- 'images'라는 이름의 퍼블릭 버킷을 생성합니다.
insert into storage.buckets (id, name, public) 
values ('images', 'images', true)
on conflict (id) do nothing;

-- 3. 스토리지 액세스 정책(RLS) 설정
-- 테스트 및 편의를 위해 익명 사용자의 조회/업로드/삭제를 모두 허용하는 정책입니다.
-- 실제 프로덕션 환경에서는 인증된 사용자만 가능하도록 조정하는 것이 좋습니다.

-- 모든 사용자에게 조회 허용
create policy "Public Access" on storage.objects for select using ( bucket_id = 'images' );

-- 모든 사용자에게 업로드 허용
create policy "Public Upload" on storage.objects for insert with check ( bucket_id = 'images' );

-- 모든 사용자에게 삭제 허용
create policy "Public Delete" on storage.objects for delete using ( bucket_id = 'images' );

-- 4. 메인 배너 테이블 생성
-- 홈페이지 최상단 슬라이드 이미지를 관리합니다.
create table public.banners (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,       -- 메인 제목 (예: Modern Serenity)
  description text,          -- 서브 설명 (예: Redefining contemporary living spaces)
  src text not null,         -- 이미지 URL
  display_order int default 0 -- 표시 순서
);

-- 배너 테이블 RLS 설정 (조회는 누구나, 나머지는 익명 허용 - 테스트용)
alter table public.banners enable row level security;
create policy "Allow public select" on public.banners for select using (true);
create policy "Allow public insert" on public.banners for insert with check (true);
create policy "Allow public update" on public.banners for update using (true);
create policy "Allow public delete" on public.banners for delete using (true);
