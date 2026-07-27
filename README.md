# Sistema de Gestão de Fornecedores - Fundação CDL-BH (Backend Java)

Sistema completo para gestão de fornecedores e parceiros da Fundação CDL-BH, implementado com backend em Java Spring Boot e frontend em React.

---

## 📋 Visão Geral

Este sistema permite à Fundação CDL-BH gerenciar seus fornecedores e parceiros de forma eficiente, com:

- **Cadastro de fornecedores** com informações detalhadas (contato, empresa, CNPJ, projetos, permissões)
- **Gestão de usuários** com papéis (admin/user) e autenticação segura
- **Auditoria completa** de todas as ações (logs de CREATE, UPDATE, DELETE)
- **Backup automático** do banco de dados a cada hora
- **Interface moderna** e responsiva construída com React e Tailwind CSS
- **Integração WhatsApp** - botão direto para contato via WhatsApp na tabela de fornecedores
- **Máscara automática** para CNPJ (00.000.000/0000-00) no formulário

**Este sistema é usado em produção pela Fundação CDL-BH.**

---

## 🏗️ Arquitetura

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────┐
│   Frontend      │         │   Backend Java   │         │   MySQL     │
│   (React)       │◄────────►│  (Spring Boot)   │◄────────►│  Database   │
│   Porta 5173    │  HTTP   │   Porta 8080     │  JDBC   │   Porta 3306│
└─────────────────┘         └──────────────────┘         └─────────────┘
```

**Fluxo da aplicação:**
1. **Frontend React** faz requisições HTTP para a API REST
2. **Backend Spring Boot** processa as requisições, aplica regras de negócio e segurança
3. **MySQL** armazena todos os dados de forma persistente
4. **JWT** é usado para autenticação stateless (sem sessão no servidor)

---

## 🛠️ Tecnologias Utilizadas

### Backend Java (Spring Boot)

| Tecnologia | Descrição |
|-----------|-----------|
| **Spring Boot 3.2.0** | Framework que simplifica a configuração de aplicações Spring |
| **Spring Data JPA** | Camada que converte objetos Java em registros de banco automaticamente, evitando escrever SQL repetitivo para operações simples de CRUD |
| **Spring Security** | Framework de segurança que fornece autenticação e autorização, proteção contra CSRF, XSS, etc. |
| **Spring MVC** | Framework web para criar APIs REST, gerencia requisições HTTP e respostas JSON |
| **Hibernate** | Implementação JPA que mapeia classes Java para tabelas do banco de dados |
| **MySQL Connector/J** | Driver JDBC oficial do MySQL para conectar Java ao banco |
| **JWT (jjwt)** | Biblioteca para criar e validar tokens JSON Web Token para autenticação |
| **Bucket4j** | Biblioteca para implementar rate limiting (limitação de taxa de requisições) |
| **BCrypt** | Algoritmo de hash de senha seguro, usado para armazenar senhas de forma segura |
| **Lombok** | Biblioteca que reduz código repetitivo via anotações (getters, setters, construtores) |
| **Maven** | Ferramenta de gerenciamento de dependências e build do projeto Java |

### Frontend React

| Tecnologia | Descrição |
|-----------|-----------|
| **React 18** | Biblioteca JavaScript para construir interfaces de usuário baseadas em componentes |
| **Vite** | Build tool rápido para desenvolvimento e bundling de aplicações React |
| **Tailwind CSS** | Framework CSS utilitário para estilização rápida e responsiva |
| **shadcn/ui** | Biblioteca de componentes UI reutilizáveis baseados em Radix UI |
| **TanStack Query** | Biblioteca para gerenciamento de cache e sincronização de dados do servidor |
| **React Router** | Biblioteca para roteamento em aplicações React single-page |
| **Lucide React** | Biblioteca de ícones SVG modernos e customizáveis |

### Banco de Dados

| Tecnologia | Descrição |
|-----------|-----------|
| **MySQL 8** | Sistema de gerenciamento de banco de dados relacional |
| **InnoDB** | Engine de armazenamento do MySQL que suporta transações e chaves estrangeiras |
| **UTF8MB4** | Charset que suporta caracteres Unicode completos, incluindo emojis |

---

## 📁 Estrutura de Pastas do Backend Java

```
backend-java/
├── src/main/java/br/org/cdlbh/fornecedores/
│   ├── config/                  # Configurações do Spring
│   │   ├── SecurityConfig.java          # Configuração de segurança (JWT, CORS, headers)
│   │   ├── RateLimitConfig.java         # Configuração de rate limiting
│   │   ├── ScheduledTasks.java          # Tarefas agendadas (backup automático)
│   │   └── PermissaoParaConverter.java  # Conversor JSON para List<String>
│   ├── controller/              # Controllers REST (endpoints da API)
│   │   ├── AuthController.java           # Endpoints de autenticação (/api/auth)
│   │   ├── FornecedorController.java     # Endpoints de fornecedores (/api/fornecedores)
│   │   ├── BackupController.java         # Endpoints de backup (/api/backup)
│   │   └── HealthController.java        # Health check (/api/health)
│   ├── dto/                     # Data Transfer Objects (request/response)
│   │   ├── LoginRequest.java            # DTO para requisição de login
│   │   ├── LoginResponse.java           # DTO para resposta de login
│   │   ├── UserResponse.java            # DTO para dados do usuário
│   │   ├── FornecedorRequest.java       # DTO para requisição de fornecedor
│   │   ├── FornecedorResponse.java      # DTO para resposta de fornecedor
│   │   ├── ErrorResponse.java           # DTO para respostas de erro
│   │   └── BackupInfo.java              # DTO para informações de backup
│   ├── entity/                  # Entidades JPA (representam tabelas do banco)
│   │   ├── Usuario.java                  # Entidade de usuários
│   │   ├── Fornecedor.java              # Entidade de fornecedores
│   │   ├── Projeto.java                 # Entidade de projetos
│   │   └── Log.java                     # Entidade de logs de auditoria
│   ├── repository/              # Repositórios Spring Data JPA (acesso a dados)
│   │   ├── UsuarioRepository.java       # Repositório de usuários
│   │   ├── FornecedorRepository.java     # Repositório de fornecedores
│   │   ├── ProjetoRepository.java       # Repositório de projetos
│   │   └── LogRepository.java           # Repositório de logs
│   ├── service/                 # Camada de serviço (regras de negócio)
│   │   ├── AuthService.java              # Serviço de autenticação
│   │   ├── FornecedorService.java       # Serviço de fornecedores
│   │   ├── LogService.java              # Serviço de auditoria
│   │   └── BackupService.java           # Serviço de backup
│   ├── security/                # Componentes de segurança
│   │   ├── JwtProvider.java              # Geração e validação de tokens JWT
│   │   └── JwtAuthenticationFilter.java # Filtro para autenticação via JWT
│   ├── exception/               # Tratamento de exceções
│   │   └── GlobalExceptionHandler.java  # Handler global de erros
│   └── FornecedoresApplication.java    # Classe principal do Spring Boot
├── src/main/resources/
│   ├── application.properties            # Configurações do aplicativo (não commitar)
│   └── application-example.properties   # Template de configurações (versionado)
├── pom.xml                              # Configuração do Maven (dependências)
└── .gitignore                           # Arquivos ignorados pelo Git
```

**Responsabilidades de cada camada:**

- **Controller**: Recebe requisições HTTP, valida entrada, chama services, retorna respostas HTTP
- **Service**: Contém regras de negócio, coordena múltiplos repositories, aplica validações complexas
- **Repository**: Acesso a dados, queries no banco, abstração sobre JPA/Hibernate
- **Entity**: Representação de tabelas do banco como classes Java
- **DTO**: Objetos para transferência de dados entre camadas (não expõe entidades diretamente)

**Diferença em relação ao Express/Node.js:**
- No Express, as rotas fazem tudo junto (validação, lógica, acesso a dados)
- Em Spring Boot, separamos em camadas para melhor organização, testabilidade e manutenção

---

## 🔌 Endpoints da API

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| POST | `/api/auth/login` | ❌ | Login. Body: `{email, password}`. Resposta: `{access_token, user: {id, email, full_name, role}}` |
| GET | `/api/auth/me` | ✅ | Retorna dados do usuário logado (payload do JWT) |
| GET | `/api/health` | ❌ | Retorna `{"status":"ok"}` |
| GET | `/api/fornecedores` | ✅ | Lista todos, ordenado por `created_at DESC` |
| GET | `/api/fornecedores/:id` | ✅ | Detalhe de um fornecedor |
| POST | `/api/fornecedores` | ✅ | Cria fornecedor. Body inclui `cnpj` (opcional, formato 00.000.000/0000-00) |
| PUT | `/api/fornecedores/:id` | ✅ admin | Edita fornecedor. Inclui `cnpj` na atualização |
| DELETE | `/api/fornecedores/:id` | ✅ admin | Exclui fornecedor |
| POST | `/api/backup/generate` | ✅ admin | Gera dump `.sql` via `mysqldump` |
| GET | `/api/backup/list` | ✅ admin | Lista backups existentes |
| GET | `/api/backup/download/:filename` | ✅ admin | Baixa um arquivo de backup |

**Legenda:**
- ✅ = Requer autenticação (token JWT válido)
- ❌ = Público (não requer autenticação)
- admin = Apenas usuários com papel ADMIN

---

## 🚀 Instalação e Execução Local

### Pré-requisitos

- **Java 17+** instalado
- **Maven 3.6+** instalado
- **MySQL 8** instalado e rodando
- **Node.js 18+** e **npm** instalados

### 1. Configurar o Banco de Dados

```bash
# Via linha de comando
mysql -u root -p < db-java/schema.sql

