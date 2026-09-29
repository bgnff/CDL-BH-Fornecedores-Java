-- ============================================================
-- Migration: Criação da Tabela de Beneficiários
-- Sistema de Gestão da Fundação CDL-BH
-- ============================================================
USE cdl_bh_fornecedores_java;

-- Criação da tabela de beneficiários atendidos pelos projetos sociais
CREATE TABLE IF NOT EXISTS beneficiarios (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  nome            VARCHAR(200)    NOT NULL,
  cpf             VARCHAR(20)     DEFAULT NULL,
  data_nascimento DATE            DEFAULT NULL,
  telefone        VARCHAR(30)     DEFAULT NULL,
  email           VARCHAR(200)    DEFAULT NULL,
  projeto_id      INT UNSIGNED    DEFAULT NULL,
  bairro          VARCHAR(150)    DEFAULT NULL,
  status          ENUM('Ativo','Em Acompanhamento','Concluído','Inativo') NOT NULL DEFAULT 'Ativo',
  observacao      TEXT            DEFAULT NULL,
  created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (id),
  
  -- Vínculo com a tabela de projetos
  CONSTRAINT fk_beneficiario_projeto 
    FOREIGN KEY (projeto_id) 
    REFERENCES projetos(id) 
    ON DELETE SET NULL 
    ON UPDATE CASCADE,
    
  INDEX idx_beneficiario_projeto (projeto_id),
  INDEX idx_beneficiario_status (status),
  INDEX idx_beneficiario_cpf (cpf),
  FULLTEXT INDEX ft_beneficiario_busca (nome, bairro)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verificação da tabela criada
DESCRIBE beneficiarios;
