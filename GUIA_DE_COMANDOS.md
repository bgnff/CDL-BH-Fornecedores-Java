# Guia de Comandos - Sistema de Gestão de Fornecedores (Java)

Este guia contém todos os comandos necessários para configurar e rodar o projeto localmente.

---

## PORTAS UTILIZADAS

- **MySQL**: 3306 (padrão)
- **Backend Java (Spring Boot)**: 8080
- **Frontend React (Vite)**: 5173

---

## 1. CONFIGURAÇÃO DO BANCO DE DADOS

### Via linha de comando (MySQL)

```bash
# Acessar o MySQL
mysql -u root -p

# Criar o schema e tabelas (executar o arquivo SQL)
source c:/Users/bgn/Desktop/FCDL-BH-Java/db-java/schema.sql

# Ou em uma linha:
mysql -u root -p < c:/Users/bgn/Desktop/FCDL-BH-Java/db-java/schema.sql
```

### Via MySQL Workbench

1. Abra o MySQL Workbench
2. Conecte ao seu servidor MySQL
3. Vá em **File > Run SQL Script...**
4. Selecione o arquivo: `c:/Users/bgn/Desktop/FCDL-BH-Java/db-java/schema.sql`
5. Clique em **Run**

### Verificar se o schema foi criado

```bash
mysql -u root -p -e "USE cdl_bh_fornecedores_java; SHOW TABLES;"
```

Saída esperada:
```
+----------------------------+
| Tables_in_cdl_bh_fornecedores_java |
+----------------------------+
| backup_metadata            |
| documentos                 |
| fornecedores              |
| logs                      |
| projetos                  |
| usuarios                  |
+----------------------------+
```

---

## 2.1 CONFIGURAÇÃO DO BINARY LOG (BINLOG) - PRÉ-REQUISITO PARA BACKUPS INCREMENTAIS

Para que backups incrementais funcionem, o **binary log** deve estar habilitado no MySQL.

### O que é o Binary Log?

O binlog é um arquivo sequencial que registra todas as alterações no banco (INSERT/UPDATE/DELETE/DDL). Cada evento no binlog tem uma posição única. Backups incrementais usam essas posições para saber "de onde" começar a capturar mudanças.

### Como habilitar no MySQL (Windows)

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

### Explicação das configurações

- `log-bin=mysql-bin`: Habilita o binary log com prefixo "mysql-bin"
- `server-id=1`: Identificador único do servidor (obrigatório para binlog)
- `binlog_expire_logs_seconds=604800`: Mantém 7 dias de binlogs (604800 segundos), depois expira automaticamente

### Verificar se o binlog está ativo

```bash
mysql -u root -p -e "SHOW VARIABLES LIKE 'log_bin';"
```

Saída esperada:
```
+---------------+-------+
| Variable_name | Value |
+---------------+-------+
| log_bin       | ON    |
+---------------+-------+
```

---

## 2. CONFIGURAÇÃO DO BACKEND JAVA

### Instalar dependências Maven

```bash
cd c:/Users/bgn/Desktop/FCDL-BH-Java/backend-java

# Baixar dependências e compilar
mvn clean install
```

### Configurar application.properties

```bash
# Copiar o template
cd c:/Users/bgn/Desktop/FCDL-BH-Java/backend-java/src/main/resources
copy application-example.properties application.properties

# Editar application.properties com suas configurações:
# - spring.datasource.password: sua senha do MySQL
# - jwt.secret: uma chave secreta forte para JWT
# - cors.allowed-origins: URLs do frontend permitidas
```

### Rodar o backend (desenvolvimento)

```bash
cd c:/Users/bgn/Desktop/FCDL-BH-Java/backend-java

# Rodar com Maven
mvn spring-boot:run

# Ou rodar o JAR compilado (após mvn package)
javajar target/fornecedores-backend-1.0.0-SNAPSHOT.jar
```

O backend estará disponível em: http://localhost:8080

### Testar se o backend está rodando

```bash
# Health check
curl http://localhost:8080/api/health

# Saída esperada: {"status":"ok"}
```