# Ou via MySQL Workbench: File > Run SQL Script > selecionar db-java/schema.sql
```

### 2. Configurar o Backend Java

```bash
cd backend-java

# Instalar dependências
mvn clean install

# Configurar application.properties
cd src/main/resources
copy application-example.properties application.properties

# Editar application.properties com suas configurações:
# - spring.datasource.password: sua senha do MySQL
# - jwt.secret: uma chave secreta forte
# - cors.allowed-origins: URLs do frontend
```

### 3. Rodar o Backend

```bash
cd backend-java
mvn spring-boot:run
```

O backend estará disponível em: http://localhost:8080

### 4. Configurar o Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Configurar .env
# Editar .env e definir:
VITE_API_URL=http://localhost:8080/api
```

### 5. Rodar o Frontend

```bash
cd frontend
npm run dev
```

O frontend estará disponível em: http://localhost:5173

---

## 🔐 Credenciais de Teste

| Papel | E-mail | Senha |
|-------|--------|-------|
| Admin | admin@cdlbh.org.br | admin123 |
| User | (criar via interface) | (definir ao criar) |

---

## 🔒 Segurança Implementada

### Autenticação e Autorização

- **JWT (JSON Web Token)**: Tokens com expiração de 30 minutos
- **BCrypt**: Hash de senhas com força 10
- **Rate Limiting**: 5 tentativas de login em 15 minutos por IP
- **Papéis**: ADMIN (acesso total) e USER (acesso limitado)

