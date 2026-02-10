-- ============================================
-- 카테고리 테이블 마이그레이션
-- Supabase Dashboard > SQL Editor에서 실행
-- ============================================

-- 1. categories 테이블 생성
CREATE TABLE public.categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. RLS 설정
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow all for authenticated" ON categories FOR ALL USING (true);

-- 3. 기존 카테고리 데이터 마이그레이션
INSERT INTO categories (name, display_order) VALUES 
  ('Exterior', 1), 
  ('Interior', 2)
ON CONFLICT (name) DO NOTHING;

-- 4. gallery 테이블에 category_id 컬럼 추가
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id);

-- 5. 기존 데이터 마이그레이션 (category → category_id)
UPDATE gallery 
SET category_id = (SELECT id FROM categories WHERE name = gallery.category)
WHERE category_id IS NULL;

-- 6. 기존 category 컬럼 제거 (데이터 확인 후 실행 권장)
-- 주의: 이 명령어는 되돌릴 수 없습니다. 마이그레이션 확인 후 실행하세요.
-- ALTER TABLE gallery DROP COLUMN category;
