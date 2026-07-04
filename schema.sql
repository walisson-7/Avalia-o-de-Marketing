-- ============================================
-- Schema do banco de dados - Sistema de Avaliação
-- PostgreSQL
-- ============================================

CREATE TABLE usuarios (
    id            SERIAL PRIMARY KEY,
    nome          VARCHAR(150) NOT NULL,
    username      VARCHAR(50)  NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL CHECK (role IN ('analista', 'avaliador')),
    created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE atividades (
    id          SERIAL PRIMARY KEY,
    semana      VARCHAR(100) NOT NULL,
    titulo      VARCHAR(200) NOT NULL,
    descricao   TEXT,
    criado_por  INTEGER NOT NULL REFERENCES usuarios(id),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE links (
    id          SERIAL PRIMARY KEY,
    semana      VARCHAR(100) NOT NULL,
    titulo      VARCHAR(200) NOT NULL,
    url         VARCHAR(500) NOT NULL,
    criado_por  INTEGER NOT NULL REFERENCES usuarios(id),
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE avaliacoes (
    id            SERIAL PRIMARY KEY,
    link_id       INTEGER NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    avaliador_id  INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
    precificacao  INTEGER NOT NULL CHECK (precificacao BETWEEN 0 AND 5),
    organizacao   INTEGER NOT NULL CHECK (organizacao BETWEEN 0 AND 5),
    execucao      INTEGER NOT NULL CHECK (execucao BETWEEN 0 AND 5),
    criatividade  INTEGER NOT NULL CHECK (criatividade BETWEEN 0 AND 5),
    total         INTEGER GENERATED ALWAYS AS (precificacao + organizacao + execucao + criatividade) STORED,
    created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (link_id, avaliador_id)  -- cada avaliador avalia um link só uma vez
);

-- ============================================
-- Índices para consultas mais rápidas
-- ============================================
CREATE INDEX idx_atividades_semana ON atividades(semana);
CREATE INDEX idx_links_semana ON links(semana);
CREATE INDEX idx_avaliacoes_avaliador ON avaliacoes(avaliador_id);
CREATE INDEX idx_avaliacoes_link ON avaliacoes(link_id);

-- ============================================
-- Exemplo de consulta para o RANKING
-- (conta quantas avaliações cada avaliador fez)
-- ============================================
-- SELECT u.id, u.nome, COUNT(a.id) AS total_avaliacoes
-- FROM usuarios u
-- LEFT JOIN avaliacoes a ON a.avaliador_id = u.id
-- WHERE u.role = 'avaliador'
-- GROUP BY u.id, u.nome
-- ORDER BY total_avaliacoes DESC;

-- ============================================
-- Zerar ranking = apagar todas as avaliações
-- ============================================
-- DELETE FROM avaliacoes;
