package br.org.cdlbh.fornecedores.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidade JPA que representa a tabela "projetos" no banco de dados
 * 
 * @Entity: Anotação do JPA que marca esta classe como uma entidade
 * - Indica que esta classe é mapeada para uma tabela no banco de dados
 * - O nome padrão da tabela é o nome da classe (em minúsculas)
 * 
 * @Table: Configurações específicas da tabela
 * - name: Nome da tabela no banco (diferente do nome da classe)
 * - Pode definir índices, constraints, etc.
 * 
 * @Data: Anotação do Lombok que gera automaticamente:
 * - Getters e setters para todos os campos
 * - toString()
 * - equals() e hashCode()
 * - Isso reduz código repetitivo (boilerplate)
 * 
 * @NoArgsConstructor: Gera um construtor sem argumentos
 * - O JPA exige um construtor sem argumentos para instanciar entidades
 * 
 * @AllArgsConstructor: Gera um construtor com todos os argumentos
 * - Útil para criar instâncias com todos os campos preenchidos
 */
@Entity
@Table(name = "projetos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Projeto {

    /**
     * @Id: Marca este campo como chave primária da tabela
     * 
     * @GeneratedValue: Define como o ID é gerado automaticamente
     * - strategy = GenerationType.IDENTITY: O banco de dados gera o ID
     * - No MySQL, isso usa AUTO_INCREMENT
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * @Column: Configurações específicas da coluna no banco
     * - nullable = false: Campo obrigatório (NOT NULL no SQL)
     * - unique = true: Valor deve ser único (UNIQUE constraint no SQL)
     * - length = 100: Tamanho máximo do VARCHAR
     */
    @Column(nullable = false, unique = true, length = 100)
    private String nome;

    /**
     * @Lob: Large Object - para textos longos
     * - Mapeado para TEXT no MySQL
     * - nullable = true: Campo opcional (pode ser NULL)
     */
    @Lob
    @Column(nullable = true)
    private String descricao;

    /**
     * created_at: Timestamp de criação do registro
     * 
     * @Column: name define o nome da coluna (diferente do nome do campo Java)
     * - updatable = false: Este campo não pode ser atualizado após a criação
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * updated_at: Timestamp da última atualização
     * - Este campo é atualizado automaticamente pelo banco via ON UPDATE CURRENT_TIMESTAMP
     */
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    /**
     * @PrePersist: Método executado automaticamente antes de persistir (salvar) a entidade
     * - Usado para definir valores padrão antes de inserir no banco
     * - Aqui: define createdAt e updatedAt com a data/hora atual
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * @PreUpdate: Método executado automaticamente antes de atualizar a entidade
     * - Aqui: atualiza updatedAt com a data/hora atual
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
