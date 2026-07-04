package br.org.cdlbh.fornecedores.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Entidade JPA que representa a tabela "fornecedores" no banco de dados
 * 
 * Esta entidade armazena os fornecedores/parceiros da fundação
 */
@Entity
@Table(name = "fornecedores")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Fornecedor {

    /**
     * Chave primária auto-incrementada
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nome do contato principal
     */
    @Column(nullable = false, length = 200)
    private String nome;

    /**
     * Nome da empresa ou Pessoa Física
     */
    @Column(nullable = false, length = 200)
    private String empresaPf;

    /**
     * CNPJ do fornecedor (opcional)
     * Formato: 00.000.000/0000-00 (apenas para exibição, armazenado sem formatação)
     */
    @Column(length = 20)
    private String cnpj;

    /**
     * E-mail de contato (opcional)
     */
    @Column(length = 200)
    private String email;

    /**
     * Telefone de contato (opcional)
     */
    @Column(length = 30)
    private String telefone;

    /**
     * Palavras-chave para busca (ex: "fraldas, higiene")
     */
    @Column(length = 300)
    private String palavraChave;

    /**
     * Chave estrangeira para a tabela projetos
     * 
     * @ManyToOne: Relacionamento muitos-para-um
     * - Muitos fornecedores podem pertencer ao mesmo projeto
     * - Cada fornecedor tem apenas um projeto
     * 
     * @JoinColumn: Configura a coluna de chave estrangeira
     * - name: Nome da coluna FK no banco (projeto_id)
     * - referencedColumnName: Coluna referenciada na tabela projetos (id)
     * - nullable = true: Um fornecedor pode não ter projeto associado
     */
    @ManyToOne
    @JoinColumn(name = "projeto_id", referencedColumnName = "id", nullable = true)
    private Projeto projeto;

    /**
     * Observações adicionais
     * - @Lob: Large Object - mapeado para TEXT no MySQL
     */
    @Lob
    @Column
    private String observacao;

    /**
     * Permissões do fornecedor - armazenado como JSON no banco
     * 
     * No Java, representamos como List<String>
     * O JPA converterá automaticamente para JSON usando um AttributeConverter
     * (será implementado na camada de configuração)
     */
    @Column(columnDefinition = "JSON")
    private List<String> permissaoPara;

    /**
     * Status do fornecedor
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    /**
     * Timestamp de criação
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * Timestamp da última atualização
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * Enum que define os status possíveis do fornecedor
     */
    public enum Status {
        ATIVO,
        INATIVO
    }

    /**
     * @PrePersist: Define createdAt e updatedAt antes de salvar
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        // Define status padrão como ATIVO se não foi definido
        if (status == null) {
            status = Status.ATIVO;
        }
        
        // Define permissão padrão como lista vazia se não foi definida
        if (permissaoPara == null) {
            permissaoPara = List.of();
        }
    }

    /**
     * @PreUpdate: Atualiza updatedAt antes de modificar
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
