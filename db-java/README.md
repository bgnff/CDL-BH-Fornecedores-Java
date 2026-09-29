# Estrutura de Banco de Dados — Fundação CDL-BH (MySQL)

Este diretório contém os scripts DDL (estrutura), DML (cargas iniciais), migrations incrementais e consultas de diagnóstico para o banco de dados **MySQL** do sistema.

---

## 📁 Organização dos Arquivos

| Arquivo | Finalidade | Quando Executar |
| :--- | :--- | :--- |
| **`01_schema_completo_mysql.sql`** *(ou `schema.sql`)* | Schema completo e atualizado do zero (Projetos, Usuários, Fornecedores, Documentos, Beneficiários, Logs e Backups). | Na **instalação inicial** ou recriação limpa do banco. |
| **`02_migration_ajuste_roles_enum.sql`** | Ajusta a coluna `role` da tabela `usuarios` para `ENUM('ADMIN', 'USER')` compatível com Spring Security. | Se você já possui um banco legado criado anteriormente. |
| **`03_migration_ajuste_status_fornecedor.sql`** | Padroniza a coluna `status` da tabela `fornecedores` para `ENUM('ATIVO', 'INATIVO')`. | Se você já possui um banco legado criado anteriormente. |
| **`04_migration_adicionar_tabela_beneficiarios.sql`** | Cria a nova tabela `beneficiarios` com índices, busca textual e chave estrangeira para `projetos`. | **Obrigatório** para bases existentes que ainda não possuem a tabela de beneficiários. |
| **`05_seed_usuarios_iniciais.sql`** | Cadastra ou atualiza os usuários padrão (`admin@cdlbh.org.br` e `user@cdlbh.org.br`) com hashes BCrypt válidos. | Para inicializar ou resetar acessos de administradores. |
| **`06_seed_beneficiarios_exemplo.sql`** | Insere os beneficiários de demonstração vinculados aos projetos sociais oficiais. | Opcional, para testes ou demonstração com dados realistas. |
| **`07_migration_favoritos_e_tipo_pessoa.sql`** | Adiciona as colunas `favorito` e `tipo_pessoa` (PJ/PF) para fornecedores e `favorito` para beneficiários. | **Obrigatório** para bases que receberem as novas funções de favoritos e PF/PJ. |
| **`08_migration_prestadores_e_parceiros.sql`** | Cria as novas tabelas `prestadores` e `parceiros` com índices, favoritos, tipo PJ/PF e vínculos com projetos. | **Obrigatório** para suportar as seções de Prestadores e Parceiros. |


---

## 🔍 Subpasta `diagnosticos/`

Scripts de leitura/consulta rápida para validar o estado do banco:
- **`diagnosticos/verificar_usuarios.sql`**: Lista todos os usuários, seus papéis e datas de cadastro.
- **`diagnosticos/verificar_fornecedores.sql`**: Lista fornecedores, seus status e projetos associados.
- **`diagnosticos/verificar_estrutura_tabelas.sql`**: Executa `SHOW TABLES` e `DESCRIBE` em todas as tabelas.

---

## 🚀 Como Aplicar no MySQL

### Cenário A: Instalação Limpa (Recomendado para novos ambientes)
Basta rodar o schema completo:
```bash
mysql -u root -p < db-java/schema.sql
```

### Cenário B: Atualização de Banco Existente (Sem perder dados)
Execute as migrations em ordem numérica sequencial:
```bash
mysql -u root -p cdl_bh_fornecedores_java < db-java/02_migration_ajuste_roles_enum.sql
mysql -u root -p cdl_bh_fornecedores_java < db-java/03_migration_ajuste_status_fornecedor.sql
mysql -u root -p cdl_bh_fornecedores_java < db-java/04_migration_adicionar_tabela_beneficiarios.sql
mysql -u root -p cdl_bh_fornecedores_java < db-java/05_seed_usuarios_iniciais.sql
mysql -u root -p cdl_bh_fornecedores_java < db-java/06_seed_beneficiarios_exemplo.sql
```
