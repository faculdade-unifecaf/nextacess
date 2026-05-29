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
CREATE POLICY "facial_public_read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'facial-fotos');

-- ── 3. Adiciona colunas de URL na tabela facial_cadastros ──────
ALTER TABLE facial_cadastros ADD COLUMN IF NOT EXISTS foto_url_normal  TEXT;
ALTER TABLE facial_cadastros ADD COLUMN IF NOT EXISTS foto_url_proxima TEXT;

-- foto_base64 pode ficar como coluna legada (não é mais usada)
-- Remova depois que todos os usuários recadastrarem:
-- ALTER TABLE facial_cadastros DROP COLUMN IF EXISTS foto_base64;