### Proteções contra Ataques

| Ataque | Proteção |
|--------|----------|
| SQL Injection | JPA/Hibernate (parametrized queries) |
| XSS | Headers de segurança do Spring Security |
| CSRF | Desabilitado (stateless JWT não precisa) |
| Path Traversal | Validação de filename em download de backup |
| Command Injection | ProcessBuilder com argumentos separados + sanitização |
| Force Brute | Rate limiting no login |
| Token Theft | Token apenas via header Authorization (não query param) |

### Auditoria

- **Logs de auditoria**: Todas as ações CREATE/UPDATE/DELETE são registradas
- **Sanitização de dados sensíveis**: Email, telefone e observação NUNCA são gravados nos logs
- **Diff de alterações**: Logs de UPDATE mostram apenas campos que mudaram

---

## 📦 Backup Automático

O sistema gera backups automáticos a cada hora via `@Scheduled`:

- **Cron expression**: `0 0 * * * *` (início de cada hora)
- **Local**: `backups/backup_<timestamp>.sql`
- **Ferramenta**: `mysqldump` do MySQL

Backups também podem ser gerados manualmente via API (endpoint `/api/backup/generate`).

---

## 🧪 Testes

### Testar API Manualmente

```bash
# Health check
curl http://localhost:8080/api/health

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cdlbh.org.br","password":"admin123"}'

# Listar fornecedores (substitua TOKEN pelo access_token)
curl http://localhost:8080/api/fornecedores \
  -H "Authorization: Bearer TOKEN"
```

