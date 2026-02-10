-- =============================================
-- VR 콘텐츠 테이블 마이그레이션
-- 실행일: 2026-02-10
-- =============================================

-- 1. vr_contents 테이블 생성
CREATE TABLE IF NOT EXISTS vr_contents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  thumbnail_url text NOT NULL,
  link_url text NOT NULL,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. RLS 설정
ALTER TABLE vr_contents ENABLE ROW LEVEL SECURITY;

-- 3. 정책 설정
-- 조회는 누구나 가능
CREATE POLICY "Allow public read for vr_contents" 
  ON vr_contents FOR SELECT USING (true);

-- 모든 작업은 인증된 사용자만 (테스트용으로 일단 모두 허용, 필요시 관리자 권한 체크 추가)
CREATE POLICY "Allow all for authenticated users on vr_contents" 
  ON vr_contents FOR ALL USING (true);
