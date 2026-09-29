# Guia Oficial de Registro de Software e Patenteabilidade no INPI
**Autor Titular:** Brayan Oliveira de Souza  
**Projeto:** Sistema de Gestão de Fornecedores e Parceiros (Java Spring Boot + React)  
**Data:** 2026

---

## 1. Patente vs. Registro de Software no Brasil: O que diz a Lei

Muitos desenvolvedores buscam "patentear um software", mas no ordenamento jurídico brasileiro existe uma distinção legal fundamental:

1. **Software em Si (Linhas de Código, Algoritmos, Arquitetura e Telas):**
   - **Regulamentação:** Lei nº 9.609/1998 (Lei do Software) e Lei nº 9.610/1998 (Lei de Direitos Autorais).
   - **Vedação de Patente:** O Artigo 10, Inciso V, da Lei de Propriedade Industrial (Lei nº 9.279/1996) estabelece que **programas de computador em si NÃO são considerados invenção nem modelo de utilidade**.
   - **Forma Correta de Proteção:** **Registro de Programa de Computador no INPI** (Instituto Nacional da Propriedade Industrial). Esse registro confere proteção autoral e patrimonial válida internacionalmente (em mais de 175 países da Convenção de Berna e Acordo TRIPS) por **50 anos**.

2. **Quando cabe uma Patente de Invenção (CII - Computer Implemented Inventions):**
   - Cabe patente apenas se o software estiver indissociavelmente vinculado a um processo técnico inovador, atuando diretamente sobre dispositivos de hardware externos, sensores, maquinário industrial ou solucionando um problema técnico novo no mundo físico, produzindo um "efeito técnico adicional".
   - Sistemas web e corporativos de gestão (CRUDs, ERPs, gestão de fornecedores, autenticação e relatórios) enquadram-se perfeitamente e com proteção total no **Registro de Software no INPI**, e não em patente industrial.

---

## 2. Vantagens do Registro no INPI para Brayan Oliveira de Souza

- **Segurança Jurídica Absoluta:** O registro no INPI gera presunção legal de anterioridade e titularidade exclusiva em favor de **Brayan Oliveira de Souza**.
- **Validade Internacional:** Reconhecido em 175+ países sem necessidade de registro individual em cada país.
- **Valorização de Ativos e Negociação:** Permite licenciar, vender, auferir royalties ou aportar o software como capital em empresas/startups.
- **Processo 100% Digital e Rápido:** O INPI leva em média de **7 a 10 dias úteis** para emitir o Certificado de Registro após o envio do formulário eletrônico.
- **Sigilo do Código-Fonte:** O INPI **não armazena o seu código-fonte**. Você envia apenas o **Hash Criptográfico (SHA-512)** do pacote compactado. Você mantém o arquivo confidencial em sua posse.

---

## 3. Passo a Passo Prático para Registrar o Software no INPI

### Passo 1: Cadastro no Portal do INPI
1. Acesse o portal do INPI: [https://www.gov.br/inpi/pt-br](https://www.gov.br/inpi/pt-br)
2. Clique em **Acesso Rápido > Sistema e-INPI (Cadastre-se)**.
3. Cadastre-se como **Pessoa Física** (Brayan Oliveira de Souza).

### Passo 2: Emissão e Pagamento da GRU (Guia de Recolhimento da União)
1. No menu do e-INPI, acesse **Emissão de GRU**.
2. Selecione a unidade: **Programas de Computador**.
3. Escolha o serviço:
   - **Código 730:** *Pedido de Registro de Programa de Computador* (valor com desconto legal para pessoa física e MEI).
4. Pague a GRU (via PIX, cartão ou boleto bancário) e guarde o **Número da GRU**.

### Passo 3: Geração do Hash SHA-512 do Código-Fonte
O INPI exige que você calcule o hash criptográfico **SHA-512** de uma pasta zipada contendo todo o código-fonte da aplicação.

Abra o PowerShell na pasta do projeto e execute:

```powershell
# 1. Compactar o código limpo (excluindo node_modules, target e backups)
Compress-Archive -Path backend-java/src, frontend/src, db-java, supabase, README.md, pom.xml, package.json -DestinationPath cdlbh_fornecedores_fonte.zip -Force

# 2. Gerar o resumo hash SHA-512 oficial exigido pelo INPI
Get-FileHash -Path cdlbh_fornecedores_fonte.zip -Algorithm SHA512 | Select-Object -ExpandProperty Hash
```

> **IMPORTANTE:** Guarde o arquivo `cdlbh_fornecedores_fonte.zip` original em local seguro (Drive, nuvem e backup offline). Se houver litígio futuro, a integridade do arquivo gerará exatamente o mesmo hash registrado no INPI.

### Passo 4: Preenchimento do Sistema e-Software no INPI
1. Acesse o sistema **e-Software** no portal do INPI com seu login gov.br.
2. Insira o **Número da GRU** paga.
3. Preencha os campos obrigatórios:
   - **Título do Programa:** *Sistema de Gestão e Auditoria de Fornecedores e Parceiros*
   - **Data de Conclusão da Criação:** 2026
   - **Linguagens de Programação:** Java, JavaScript, SQL, HTML/CSS
   - **Campo de Aplicação:** Gestão Empresarial / Terceiro Setor / Governança e Compliance
   - **Tipo de Programa:** Aplicação Web Client-Server (REST API & SPA)
   - **Resumo Hash (SHA-512):** Cole a sequência de caracteres gerada no Passo 3.
   - **Autor(es):** Brayan Oliveira de Souza
   - **Titular(es):** Brayan Oliveira de Souza (Pessoa Física) ou em copropriedade se houver contrato institucional.

### Passo 5: Assinatura Digital e Protocolo
1. Faça o download da **Declaração de Veracidade (DV)** gerada pelo sistema.
2. Assine o documento eletronicamente via **Assinador Digital GOV.BR** (gratuito para contas Prata ou Ouro em [assinador.iti.br](https://assinador.iti.br)).
3. Faça o upload do documento assinado no e-Software e clique em **Finalizar Pedido**.
4. Baixe o **Recibo de Envio**. Em até 10 dias a Revista da Propriedade Industrial (RPI) publicará a concessão do seu certificado.

---

## 4. Medidas Adicionais de Proteção Intelectual Imediatas

1. **Cabeçalho de Direitos Autorais em Arquivos-Fonte:**  
   Adicionar nos arquivos principais a indicação:
   ```
   Copyright (c) 2026 Brayan Oliveira de Souza. All rights reserved.
   ```
2. **Repositório Git Privado:**  
   Mantenha repositórios proprietários como **Private** no GitHub/GitLab até que o registro no INPI seja protocolado ou quando houver intenção formal de publicação open-source.
3. **Registro de Marca (Se aplicável):**  
   Caso o nome do software ou serviço venha a ser comercializado como produto autônomo (SaaS), recomenda-se protocolar também o registro de marca na classe NCL(12) 42 (Serviços de software) no INPI.
