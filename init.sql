BEGIN;
 
 
-- ============================================================
-- TABELA: usuarios
-- ============================================================
 
CREATE TABLE IF NOT EXISTS usuarios (
 
    id SERIAL PRIMARY KEY,
 
    nome VARCHAR(100) NOT NULL,
 
    email VARCHAR(100) NOT NULL UNIQUE,
 
    senha_hash TEXT,
 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 
);
 
 
-- ============================================================
-- TABELA: categorias
-- ============================================================
 
CREATE TABLE IF NOT EXISTS categorias (
 
    id SERIAL PRIMARY KEY,
 
    nome VARCHAR(100) NOT NULL,
 
    cor VARCHAR(20) DEFAULT '#000000',
 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
 
);
 
 
-- ============================================================
-- TABELA: gastos
-- ============================================================
 
CREATE TABLE IF NOT EXISTS gastos (
 
    id SERIAL PRIMARY KEY,
 
    descricao VARCHAR(255) NOT NULL,
 
    valor NUMERIC(10,2) NOT NULL,
 
    data DATE NOT NULL,
 
    categoria_id INTEGER,
 
    usuario_id INTEGER NOT NULL,
 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
 
 
    CONSTRAINT gastos_categoria_id_fkey
        FOREIGN KEY (categoria_id)
        REFERENCES categorias(id),
 
 
    CONSTRAINT gastos_usuario_id_fkey
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE CASCADE
 
);
 
 
-- ============================================================
-- ÍNDICES
-- ============================================================
 
CREATE INDEX IF NOT EXISTS idx_gastos_usuario_id
ON gastos(usuario_id);
 
 
CREATE INDEX IF NOT EXISTS idx_gastos_categoria_id
ON gastos(categoria_id);
 
 
CREATE INDEX IF NOT EXISTS idx_gastos_data
ON gastos(data);
 
 
-- ============================================================
-- USUÁRIO ADMINISTRATIVO INICIAL
-- ============================================================
 
INSERT INTO usuarios (
 
    nome,
    email
 
)
 
VALUES (
 
    'Admin',
    'admin@email.com'
 
)
 
ON CONFLICT (email)
DO NOTHING;
 
 
COMMIT;