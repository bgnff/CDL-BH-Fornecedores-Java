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

O sistema implementa uma política de backup híbrida (FULL + INCREMENTAL) para maximizar eficiência e segurança dos dados:

### Política de Backup

- **Backup FULL**: Todos os dias às 01:00 da manhã
  - Gera um dump completo do banco via `mysqldump`
  - Arquivo maior, demora mais para gerar
  - Contém todos os dados do banco no momento do backup
  - Cron: `0 0 1 * * *`

- **Backup INCREMENTAL**: De 3 em 3 horas (08:00, 11:00, 14:00, 17:00, 20:00, 23:00)
  - Gera apenas as mudanças desde o último backup via `mysqlbinlog`
  - Arquivo pequeno, rápido para gerar
  - Contém apenas as alterações (INSERT/UPDATE/DELETE/DDL) desde o último backup
  - Cron: `0 0 8,11,14,17,20,23 * * *`

### Diferença entre FULL e INCREMENTAL

| Tipo | Descrição | Vantagens | Desvantagens |
|------|-----------|-----------|--------------|
| **FULL** | Dump completo do banco via mysqldump | Restauração simples e rápida | Arquivo grande, demora mais para gerar |
| **INCREMENTAL** | Apenas mudanças via binary log (binlog) | Arquivo pequeno, rápido para gerar | Restauração requer aplicar FULL + incrementais em ordem |

### Pré-requisitos: Binary Log (Binlog)

Para que backups incrementais funcionem, o **binary log** deve estar habilitado no MySQL:

**O que é o Binary Log?**
- O binlog é um arquivo sequencial que registra todas as alterações no banco (INSERT/UPDATE/DELETE/DDL)
- Cada evento no binlog tem uma posição única
- Backups incrementais usam essas posições para saber "de onde" começar a capturar mudanças

**Como habilitar no MySQL (Windows):**

1. Abra o arquivo `my.ini` (geralmente em `C:\ProgramData\MySQL\MySQL Server 8.0\my.ini`)
2. Adicione ou modifique as seguintes linhas na seção `[mysqld]`:

```ini
[mysqld]
log-bin=mysql-bin
server-id=1
binlog_expire_logs_seconds=604800
```

3. Reinicie o serviço MySQL:
```bash
net stop MySQL80
net start MySQL80
```

**Explicação das configurações:**
- `log-bin=mysql-bin`: Habilita o binary log com prefixo "mysql-bin"
- `server-id=1`: Identificador único do servidor (obrigatório para binlog)
- `binlog_expire_logs_seconds=604800`: Mantém 7 dias de binlogs (604800 segundos), depois expira automaticamente

### Como Funciona a Restauração

Para restaurar o banco a um ponto específico:

1. **Restaurar o último backup FULL**
   ```bash
   mysql -u root -p cdl_bh_fornecedores_java < backup_2024-01-15T01-00-00-000.sql
   ```

2. **Aplicar os incrementais em ordem cronológica**
   ```bash
   mysql -u root -p cdl_bh_fornecedores_java < incremental_2024-01-15T08-00-00-000.sql
   mysql -u root -p cdl_bh_fornecedores_java < incremental_2024-01-15T11-00-00-000.sql
   mysql -u root -p cdl_bh_fornecedores_java < incremental_2024-01-15T14-00-00-000.sql
   # ... e assim por diante até o ponto desejado
   ```

**Importante:** Os incrementais devem ser aplicados **na ordem cronológica** correta, do mais antigo para o mais recente.

### Metadados de Backup

O sistema mantém uma tabela `backup_metadata` que rastreia cada backup executado:
- `tipo`: FULL ou INCREMENTAL
- `arquivo`: Nome do arquivo gerado
- `binlog_file`: Nome do arquivo de binlog no momento do backup
- `binlog_position`: Posição dentro do binlog (ponto de partida para o próximo incremental)
- `executado_em`: Timestamp de quando o backup foi executado

Esta tabela é essencial para que o sistema saiba de onde cada backup incremental deve começar.

### Backup Manual

Backups também podem ser gerados manualmente via API (endpoint `/api/backup/generate`), que gera um backup FULL sob demanda.

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

## 📝 Notas sobre Migração do Node.js para Java

Este projeto é uma migração do backend Node.js/Express para Java/Spring Boot:

- **Schema separado**: `cdl_bh_fornecedores_java` (não conflita com o schema Node.js)
- **API idêntica**: Mesmos endpoints, mesmos formatos de request/response
- **Frontend reaproveitado**: Nenhuma alteração necessária no código React
- **Melhorias**: Tabela `projetos` separada (mais flexível que ENUM), FKs formais

O projeto Node.js original continua existindo em `AmbienteTeste-FCDL2026/` como referência.

---

## 🤝 Contribuindo

Este é um projeto da Fundação CDL-BH. Para contribuições:

1. Faça um fork do projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

---

## 📄 Licença

Este projeto é propriedade da Fundação CDL-BH.

---

## 👥 Equipe

Desenvolvido para a Fundação CDL-BH como parte do sistema de gestão de fornecedores.