---

## 3. CONFIGURAÇÃO DO FRONTEND REACT

### Instalar dependências npm

```bash
cd c:/Users/bgn/Desktop/FCDL-BH-Java/frontend

# Instalar dependências
npm install
```

### Configurar .env

```bash
cd c:/Users/bgn/Desktop/FCDL-BH-Java/frontend

# Editar o arquivo .env
# Alterar VITE_API_URL para apontar para o backend Java:
VITE_API_URL=http://localhost:8080/api
```

### Rodar o frontend (desenvolvimento)

```bash
cd c:/Users/bgn/Desktop/FCDL-BH-Java/frontend

# Rodar servidor de desenvolvimento
npm run dev
```

O frontend estará disponível em: http://localhost:5173

---

## 4. GERAR HASH DE SENHA BCRIPT

Para criar novos usuários manualmente no banco, você precisa gerar o hash bcrypt da senha.

### Via Java (recomendado)

Crie uma classe temporária no projeto:

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GerarHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String senha = "sua_senha_aqui";
        String hash = encoder.encode(senha);
        System.out.println("Hash: " + hash);
    }
}
```

Rode com:
```bash
cd c:/Users/bgn/Desktop/FCDL-BH-Java/backend-java
mvn exec:java -Dexec.mainClass="GerarHash"
```

### Via online (apenas para testes)

Use: https://bcrypt-generator.com/
- Força: 10
- Gerar hash e copiar

### Inserir usuário manualmente no banco

```sql
USE cdl_bh_fornecedores_java;

INSERT INTO usuarios (nome, email, senha_hash, role) VALUES
('Nome do Usuário', 'email@exemplo.com', '$2a$10$SEU_HASH_AQUI', 'user');
```

---

## 5. GERAR BACKUP MANUAL

### Via API (requer autenticação de admin)

```bash
# 1. Faça login para obter o token
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@cdlbh.org.br\",\"password\":\"admin123\"}"

# Copie o access_token da resposta

# 2. Gerar backup
curl -X POST http://localhost:8080/api/backup/generate \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# 3. Listar backups
curl -X GET http://localhost:8080/api/backup/list \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"

# 4. Baixar backup
curl -X GET http://localhost:8080/api/backup/download/NOME_DO_ARQUIVO.sql \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -o backup.sql
```

### Via linha de comando (mysqldump direto)

```bash
mysqldump -u root -p cdl_bh_fornecedores_java > backup_manual.sql
```

---

## 5.1 POLÍTICA DE BACKUP AUTOMÁTICO

O sistema implementa uma política de backup híbrida (FULL + INCREMENTAL):

### Horários dos Backups

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

---

## 6. VERIFICAR BACKUPS GERADOS

### Via linha de comando

```bash
cd c:/Users/bgn/Desktop/FCDL-BH-Java/backups

# Listar backups
dir

# Ver tamanho de um backup
dir backup_*.sql
```

### Via API

```bash
curl -X GET http://localhost:8080/api/backup/list \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 7. COMANDOS ÚTEIS DO MAVEN

```bash
cd c:/Users/bgn/Desktop/FCDL-BH-Java/backend-java

# Limpar arquivos de compilação
mvn clean

# Compilar o projeto
mvn compile

# Empacotar como JAR
mvn package

# Rodar testes
mvn test

# Compilar, empacotar e pular testes
mvn package -DskipTests

# Ver árvore de dependências
mvn dependency:tree
```

---

## 8. COMANDOS ÚTEIS DO NPM (Frontend)

```bash
cd c:/Users/bgn/Desktop/FCDL-BH-Java/frontend

# Limpar cache e node_modules
rmdir /s /q node_modules
del package-lock.json
npm install

# Build para produção
npm run build

# Preview do build de produção
npm run preview
```

---

## 9. SOLUÇÃO DE PROBLEMAS

### Backend não inicia (erro de conexão com MySQL)

