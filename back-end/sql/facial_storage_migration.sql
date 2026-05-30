-- ══════════════════════════════════════════════════════════════
--  NextAccess — Facial Storage Migration
--  Rode no SQL Editor do Supabase
-- ══════════════════════════════════════════════════════════════

-- ── 1. Cria bucket público para as fotos faciais ───────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'facial-fotos',
  'facial-fotos',
  true,
  5242880,  -- 5 MB por foto
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- ── 2. Política: leitura pública (IoT baixa sem autenticação) ──
DROP POLICY IF EXISTS "facial_public_read" ON storage.objects;
CREATE POLICY "facial_public_read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'facial-fotos');

-- ── 3. Corrige coluna legada e adiciona colunas de URL ────────
ALTER TABLE facial_cadastros ALTER COLUMN foto_base64 DROP NOT NULL;
ALTER TABLE facial_cadastros ADD COLUMN IF NOT EXISTS foto_url_normal  TEXT;
ALTER TABLE facial_cadastros ADD COLUMN IF NOT EXISTS foto_url_proxima TEXT;
