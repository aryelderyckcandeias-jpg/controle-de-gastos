BEGIN;

-- ============================================================
-- 1. Preparar tabela de usuários para autenticação
-- ============================================================

ALTER TABLE usuarios
ADD COLUMN IF NOT EXISTS senha_hash TEXT;


-- ============================================================
-- 2. Preparar gastos para pertencerem a um usuário
-- ============================================================

ALTER TABLE gastos
ADD COLUMN IF NOT EXISTS usuario_id INTEGER;


-- ============================================================
-- 3. Criar índice para consultas futuras por usuário
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_gastos_usuario_id
ON gastos(usuario_id);


-- ============================================================
-- 4. Garantir que o usuário Admin exista
-- ============================================================

INSERT INTO usuarios (nome, email)
VALUES ('Admin', 'admin@email.com')
ON CONFLICT (email) DO NOTHING;


-- ============================================================
-- 5. Associar gastos antigos ao Admin
-- ============================================================

UPDATE gastos
SET usuario_id = (
    SELECT id
    FROM usuarios
    WHERE email = 'admin@email.com'
)
WHERE usuario_id IS NULL;


-- ============================================================
-- 6. Criar relacionamento entre gastos e usuários
-- ============================================================

DO $$
BEGIN

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'gastos_usuario_id_fkey'
    ) THEN

        ALTER TABLE gastos
        ADD CONSTRAINT gastos_usuario_id_fkey
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE;

    END IF;

END $$;


-- ============================================================
-- 7. Agora que os dados antigos foram associados,
--    usuario_id pode ser obrigatório
-- ============================================================

ALTER TABLE gastos
ALTER COLUMN usuario_id SET NOT NULL;


COMMIT;