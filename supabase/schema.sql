-- 1. 이미지 메타데이터 테이블 생성
-- 이 테이블은 업로드된 이미지의 제목, URL, 카테고리 기적을 저장합니다.
create table public.gallery (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  src text not null,
  category text not null,
  video_url text, -- 유튜브 등 영상 URL (선택 사항)
  aspect_ratio float default 1.0, -- 이미지 가로/세로 비율 추가
  display_order integer default 0 -- 정렬 순서 (숫자가 클수록 혹은 작을수록 먼저 나오게 설정 가능)
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

-- 관리자 계정 테이블
CREATE TABLE admin_users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 시드 데이터 (초기 관리자: admin / password123)
-- 주의: 실제 운영 환경에서는 bcrypt 등으로 해싱된 값을 넣어야 합니다.
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', 'password123');

-- RLS (Row Level Security) 설정
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 익명 사용자는 조회만 가능
CREATE POLICY "Allow public read-only access for gallery" ON gallery FOR SELECT USING (true);
CREATE POLICY "Allow public read-only access for banners" ON banners FOR SELECT USING (true);

-- 관리자용 정책 (단순화를 위해 모든 작업 허용 - 실제로는 auth.uid() 체크 필요)
CREATE POLICY "Allow all for authenticated users" ON gallery FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON banners FOR ALL USING (true);
CREATE POLICY "Allow all for admin_users" ON admin_users FOR SELECT USING (true);
