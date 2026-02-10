-- =============================================
-- 갤러리 개선 마이그레이션
-- 실행일: 2026-02-09
-- =============================================

-- 1. gallery 테이블에 width, height 컬럼 추가
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS width integer;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS height integer;

-- 2. gallery 테이블에 type 컬럼 추가 (image 또는 video)
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS type text DEFAULT 'image';
-- 기존 video_url이 있는 항목은 type을 'video'로 업데이트
UPDATE gallery SET type = 'video' WHERE video_url IS NOT NULL AND video_url != '';

-- 2. site_settings 테이블 생성 (그리드 컬럼 등 사이트 설정용)
CREATE TABLE IF NOT EXISTS site_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. 기본 그리드 설정 삽입
INSERT INTO site_settings (key, value) VALUES 
  ('gallery_columns', '{"mobile": 1, "tablet": 2, "desktop": 4, "wide": 5}')
ON CONFLICT (key) DO NOTHING;

-- 4. site_settings RLS 설정
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- 조회는 누구나 가능
CREATE POLICY "Allow public read for site_settings" 
  ON site_settings FOR SELECT USING (true);

-- 수정은 인증된 사용자만 (테스트용으로 모두 허용)
CREATE POLICY "Allow all for site_settings" 
  ON site_settings FOR ALL USING (true);

-- 5. categories 테이블에 show_in_all 컬럼 추가 (All 탭 포함 여부)
ALTER TABLE categories ADD COLUMN IF NOT EXISTS show_in_all boolean DEFAULT true;
