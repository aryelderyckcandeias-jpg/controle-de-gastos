BEGIN;

-- ============================================================
-- CATEGORIAS
-- ============================================================

CREATE TABLE IF NOT EXISTS categorias (
id SERIAL PRIMARY KEY,

```
nome VARCHAR(100) NOT NULL,

cor VARCHAR(20)
    DEFAULT '#000000',

created_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP
```

);

-- ============================================================
-- USUÁRIOS
-- ============================================================

CREATE TABLE IF NOT EXISTS usuarios (
id SERIAL PRIMARY KEY,

```
nome VARCHAR(100) NOT NULL,

email VARCHAR(100) NOT NULL UNIQUE,

senha_hash TEXT,

created_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP
```

);

-- ============================================================
-- GASTOS
-- ============================================================

CREATE TABLE IF NOT EXISTS gastos (
id SERIAL PRIMARY KEY,

```
descricao VARCHAR(255) NOT NULL,

valor NUMERIC(10, 2) NOT NULL,

data DATE NOT NULL,

categoria_id INTEGER,

usuario_id INTEGER NOT NULL,

created_at TIMESTAMP
    DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT gastos_categoria_id_fkey
    FOREIGN KEY (categoria_id)
    REFERENCES categorias(id),

CONSTRAINT gastos_usuario_id_fkey
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE CASCADE
```

);

-- ============================================================
-- ÍNDICE
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_gastos_usuario_id
ON gastos(usuario_id);

-- ============================================================
-- CATEGORIAS INICIAIS
-- ============================================================

INSERT INTO categorias (nome, cor)
VALUES
('Alimentação', '#FF5733'),
('Transporte', '#33FF57'),
('Lazer', '#3357FF'),
('Moradia', '#FF33F5'),
('Saúde', '#33FFF5')
ON CONFLICT DO NOTHING;

-- ============================================================
-- USUÁRIO ADMIN
-- ============================================================

INSERT INTO usuarios (
nome,
email
)
VALUES (
'Admin',
'[admin@email.com](mailto:admin@email.com)'
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- GASTOS DE EXEMPLO
-- ============================================================

INSERT INTO gastos (
descricao,
valor,
data,
categoria_id,
usuario_id
)
SELECT
dados.descricao,
dados.valor,
dados.data,
categoria.id,
usuario.id
FROM (
VALUES
(
'Supermercado',
150.00::NUMERIC(10, 2),
DATE '2024-01-15',
'Alimentação'
),
(
'Uber',
25.50::NUMERIC(10, 2),
DATE '2024-01-16',
'Transporte'
),
(
'Cinema',
45.00::NUMERIC(10, 2),
DATE '2024-01-17',
'Lazer'
),
(
'Aluguel',
1200.00::NUMERIC(10, 2),
DATE '2024-01-01',
'Moradia'
),
(
'Farmácia',
80.00::NUMERIC(10, 2),
DATE '2024-01-18',
'Saúde'
)
) AS dados(
descricao,
valor,
data,
categoria_nome
)
JOIN categorias categoria
ON categoria.nome = dados.categoria_nome
JOIN usuarios usuario
ON usuario.email = '[admin@email.com](mailto:admin@email.com)';

COMMIT;