```bash
# Verificar se o MySQL está rodando
# Windows: serviços.msc > MySQL80 > Status

# Testar conexão manual
mysql -u root -p -h localhost cdl_bh_fornecedores_java

# Verificar application.properties
# - URL do banco está correta?
# - Usuário e senha estão corretos?
```

### Erro de porta já em uso

```bash
# Verificar qual processo está usando a porta 8080
netstat -ano | findstr :8080

# Matar o processo (substitua PID pelo ID do processo)
taskkill /PID PID /F

# Ou mudar a porta em application.properties:
server.port=8081
```

### Erro de CORS no frontend

```bash
# Verificar application.properties do backend:
cors.allowed-origins=http://localhost:5173

# Verificar .env do frontend:
VITE_API_URL=http://localhost:8080/api
```

### Backup automático não funciona

```bash
# Verificar se mysqldump está no PATH
mysqldump --version

# Se não estiver, configure o caminho completo em application.properties:
mysql.mysqldump-path=C:/Program Files/MySQL/MySQL Server 8.0/bin/mysqldump.exe

# Verificar se mysqlbinlog está no PATH (para backups incrementais)
mysqlbinlog --version

# Se não estiver, configure o caminho completo em application.properties:
mysql.mysqlbinlog-path=C:/Program Files/MySQL/MySQL Server 8.0/bin/mysqlbinlog.exe

# Verificar se o diretório de backups existe
cd c:/Users/bgn/Desktop/FCDL-BH-Java/backups
dir
```

### Erro 404 em endpoint que deveria existir

Se você receber 404 Not Found em um endpoint que existe no código (ex: `/api/auth/me`), o problema geralmente é que o Maven não recompilou o código-fonte antes de rodar:

```bash
# Solução: limpar e recompilar antes de rodar
cd c:/Users/bgn/Desktop/FCDL-BH-Java/backend-java
mvn clean spring-boot:run
```

**Por que isso acontece?**
- O Maven pode não recompilar se os arquivos `.class` na pasta `target/` já estiverem atualizados
- Isso pode acontecer após alterações no código que adicionam novos endpoints
- O `mvn clean` apaga a pasta `target/`, garantindo um build 100% limpo

**Prevenção futura:**
- Sempre que adicionar um novo endpoint ou modificar rotas existentes, use `mvn clean spring-boot:run`
- Isso evita perder tempo depurando um problema que já não existe no código-fonte atual

---

## 10. FLUXO COMPLETO DE TESTE

Após configurar tudo, teste o fluxo completo:

1. **Iniciar MySQL** (se não estiver rodando)
2. **Criar schema** (se ainda não criou)
3. **Iniciar backend**: `mvn spring-boot:run`
4. **Iniciar frontend**: `npm run dev`
5. **Acessar**: http://localhost:5173
6. **Login**: admin@cdlbh.org.br / admin123
7. **Testar funcionalidades**:
   - Listar fornecedores
   - Criar novo fornecedor (incluindo CNPJ com máscara automática 00.000.000/0000-00)
   - Editar fornecedor (apenas admin)
   - Usar botão WhatsApp na tabela para contato direto
   - Excluir fornecedor (apenas admin)
   - Gerar backup (apenas admin)
   - Listar backups (apenas admin)
   - Baixar backup (apenas admin)

---

## 11. PARAR SERVIÇOS

```bash
# Parar backend: Ctrl+C no terminal onde está rodando

# Parar frontend: Ctrl+C no terminal onde está rodando

# Parar MySQL (Windows):
# serviços.msc > MySQL80 > Parar
```

---

## 12. LIMPAR E REINICIAR

```bash
# Limpar tudo e recomeçar
cd c:/Users/bgn/Desktop/FCDL-BH-Java/backend-java
mvn clean

cd c:/Users/bgn/Desktop/FCDL-BH-Java/frontend
rmdir /s /q node_modules
del package-lock.json
npm install

# Recriar banco (cuidado: apaga dados!)
mysql -u root -p -e "DROP DATABASE IF EXISTS cdl_bh_fornecedores_java;"
mysql -u root -p < c:/Users/bgn/Desktop/FCDL-BH-Java/db-java/schema.sql
```
