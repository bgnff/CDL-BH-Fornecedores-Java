-- ============================================================
-- Migration: Criação das Tabelas de Prestadores e Parceiros
-- Sistema de Gestão da Fundação CDL-BH (MySQL)
-- ============================================================
USE cdl_bh_fornecedores_java;

-- 1. TABELA DE PRESTADORES DE SERVIÇOS
CREATE TABLE IF NOT EXISTS prestadores (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nome            VARCHAR(200)    NOT NULL,
  empresa_pf      VARCHAR(200)    DEFAULT NULL,
  tipo_pessoa     VARCHAR(10)     NOT NULL DEFAULT 'PJ',
  documento       VARCHAR(25)     DEFAULT NULL,
  servico         VARCHAR(150)    NOT NULL,
  especialidade   VARCHAR(150)    DEFAULT NULL,
  telefone        VARCHAR(30)     DEFAULT NULL,
  email           VARCHAR(200)    DEFAULT NULL,
  projeto         VARCHAR(150)    DEFAULT NULL,
  projeto_id      INT UNSIGNED    DEFAULT NULL,
  cidade          VARCHAR(100)    DEFAULT 'Belo Horizonte',
  status          VARCHAR(30)     NOT NULL DEFAULT 'Ativo',
  observacoes     TEXT            DEFAULT NULL,
  favorito        TINYINT(1)      NOT NULL DEFAULT 0,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (id),
  
  CONSTRAINT fk_prestador_projeto 
    FOREIGN KEY (projeto_id) 
    REFERENCES projetos(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
    
  INDEX idx_prestador_status (status),
  INDEX idx_prestador_favorito (favorito),
  INDEX idx_prestador_tipo (tipo_pessoa),
  INDEX idx_prestador_projeto (projeto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 2. TABELA DE PARCEIROS INSTITUCIONAIS
CREATE TABLE IF NOT EXISTS parceiros (
  id                  INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nome                VARCHAR(200)    NOT NULL,
  empresa_pf          VARCHAR(200)    DEFAULT NULL,
  tipo_pessoa         VARCHAR(10)     NOT NULL DEFAULT 'PJ',
  documento           VARCHAR(25)     DEFAULT NULL,
  tipo_parceria       VARCHAR(100)    NOT NULL DEFAULT 'Empresa Mantenedora',
  responsavel         VARCHAR(150)    DEFAULT NULL,
  cargo_responsavel   VARCHAR(150)    DEFAULT NULL,
  telefone            VARCHAR(30)     DEFAULT NULL,
  email               VARCHAR(200)    DEFAULT NULL,
  projeto             VARCHAR(150)    DEFAULT NULL,
  projeto_id          INT UNSIGNED    DEFAULT NULL,
  status              VARCHAR(30)     NOT NULL DEFAULT 'Ativo',
  contribuicao        TEXT            DEFAULT NULL,
  favorito            TINYINT(1)      NOT NULL DEFAULT 0,
  created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (id),
  
  CONSTRAINT fk_parceiro_projeto 
    FOREIGN KEY (projeto_id) 
    REFERENCES projetos(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
    
  INDEX idx_parceiro_status (status),
  INDEX idx_parceiro_favorito (favorito),
  INDEX idx_parceiro_tipo (tipo_parceria),
  INDEX idx_parceiro_projeto (projeto_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DESCRIBE prestadores;
DESCRIBE parceiros;
