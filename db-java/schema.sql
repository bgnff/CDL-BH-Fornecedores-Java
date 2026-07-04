-- ============================================================
-- Schema: Sistema de Gestão de Fornecedores — Fundação CDL BH (JAVA)
-- ============================================================
--
-- IMPORTANTE: Este é um schema SEPARADO do ambiente Node.js atual.
-- O schema Node.js usa "cdl_bh_fornecedores_test", enquanto este usa
-- "cdl_bh_fornecedores_java". Isso permite que ambos os ambientes
-- coexistam no mesmo MySQL Workbench durante a fase de aprendizado
-- e migração do backend Node.js para Java Spring Boot.
--
-- Este schema será usado em PRODUÇÃO pela Fundação CDL-BH.
-- ============================================================

-- Criação do banco de dados
-- CHARACTER SET utf8mb4: Suporta caracteres Unicode completos, incluindo emojis e acentos
-- COLLATE utf8mb4_unicode_ci: Define regras de comparação case-insensitive e acento-insensitive
CREATE DATABASE IF NOT EXISTS cdl_bh_fornecedores_java
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- Seleciona o banco de dados recém-criado para as operações seguintes
USE cdl_bh_fornecedores_java;

-- ============================================================
-- TABELA: projetos
-- ============================================================
-- DECISÃO DE ARQUITETURA: Migramos de ENUM para tabela separada
-- Por que? ENUM é rígido - adicionar um novo projeto exige ALTER TABLE.
-- Com tabela separada, a fundação pode cadastrar novos projetos via aplicação
-- sem precisar modificar o schema do banco. É mais flexível e escalável.
-- ============================================================
CREATE TABLE IF NOT EXISTS projetos (
  -- Chave primária auto-incrementada
  -- UNSIGNED: economiza espaço e evita números negativos (não faz sentido para IDs)
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  
  -- Nome do projeto - deve ser único para evitar duplicatas
  nome        VARCHAR(100)    NOT NULL UNIQUE,
  
  -- Descrição opcional do projeto
  descricao   TEXT            DEFAULT NULL,
  
  -- Timestamps automáticos
  -- created_at: Data/hora de criação do registro
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- updated_at: Data/hora da última atualização (atualiza automaticamente)
  updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Define a chave primária
  PRIMARY KEY (id)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: usuarios
-- ============================================================
-- Armazena os usuários do sistema com suas credenciais e papéis
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
  -- Chave primária auto-incrementada
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  
  -- Nome completo do usuário
  nome        VARCHAR(150)    NOT NULL,
  
  -- E-mail do usuário - UNIQUE impede duplicatas (mesmo e-mail não pode ter 2 contas)
  email       VARCHAR(200)    NOT NULL UNIQUE,
  
  -- Hash da senha (NUNCA armazenar senha em texto plano!)
  -- VARCHAR(255) é suficiente para hashes bcrypt (que têm 60 caracteres)
  senha_hash  VARCHAR(255)    NOT NULL,
  
  -- Papel do usuário: 'admin' (acesso total) ou 'user' (acesso limitado)
  -- ENUM garante que só esses dois valores são aceitos
  role        ENUM('admin','user') NOT NULL DEFAULT 'user',
  
  -- Timestamps automáticos
  created_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Define a chave primária
  PRIMARY KEY (id)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: fornecedores
-- ============================================================
-- Armazena os fornecedores/parceiros da fundação
-- ============================================================
CREATE TABLE IF NOT EXISTS fornecedores (
  -- Chave primária auto-incrementada
  id             INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  
  -- Nome do contato principal
  nome           VARCHAR(200)    NOT NULL,
  
  -- Nome da empresa ou Pessoa Física
  empresa_pf     VARCHAR(200)    NOT NULL,
  
  -- CNPJ do fornecedor (opcional)
  -- Formato: 00.000.000/0000-00 (apenas para exibição, armazenado sem formatação)
  cnpj           VARCHAR(20)     DEFAULT NULL,
  
  -- E-mail de contato (opcional)
  email          VARCHAR(200)    DEFAULT NULL,
  
  -- Telefone de contato (opcional)
  telefone       VARCHAR(30)     DEFAULT NULL,
  
  -- Palavras-chave para busca (ex: "fraldas, higiene")
  palavra_chave  VARCHAR(300)    DEFAULT NULL,
  
  -- Chave estrangeira para a tabela projetos
  -- DECISÃO: FK em vez de ENUM permite flexibilidade para adicionar novos projetos
  -- ON DELETE SET NULL: Se o projeto for excluído, o fornecedor continua existindo
  -- mas sem projeto associado (não perdemos o fornecedor)
  -- ON UPDATE CASCADE: Se o ID do projeto mudar (raro), atualiza automaticamente
  projeto_id     INT UNSIGNED    DEFAULT NULL,
  
  -- Observações adicionais (campo TEXT para textos longos)
  observacao     TEXT            DEFAULT NULL,
  
  -- Permissões do fornecedor - armazenado como JSON
  -- MySQL 8 suporta nativamente tipo JSON com validação
  -- Ex: ["Fornecer materiais", "Doação de produtos"]
  permissao_para JSON            DEFAULT NULL,
  
  -- Status do fornecedor: 'ativo' ou 'inativo'
  -- ENUM garante consistência dos valores
  status         ENUM('ativo','inativo') NOT NULL DEFAULT 'ativo',
  
  -- Timestamps automáticos
  created_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Define a chave primária
  PRIMARY KEY (id),
  
  -- Chave estrangeira para projetos
  CONSTRAINT fk_fornecedor_projeto 
    FOREIGN KEY (projeto_id) 
    REFERENCES projetos(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  
  -- Índice no campo status - acelera filtros por status
  INDEX idx_status (status),
  
  -- Índice no campo projeto_id - acelera filtros por projeto e JOINs
  INDEX idx_projeto (projeto_id),
  
  -- Índice no campo cnpj - acelera buscas por CNPJ
  INDEX idx_cnpj (cnpj),
  
  -- Índice FULLTEXT para busca textual em nome, empresa e palavra-chave
  -- Permite busca eficiente usando MATCH...AGAINST no MySQL
  FULLTEXT INDEX ft_busca (nome, empresa_pf, palavra_chave)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABELA: logs
-- ============================================================
-- Auditoria de todas as ações no sistema (CREATE, UPDATE, DELETE)
-- CRÍTICO PARA SEGURANÇA: Rastreabilidade de quem fez o quê
-- ============================================================
CREATE TABLE IF NOT EXISTS logs (
  -- Chave primária auto-incrementada
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  
  -- Chave estrangeira para o usuário que realizou a ação
  -- ON DELETE SET NULL: Se o usuário for excluído, preservamos o log
  -- (o histórico não deve ser perdido mesmo se o usuário sair do sistema)
  usuario_id   INT UNSIGNED,
  
  -- Nome do usuário no momento da ação (cópia para preservar histórico)
  -- Se o usuário mudar de nome depois, o log continua com o nome antigo
  usuario_nome VARCHAR(150),
  
  -- Tipo de ação: CREATE, UPDATE, DELETE
  acao         VARCHAR(50)  NOT NULL,
  
  -- Tabela afetada: 'fornecedores', 'usuarios', etc.
  tabela       VARCHAR(50)  NOT NULL,
  
  -- ID do registro que foi modificado
  registro_id  INT UNSIGNED,
  
  -- Detalhes da ação em formato JSON
  -- Ex: {"nome": "Maria Silva", "alteracoes": {"email": {"de": "antigo@email.com", "para": "novo@email.com"}}}
  -- IMPORTANTE: Campos sensíveis (email, telefone, observacao) NUNCA são gravados aqui
  detalhes     JSON         DEFAULT NULL,
  
  -- Timestamp automático
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Define a chave primária
  PRIMARY KEY (id),
  
  -- Chave estrangeira para usuarios
  CONSTRAINT fk_log_usuario 
    FOREIGN KEY (usuario_id) 
    REFERENCES usuarios(id)
    ON DELETE SET NULL
    ON UPDATE CASCADE,
  
  -- Índices para consultas frequentes de auditoria
  INDEX idx_usuario (usuario_id),
  INDEX idx_tabela (tabela),
  INDEX idx_registro (registro_id),
  INDEX idx_created (created_at)
  
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DADOS INICIAIS: Projetos
-- ============================================================
-- Insere os projetos que existiam como ENUM no schema anterior
-- Isso permite migração suave dos dados existentes
-- ============================================================
INSERT INTO projetos (nome, descricao) VALUES
('Projeto Afeto', 'Projeto de assistência a famílias em vulnerabilidade'),
('Afeto Empreendedorismo', 'Projeto de apoio ao empreendedorismo'),
('Alimentando Vidas', 'Projeto de combate à fome'),
('Brincadeira é Coisa Séria', 'Projeto de incentivo à brincadeira infantil'),
('Brinquedoteca Itinerante', 'Projeto de brinquedoteca móvel'),
('Despertar Empreendedor', 'Projeto de despertar empreendedor jovem'),
('Liderança Jovem', 'Projeto de formação de lideranças'),
('Natal de Todo Mundo', 'Projeto de campanha natalina'),
('Programa Educação e Trabalho (PET)', 'Projeto de educação para o trabalho'),
('Protagonizar en Cena', 'Projeto de teatro e protagonismo'),
('Sorridente', 'Projeto de saúde bucal'),
('Ver é Bom Demais', 'Projeto de saúde ocular'),
('Outro', 'Outros projetos não listados')
ON DUPLICATE KEY UPDATE id = id;

-- ============================================================
-- DADOS INICIAIS: Usuário Admin
-- ============================================================
-- Cria o usuário administrador padrão
-- Credenciais: admin@cdlbh.org.br / admin123
-- O hash bcrypt foi gerado usando BCryptPasswordEncoder com força 10
-- Hash: $2a$10$IPZO.LWKF01uaNdCC9nfgO3tk/NcxY2pwqGO3HDVQPUPwQdv5FeWK
-- ============================================================
INSERT INTO usuarios (nome, email, senha_hash, role) VALUES
('Administrador CDL BH', 'admin@cdlbh.org.br', '$2a$10$IPZO.LWKF01uaNdCC9nfgO3tk/NcxY2pwqGO3HDVQPUPwQdv5FeWK', 'admin')
ON DUPLICATE KEY UPDATE id = id;

-- ============================================================
-- DADOS INICIAIS: Fornecedores de Exemplo
-- ============================================================
-- Insere fornecedores de exemplo para facilitar testes
-- Os projeto_id foram definidos baseados na ordem de inserção acima
-- (Projeto Afeto = 1, Sorridente = 11, PET = 9)
-- ============================================================
INSERT INTO fornecedores (nome, empresa_pf, email, telefone, palavra_chave, projeto_id, observacao, permissao_para, status) VALUES
('Maria Silva', 'Distribuidora Silva LTDA', 'maria@silva.com', '(31) 99999-1111', 'fraldas, higiene', 1, 'Fornecedora parceira desde 2022.', '["Fornecer materiais","Doação de produtos"]', 'ativo'),
('João Costa', 'JC Transportes ME', 'joao@jctransportes.com', '(31) 98888-2222', 'transporte, logística', 11, NULL, '["Transporte e logística"]', 'ativo'),
('Ana Pereira', 'Papelaria Pereira', 'ana@papelaria.com', '(31) 97777-3333', 'material escolar', 9, 'Desconto de 15% para a fundação.', '["Fornecer materiais","Doação de produtos"]', 'ativo')
ON DUPLICATE KEY UPDATE id = id;

ALTER TABLE fornecedores ADD CONSTRAINT uk_cnpj UNIQUE (cnpj);

-- ============================================================
-- FIM DO SCHEMA
-- ============================================================
-- Schema pronto para uso. Para importar:
-- 1. Via linha de comando: mysql -u root -p < db-java/schema.sql
-- 2. Via MySQL Workbench: File > Run SQL Script > selecionar este arquivo
-- ============================================================
