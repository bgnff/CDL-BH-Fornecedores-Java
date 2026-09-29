package br.org.cdlbh.fornecedores.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO para requisição de criação/edição de fornecedor
 * 
 * Validações replicam as do schema Joi do backend Node.js
 * Isso garante que o frontend receba os mesmos erros de validação
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FornecedorRequest {

    /**
     * Nome do contato
     */
    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 200, message = "Nome deve ter entre 2 e 200 caracteres")
    private String nome;

    /**
     * Nome da empresa/PF
     */
    @Size(max = 200, message = "Empresa/PF deve ter no máximo 200 caracteres")
    private String empresa_pf;

    /**
     * Tipo de pessoa (PJ ou PF)
     */
    private String tipo_pessoa;

    /**
     * Indica se o fornecedor é favorito
     */
    private Boolean favorito;

    /**
     * CNPJ ou CPF (opcional)
     * Formato esperado: 00.000.000/0000-00 ou 000.000.000-00
     */
    @Pattern(regexp = "^$|^\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}$|^\\d{14}$|^\\d{3}\\.\\d{3}\\.\\d{3}-\\d{2}$|^\\d{11}$", message = "Documento deve ser um CNPJ ou CPF válido")
    private String cnpj;

    /**
     * E-mail (opcional)
     */
    @jakarta.validation.constraints.Email(message = "E-mail inválido")
    private String email;

    /**
     * Telefone (opcional)
     * Formato esperado: (31) 99999-9999
     */
    @Pattern(regexp = "^$|^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$|^\\d{10,11}$", message = "Telefone deve estar no formato (31) 99999-9999")
    private String telefone;

    /**
     * Palavras-chave para busca
     */
    @Size(max = 300, message = "Palavra-chave deve ter no máximo 300 caracteres")
    private String palavra_chave;

    /**
     * Nome do projeto (string, será convertido para ID)
     * Usamos string em vez de ID para manter compatibilidade com o frontend
     */
    private String projeto;

    /**
     * Observações
     */
    @Size(max = 5000, message = "Observação deve ter no máximo 5000 caracteres")
    private String observacao;

    /**
     * Permissões do fornecedor
     * Lista de strings com valores permitidos
     */
    private List<String> permissao_para;

    /**
     * Status do fornecedor
     */
    private String status;
}