### Testar Fluxo Completo

1. Acesse http://localhost:5173
2. Faça login com admin@cdlbh.org.br / admin123
3. Liste fornecedores
4. Crie um novo fornecedor (incluindo CNPJ com máscara automática)
5. Edite o fornecedor
6. Use o botão WhatsApp na tabela para contato direto
7. Exclua o fornecedor
8. Gere um backup
9. Liste os backups
10. Baixe um backup

---

## 📚 Conceitos Importantes para Aprendizado

### Injeção de Dependência (Dependency Injection)

O Spring Boot usa Injeção de Dependência para gerenciar componentes:

- **@Autowired**: Injeta automaticamente uma dependência
- **@Component, @Service, @Repository**: Marcam classes como componentes Spring
- **Benefício**: Não precisamos criar instâncias manualmente, o Spring faz isso

Exemplo:
```java
@Service
public class FornecedorService {
    @Autowired
    private FornecedorRepository repository; // Spring injeta automaticamente
}
```

### Anotações do Spring

| Anotação | Propósito |
|----------|-----------|
| `@Entity` | Marca classe como entidade JPA (tabela do banco) |
| `@Repository` | Marca interface como repositório de dados |
| `@Service` | Marca classe como serviço (regras de negócio) |
| `@Controller` / `@RestController` | Marca classe como controller (endpoints HTTP) |
| `@Autowired` | Injeta dependência automaticamente |
| `@Value` | Injeta valor de propriedade do application.properties |
| `@Transactional` | Marca método como transacional (rollback em erro) |
| `@PreAuthorize` | Restringe acesso baseado em papel/role |
| `@Scheduled` | Agenda execução de método em intervalos regulares |
| `@Valid` | Valida DTO automaticamente |

### Padrões de Projeto

- **Repository Pattern**: Abstrai acesso a dados
- **DTO Pattern**: Separa objetos de transferência de entidades
- **Service Layer**: Isola regras de negócio
- **Filter Chain**: Processa requisições em etapas (JWT filter, security filter, etc.)

---

## ❓ Solução de Problemas

### Backend não inicia

- Verifique se o MySQL está rodando
- Verifique se as credenciais no `application.properties` estão corretas
- Verifique se o schema `cdl_bh_fornecedores_java` foi criado

### Erro de CORS

- Verifique `cors.allowed-origins` no `application.properties`
- Verifique `VITE_API_URL` no `.env` do frontend

### Backup automático não funciona

- Verifique se `mysqldump` está no PATH
- Configure o caminho completo em `mysql.mysqldump-path`
- Verifique se o diretório `backups/` existe

### Token expira constantemente

- Aumente `jwt.expiration` no `application.properties` (valor em milissegundos)

Para mais detalhes, consulte o [GUIA_DE_COMANDOS.md](GUIA_DE_COMANDOS.md).

---

## 📄 Licença

Este projeto é propriedade da Fundação CDL-BH.

---

## 👥 Equipe

Desenvolvido para a Fundação CDL-BH como parte do sistema de gestão de fornecedores.
