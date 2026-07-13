-- ============================================
-- CRIAR TABELAS
-- ============================================

-- Tabela de categorias de gastos
CREATE TABLE IF NOT EXISTS categorias (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cor VARCHAR(20) DEFAULT '#000000',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de gastos
CREATE TABLE IF NOT EXISTS gastos (
    id SERIAL PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    data DATE NOT NULL,
    categoria_id INTEGER REFERENCES categorias(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INSERIR DADOS INICIAIS
-- ============================================

-- Inserir categorias padrão
INSERT INTO categorias (nome, cor) VALUES 
    ('Alimentação', '#FF5733'),
    ('Transporte', '#33FF57'),
    ('Lazer', '#3357FF'),
    ('Moradia', '#FF33F5'),
    ('Saúde', '#33FFF5');

-- Inserir usuário padrão
INSERT INTO usuarios (nome, email) VALUES 
    ('Admin', 'admin@email.com');

-- Inserir alguns gastos de exemplo
INSERT INTO gastos (descricao, valor, data, categoria_id) VALUES 
    ('Supermercado', 150.00, '2024-01-15', 1),
    ('Uber', 25.50, '2024-01-16', 2),
    ('Cinema', 45.00, '2024-01-17', 3),
    ('Aluguel', 1200.00, '2024-01-01', 4),
    ('Farmácia', 80.00, '2024-01-18', 5);