# Sistema de Gestão de Fornecedores e Parceiros - CDL-BH

[![Java](https://img.shields.io/badge/Java-21-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.0-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.0-purple.svg)](https://vitejs.dev/)
[![Security](https://img.shields.io/badge/Security-OWASP_Top_10_Compliant-blue.svg)](#-arquitetura-de-segurança-e-compliance)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE)

Sistema corporativo completo e resiliente para homologação, cadastro, auditoria e acompanhamento de contratos e fornecedores. Desenvolvido com um backend robusto em **Java Spring Boot 3** e frontend reativo e responsivo em **React + Tailwind CSS + Vite**.

---

## 👨‍💻 Autoria e Créditos do Projeto

- **Autor Principal e Arquiteto de Software:** **Brayan Oliveira de Souza**
- **Organização Parceira:** Fundação CDL-BH
- **Ano de Desenvolvimento:** 2026
- **Propriedade Intelectual & Direitos:** Registrado sob proteção autoral conforme a Lei nº 9.609/1998 (Lei do Software) e Lei nº 9.610/1998 (Direitos Autorais). Consulte [PATENTE_E_REGISTRO_INPI.md](PATENTE_E_REGISTRO_INPI.md) e [LICENSE](LICENSE).

---

## 📋 Como Funciona o Sistema?

O sistema foi arquitetado para simplificar, centralizar e auditar rigorosamente o ciclo de vida de parceiros, beneficiários, prestadores e fornecedores:

- **Centralização Cadastral:** Unifica os dados de fornecedores e parceiros (PJ/PF) com validação rígida de CNPJ/CPF, e-mails, telefones, vínculo a projetos sociais e status operacionais.
- **Módulo de Anexos e Vencimentos:** Gestão documental para certidões, contratos e alvarás. O sistema conta com inteligência para monitorar prazos de vencimento (indicando status como vencidos ou a vencer).
- **Ações Rápidas de Contato:** Integração nativa para disparos para o WhatsApp e redirecionamento de E-mails diretamente pelas interfaces.
- **Painel de Desempenho (Dashboard):** Visualização consolidada de métricas essenciais e totalizadores.

---

## 🛡️ Arquitetura de Segurança e Compliance (Cybersecurity)

O projeto foi construído sob uma ótica "Secure by Design", mitigando riscos baseados no OWASP Top 10 e em frameworks de conformidade corporativa:

1. **Trilha de Auditoria Imutável (Compliance):** 
   - Registro automático e estruturado de todas as ações (`CREATE`, `UPDATE`, `DELETE`), armazenando data/hora, identificação do ator da modificação e diff estruturado em formato JSONB das alterações efetuadas.
2. **Prevenção contra Ataques de Força Bruta e DDoS:** 
   - A camada de autenticação utiliza `Bucket4j` (algoritmo Token Bucket) com políticas estritas de *Rate Limiting* por IP nos endpoints públicos (como `/api/auth/login`).
3. **Autenticação Stateless (JWT) e RBAC:** 
   - Transações HTTP protegidas por token Bearer gerado via `JJWT`, assinado digitalmente.
   - Controle de Acesso Baseado em Perfis (RBAC) através do Spring Security (ex: `ROLE_ADMIN`, `ROLE_USER`) blindando endpoints sensíveis.
4. **Proteção de Dados Sensíveis e Sanitização:** 
   - Adoção de BCrypt para hashes de senhas.
   - Mitigação de injeção (SQL Injection e XSS) através de ORM estruturado (Hibernate) e sanitização no mapeamento de entrada.
   - Filtros HTTP rigorosos para prevenir Clickjacking (`X-Frame-Options`) e MIME-Sniffing (`X-Content-Type-Options`).
5. **Prevenção de Path Traversal em Arquivos e Backups:**
   - Rotinas de geração de dump (backup completo) validadas. O download de arquivos prevê sanitização rígida contra ataques de *Directory Traversal* (`../`).

---

## 🏗️ Arquitetura Técnica

```text
┌──────────────────────────┐             ┌────────────────────────────────┐             ┌─────────────────────────────┐
│      Frontend SPA        │             │      Backend REST API          │             │     Banco de Dados          │
│   (React 18 + Vite)      │◄───────────►│    (Java 21 + Spring Boot 3)   │◄───────────►│  • MySQL 8 (Produção)       │
│   Hospedagem: Netlify    │    HTTP     │    Framework: Spring Web       │    JDBC     │  • Supabase (PostgreSQL)    │
│   Tailwind CSS + Radix   │  (REST/JWT) │    Segurança: Spring Security  │  (HikariCP) │  • H2 (Testes Locais)       │
└──────────────────────────┘             └────────────────────────────────┘             └─────────────────────────────┘
```

### Camadas do Backend (Clean MVC):
1. **Controller Layer:** Orquestra e serializa requisições/respostas REST, validando DTOs.
2. **Security & Filter Chain:** Interceptação via `JwtAuthenticationFilter` e políticas de segurança global.
3. **Service Layer:** Processa regras de negócio, cálculo de diferenças (diffs) e controle transacional (`@Transactional`).
4. **Repository Layer:** Interage de forma segura com o banco utilizando Spring Data JPA.
5. **Entity & DTO Layer:** Garante o isolamento entre o modelo de persistência e a exibição exposta para a API.

---

## 🔒 Boas Práticas e Segurança de Repositório

Foi realizada uma varredura para garantir que informações sensíveis não vazem para o repositório público:

### ❌ NUNCA deve ser versionado no Git:
- **Senhas, Tokens e Secrets:** Qualquer chave de API real ou secret JWT nunca será armazenada em arquivos versionados. 
- **Backups de Banco de Dados (`*.sql` com dados sensíveis, `*.dump`):** Contém PII (Personally Identifiable Information) o que violaria a LGPD.
- **Variáveis de Ambiente (`.env`, `application-production.properties`):** Arquivos contendo conexões ou credenciais reais do ambiente de produção/AWS/Supabase.

### ✅ O que DEVE ser versionado:
- **Scripts de Migração/DDL (`schema.sql`):** Apenas estrutura de tabelas, roles emuladas e funções, sem dados identificáveis.
- **Exemplos de Configuração (`.env.example`, `application-example.properties`):** Modelos preenchidos com valores vazios para guiar novos desenvolvedores.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
- **Java JDK 21+**
- **Apache Maven 3.9+**
- **Node.js 18+** e **npm**
- **MySQL 8** ou **PostgreSQL** (para persistência de longo prazo).

### Ambiente de Desenvolvimento Ágil (H2 Memory Database)
Não é necessário instalar banco de dados externo. O sistema subirá uma instância limpa em memória com um script seguro de seed.

1. **Iniciar o Backend:**
   ```bash
   cd backend-java
   mvn spring-boot:run -Dspring-boot.run.profiles=local
   ```
   *(A base H2 inicializará no console: `http://localhost:8080/h2-console` usando `jdbc:h2:mem:cdl_bh_fornecedores`)*

2. **Iniciar o Frontend:**
   Abra um novo terminal e execute:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   *(Acesse `http://localhost:5173`. As credenciais de teste para o ambiente em memória se encontram nos scripts de seed locais).*

### Ambiente de Homologação / Produção
1. Provisione seu banco de dados MySQL ou Supabase PostgreSQL.
2. Clone o arquivo `application-example.properties` para `application.properties` informando os dados reais e *passwords*.
3. Execute as tabelas localizadas em `db-java/schema.sql` ou em `supabase/`.
4. Compile ou suba a aplicação definindo o profile ativo de produção.

---

## 🔌 Principais Endpoints da API REST

| Método | Endpoint | Perfil Mínimo | Segurança / Descrição |
|---|---|---|---|
| `POST` | `/api/auth/login` | Público | Autenticação, Protegido por Rate-Limit e Token Bucket |
| `GET` | `/api/auth/me` | Autenticado | Retorna Claims do JWT e perfil (RBAC) |
| `GET` | `/api/fornecedores` | Autenticado | Listagem sanitizada de cadastros |
| `POST` | `/api/fornecedores` | Autenticado | Inserção segura, disparando a Trilha de Auditoria |
| `PUT` | `/api/fornecedores/{id}` | `ADMIN` | Modificações restritas, armazenando log Diff em JSONB |
| `DELETE` | `/api/fornecedores/{id}` | `ADMIN` | Soft Delete ou Exclusão (Requer Role Elevada) |
| `POST` | `/api/backup/generate` | `ADMIN` | Geração de backup do BD em arquivo protegido |
| `GET` | `/api/backup/download/{file}` | `ADMIN` | Arquivo do BD (Filtrado contra `../` Path Traversal) |

---

## ⚖️ Licença

Este projeto possui código fechado e é de uso exclusivo. Para mais detalhes sobre regras de uso e implantação, leia atentamente [LICENSE](LICENSE).
