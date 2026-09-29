# Guia de Configuração do Supabase — Fundação CDL-BH

Este guia explica como executar os scripts no Supabase e conectar o sistema.

---

## 1. Como executar o Schema no Supabase

1. Acesse o painel do seu projeto no **[Supabase](https://supabase.com/dashboard)**.
2. No menu lateral esquerdo, clique no ícone **SQL Editor** (ícone `>_`).
3. Clique em **+ New Query**.
4. Abra o arquivo [`supabase/schema.sql`](schema.sql), copie todo o conteúdo e cole no editor do Supabase.
5. Clique no botão **Run** (ou pressione `Ctrl + Enter`).
6. Verifique se a execução retornou `Success. No rows returned`.

---

## 2. Inserir Dados Iniciais (Seeds)

1. No SQL Editor do Supabase, abra uma nova aba (**+ New Query**).
2. Abra o arquivo [`supabase/seed.sql`](seed.sql), copie o conteúdo e cole no editor.
3. Clique em **Run**.
4. Os 13 projetos oficiais e fornecedores de exemplo serão inseridos.

---

## 3. Storage para Anexos e Contratos

O script `schema.sql` já cria automaticamente o bucket público chamado `documentos-fornecedores` com as políticas de acesso e upload liberadas.
Para conferir:
1. No menu lateral do Supabase, clique em **Storage**.
2. O bucket `documentos-fornecedores` estará listado.

---

## 4. Obter as Chaves para o Frontend e Netlify

1. No menu lateral, acesse **Project Settings** (ícone de engrenagem) > **API**.
2. Copie:
   - **Project URL** (ex: `https://xyzcompany.supabase.co`) -> Esta é a variável `VITE_SUPABASE_URL`
   - **Project API keys: `anon` / `public`** -> Esta é a variável `VITE_SUPABASE_ANON_KEY`
3. Configure estas variáveis no arquivo `.env` do frontend ou no painel de Environment Variables da **Netlify**.

---

## 5. Tabela de Beneficiários (Migration)

Para habilitar o módulo de Beneficiários:
1. No **SQL Editor** do Supabase, crie uma **+ New Query**.
2. Abra o arquivo [`supabase/migration_beneficiarios.sql`](migration_beneficiarios.sql), copie todo o conteúdo e cole no editor.
3. Clique em **Run**.

---

## 6. Favoritos e Tipo de Pessoa PJ/PF (Migration)

Para habilitar a favoritação de fornecedores/beneficiários e o tipo de pessoa (PJ/PF):
1. No **SQL Editor** do Supabase, crie uma **+ New Query**.
2. Abra o arquivo [`supabase/migration_favoritos_e_tipo_pessoa.sql`](migration_favoritos_e_tipo_pessoa.sql), copie todo o conteúdo e cole no editor.
3. Clique em **Run**.

---

## 7. Prestadores e Parceiros (Migration)

Para habilitar as seções de Prestadores de Serviços e Parceiros Institucionais:
1. No **SQL Editor** do Supabase, crie uma **+ New Query**.
2. Abra o arquivo [`supabase/migration_prestadores_e_parceiros.sql`](migration_prestadores_e_parceiros.sql), copie todo o conteúdo e cole no editor.
3. Clique em **Run**.


