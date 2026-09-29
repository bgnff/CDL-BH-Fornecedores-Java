package br.org.cdlbh.fornecedores.dto;

import br.org.cdlbh.fornecedores.entity.Fornecedor;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO para resposta com dados do fornecedor
 * 
 * Mantém o mesmo formato do backend Node.js para compatibilidade
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FornecedorResponse {

    /**
     * ID do fornecedor
     */
    private Long id;

    /**
     * Nome do contato
     */
    private String nome;

    /**
     * Nome da empresa/PF
     */
    private String empresa_pf;

    /**
     * Tipo de pessoa (PJ ou PF)
     */
    private String tipo_pessoa;

    /**
     * Se o fornecedor é favorito
     */
    private Boolean favorito;

    /**
     * CNPJ
     */
    private String cnpj;

    /**
     * E-mail
     */
    private String email;

    /**
     * Telefone
     */
    private String telefone;

    /**
     * Palavras-chave
     */
    private String palavra_chave;

    /**
     * Nome do projeto (retornamos o nome em vez do ID para compatibilidade)
     */
    private String projeto;

    /**
     * Observações
     */
    private String observacao;

    /**
     * Permissões (array de strings)
     */
    private List<String> permissao_para;

    /**
     * Status
     */
    private String status;

    /**
     * Data de criação
     */
    private LocalDateTime created_at;

    /**
     * Data de atualização
     */
    private LocalDateTime updated_at;

    /**
     * Método estático para converter entidade Fornecedor em FornecedorResponse
     * 
     * @param fornecedor Entidade Fornecedor
     * @return FornecedorResponse com os dados do fornecedor
     */
    public static FornecedorResponse fromEntity(Fornecedor fornecedor) {
        FornecedorResponse response = new FornecedorResponse();
        response.setId(fornecedor.getId());
        response.setNome(fornecedor.getNome());
        response.setEmpresa_pf(fornecedor.getEmpresaPf());
        response.setTipo_pessoa(fornecedor.getTipoPessoa() != null ? fornecedor.getTipoPessoa() : "PJ");
        response.setFavorito(fornecedor.getFavorito() != null ? fornecedor.getFavorito() : false);
        response.setCnpj(fornecedor.getCnpj());
        response.setEmail(fornecedor.getEmail());
        response.setTelefone(fornecedor.getTelefone());
        response.setPalavra_chave(fornecedor.getPalavraChave());
        
        // Retorna o nome do projeto em vez do ID para compatibilidade com o frontend
        if (fornecedor.getProjeto() != null) {
            response.setProjeto(fornecedor.getProjeto().getNome());
        }
        
        response.setObservacao(fornecedor.getObservacao());
        response.setPermissao_para(fornecedor.getPermissaoPara());
        response.setStatus(fornecedor.getStatus().name().toLowerCase());
        response.setCreated_at(fornecedor.getCreatedAt());
        response.setUpdated_at(fornecedor.getUpdatedAt());
        return response;
    }
}
