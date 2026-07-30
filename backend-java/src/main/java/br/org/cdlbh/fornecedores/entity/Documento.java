package br.org.cdlbh.fornecedores.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidade JPA que representa a tabela "documentos" no banco de dados
 * 
 * Esta entidade armazena documentos vinculados aos fornecedores (contratos, certidões, etc.)
 */
@Entity
@Table(name = "documentos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Documento {

    /**
     * Chave primária auto-incrementada
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Chave estrangeira para fornecedores
     * 
     * @ManyToOne: Relacionamento muitos-para-um
     * - Muitos documentos podem pertencer ao mesmo fornecedor
     * - Cada documento tem apenas um fornecedor
     * 
     * @JoinColumn: Configura a coluna de chave estrangeira
     * - name: Nome da coluna FK no banco (fornecedor_id)
     * - referencedColumnName: Coluna referenciada na tabela fornecedores (id)
     * - nullable = false: Um documento deve ter um fornecedor associado
     */
    @ManyToOne
    @JoinColumn(name = "fornecedor_id", referencedColumnName = "id", nullable = false)
    private Fornecedor fornecedor;

    /**
     * Nome/descrição do documento
     */
    @Column(nullable = false, length = 200)
    private String nome;

    /**
     * Tipo de documento
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Tipo tipo;

    /**
     * Data de vencimento do documento (opcional)
     */
    @Column(name = "data_vencimento")
    private LocalDate dataVencimento;

    /**
     * URL do arquivo armazenado (pode ser S3, local, etc.)
     */
    @Column(name = "arquivo_url", length = 500)
    private String arquivoUrl;

    /**
     * Observações adicionais sobre o documento
     * - @Lob: Large Object - mapeado para TEXT no MySQL
     */
    @Lob
    @Column
    private String observacao;

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
     * Enum que define os tipos possíveis de documento
     * 
     * IMPORTANTE: Os valores estão em Title Case para compatibilidade com o banco
     * O banco usa ENUM('Contrato','Certidão','Nota Fiscal','Alvará','Outro')
     */
    public enum Tipo {
        Contrato,
        Certidão,
        Nota_Fiscal,
        Alvará,
        Outro
    }

    /**
     * @PrePersist: Define createdAt e updatedAt antes de salvar
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        
        // Define tipo padrão como Outro se não foi definido
        if (tipo == null) {
            tipo = Tipo.Outro;
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
