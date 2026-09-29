# Sistema de Gestão de Fornecedores e Parceiros

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)
[![Author](https://img.shields.io/badge/Author-Brayan%20Oliveira%20de%20Souza-informational.svg)](#-autoria-e-créditos-do-projeto)

Sistema corporativo completo e resiliente para homologação, cadastro, auditoria e acompanhamento de contratos e fornecedores, concebido com backend robusto em **Java Spring Boot 3** e frontend reativo e responsivo em **React + Tailwind CSS + Vite**.

---

## 👨‍💻 Autoria e Créditos do Projeto

- **Autor Principal e Arquiteto de Software:** **Brayan Oliveira de Souza**
- **Organização Beneficiária / Parceira:** Fundação CDL-BH
- **Ano de Desenvolvimento:** 2026
- **Propriedade Intelectual & Direitos:** Registrado sob proteção autoral conforme a Lei nº 9.609/1998 (Lei do Software) e Lei nº 9.610/1998 (Direitos Autorais). Consulte [PATENTE_E_REGISTRO_INPI.md](PATENTE_E_REGISTRO_INPI.md) e [LICENSE](LICENSE).

---

## 📋 Visão Geral do Sistema

O sistema foi arquitetado para simplificar e auditar rigorosamente o ciclo de vida de parceiros e fornecedores:

- **Cadastro Centralizado de Fornecedores:** Dados cadastrais, empresa/PF, CNPJ validado e mascarado, e-mails, telefones com ação rápida de WhatsApp, permissões operacionais e vínculo a projetos sociais oficiais.
- **Gestão Documental com Alertas de Validade:** Anexação de certidões, contratos e alvarás com monitoramento inteligente de vencimentos (vencidos e a vencer em 30 dias).
- **Trilha de Auditoria Imutável (Compliance):** Registro automático de ações (`CREATE`, `UPDATE`, `DELETE`) contendo data/hora, identificação real do usuário autor da ação e detalhamento em formato estruturado (JSONB/Diff).
- **Mecanismo de Backup Integrado:** Rotinas automatizadas de dump completo (FULL) e incremental via agendamento com controle rigoroso de caminho para prevenção de path traversal.
- **Autenticação Stateless com JWT & Rate Limiting:** Proteção contra ataques de força bruta no endpoint de login via algoritmo *Token Bucket* (Bucket4j) e controle de permissões por perfil (`ROLE_ADMIN` e `ROLE_USER`).
- **Flexibilidade Multibanco:** Suporte nativo para **H2 (em memória para testes instantâneos)**, **MySQL 8 (on-premise/servidor)** e **Supabase / PostgreSQL (nuvem/serverless)**.

---

## 🏗️ Arquitetura da Solução

```
┌──────────────────────────┐             ┌────────────────────────────────┐             ┌─────────────────────────────┐
│      Frontend SPA        │             │      Backend REST API          │             │     Banco de Dados          │
│   (React 18 + Vite)      │◄───────────►│    (Java 21 + Spring Boot 3)   │◄───────────►│  • MySQL 8 (Produção)       │
│   Porta 5173 / Netlify   │    HTTP     │    Porta 8080                  │    JDBC     │  • Supabase (PostgreSQL)    │
│   Tailwind CSS + Radix   │  (REST/JWT) │    Spring Security + Bucket4j  │  (HikariCP) │  • H2 (Testes Locais)       │
└──────────────────────────┘             └────────────────────────────────┘             └─────────────────────────────┘
```

### Camadas do Backend (Clean MVC Architecture):
1. **Controller Layer:** Validação de entradas HTTP, sanitização, controle de permissões via `@PreAuthorize` e orquestração de respostas REST.
2. **Security & Filter Chain:** Interceptação por token Bearer JWT (`JwtAuthenticationFilter`), rate limiting contra brute force (`RateLimitConfig`) e políticas de cabeçalhos de segurança (prevenção contra MIME-sniffing e clickjacking).
3. **Service Layer:** Regras de negócio, cálculo de diff de alterações para auditoria, coordenação de transações com rollback automático (`@Transactional`).
4. **Repository Layer:** Abstração de persistência via Spring Data JPA e Hibernate, otimizado com índices e relacionamentos mapeados.
5. **Entity & DTO Layer:** Separação estrita entre modelos relacionais do banco e contratos de transferência de dados da API.

---

## 🛠️ Tecnologias Utilizadas

| Camada | Tecnologia | Finalidade |
|---|---|---|
| **Linguagem Backend** | Java 21 LTS | Performance de compilação, tipagem estática e segurança de execução |
| **Framework Web** | Spring Boot 3.2.0 | Inicialização rápida, injeção de dependência e ecossistema empresarial |
| **Segurança** | Spring Security 6 & JJWT 0.12.3 | Autenticação stateless, criptografia BCrypt e RBAC |
| **Proteção de Acesso** | Bucket4j 8.7.0 | Rate limiting preventivo contra força bruta no login |
| **Persistência** | Spring Data JPA / Hibernate | Mapeamento objeto-relacional com suporte multiplataforma |
| **Frontend** | React 18 & Vite 5 | Renderização ultrarrápida, SPA reativa e empacotamento otimizado |
| **Estilização** | Tailwind CSS & shadcn/ui | Design system moderno, responsivo e com componentes acessíveis |
| **Bancos Suportados** | MySQL 8 / PostgreSQL / H2 | Flexibilidade de infraestrutura e desenvolvimento |

---

## 🔒 Boas Práticas de Git: O que DEVE e NÃO DEVE Estar no Repositório

### ❌ NUNCA deve ser commitado no Git:
- **Arquivos de backup e dumps de banco (`backups/*.sql`, `*.dump`):** Podem expor dados de empresas, contatos, dados de pessoas físicas e violar a LGPD (Lei Geral de Proteção de Dados).
- **Variáveis de ambiente com chaves reais (`.env`, `.env.local`):** Chaves de API, credenciais do banco e chaves de assinatura JWT nunca devem ser versionadas.
- **Configurações locais de IDEs (`.vscode/`, `.idea/`, `*.iml`):** Evita conflitos de configuração entre desenvolvedores.
- **Diretórios de build e dependências (`target/`, `node_modules/`, `dist/`):** Aumentam o repositório desnecessariamente e devem ser gerados em tempo de compilação.
- **Arquivos de log (`*.log`, `logs/`):** Podem conter stack traces sensíveis e informações de depuração.

### ✅ O que DEVE estar no repositório:
- **Código-fonte da aplicação (`src/`):** Classes Java, componentes React, estilos e testes.
- **Arquivos de configuração de exemplo (`application-example.properties`, `.env.example`):** Modelos preenchidos apenas com valores fictícios/placeholders.
- **Scripts DDL de banco de dados (`db-java/schema.sql`, `supabase/schema.sql`):** Apenas estrutura de tabelas, índices e triggers (sem dados sensíveis).
- **Arquivos de manifesto de dependência (`pom.xml`, `package.json`, `package-lock.json`).
- **Documentação do projeto (`README.md`, `LICENSE`, `PATENTE_E_REGISTRO_INPI.md`, guias).**

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- **Java JDK 21+** instalado e configurado no PATH
- **Apache Maven 3.9+**
- **Node.js 18+** e **npm**
- **MySQL 8** (opcional, caso queira rodar o banco local persistido)

---

### Opção 1: Inicialização Expressa para Testes (H2 em Memória - Sem MySQL)
Não requer nenhum banco instalado! Os dados de teste e usuários já são criados em memória automaticamente:

```bash
# 1. Iniciar o Backend no perfil 'local'
cd backend-java
mvn spring-boot:run -Dspring-boot.run.profiles=local

# 2. Em outro terminal, iniciar o Frontend
cd frontend
npm install
npm run dev
```

- **Acesso Web:** `http://localhost:5173`
- **Console do H2:** `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:mem:cdl_bh_fornecedores`)
- **Usuários Padrão para Teste:**
  - Admin: `admin@cdlbh.org.br` | Senha: `admin123`
  - Usuário Comum: `user@cdlbh.org.br` | Senha: `user123`

---

### Opção 2: Produção Local com MySQL 8

1. Crie o schema e tabelas no seu MySQL:
   ```bash
   mysql -u root -p < db-java/schema.sql
   ```
2. Crie o arquivo `backend-java/src/main/resources/application.properties` a partir de `application-example.properties` com suas credenciais seguras.
3. Inicie o backend:
   ```bash
   cd backend-java
   mvn spring-boot:run
   ```

---

## 🔌 Principais Endpoints da API REST

| Método | Endpoint | Perfil Mínimo | Descrição |
|---|---|---|---|
| `POST` | `/api/auth/login` | Público | Autenticação com rate limiting (retorna token Bearer JWT) |
| `GET` | `/api/auth/me` | Autenticado | Dados do usuário logado |
| `GET` | `/api/fornecedores` | Autenticado | Listagem completa de fornecedores e parceiros |
| `GET` | `/api/fornecedores/{id}` | Autenticado | Detalhes de um fornecedor específico |
| `POST` | `/api/fornecedores` | Autenticado | Cadastro de fornecedor (gera registro de auditoria) |
| `PUT` | `/api/fornecedores/{id}` | `ADMIN` | Atualização cadastral com cálculo de diff |
| `DELETE` | `/api/fornecedores/{id}` | `ADMIN` | Exclusão de fornecedor |
| `GET` | `/api/documentos/vencendo` | Autenticado | Documentos próximos ao vencimento |
| `POST` | `/api/documentos` | `ADMIN` | Anexação e metadados de novo documento |
| `POST` | `/api/backup/generate` | `ADMIN` | Geração manual de dump do banco de dados |
| `GET` | `/api/backup/download/{file}` | `ADMIN` | Download protegido contra path traversal |
| `GET` | `/api/health` | Público | Verificação de disponibilidade da aplicação |

---

## ⚖️ Proteção Intelectual e Licença

Este projeto é de autoria de **Brayan Oliveira de Souza** e possui proteção autoral e patrimonial estrita.

- **Licença:** Consulte o arquivo [LICENSE](LICENSE) para termos de titularidade e restrições.
- **Processo de Registro no INPI:** Instruções completas para formalização de registro de software junto ao INPI disponíveis em [PATENTE_E_REGISTRO_INPI.md](PATENTE_E_REGISTRO_INPI.md).
