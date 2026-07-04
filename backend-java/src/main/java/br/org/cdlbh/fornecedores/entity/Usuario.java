package br.org.cdlbh.fornecedores.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidade JPA que representa a tabela "usuarios" no banco de dados
 * 
 * Esta entidade armazena os usuários do sistema com suas credenciais e papéis
 */
@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    /**
     * Chave primária auto-incrementada
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Nome completo do usuário
     * - nullable = false: Campo obrigatório
     * - length = 150: Tamanho máximo do VARCHAR
     */
    @Column(nullable = false, length = 150)
    private String nome;

    /**
     * E-mail do usuário
     * - nullable = false: Campo obrigatório
     * - unique = true: Não pode haver dois usuários com o mesmo e-mail
     * - length = 200: Tamanho máximo do VARCHAR
     */
    @Column(nullable = false, unique = true, length = 200)
    private String email;

    /**
     * Hash da senha (NUNCA armazenar senha em texto plano!)
     * - O hash é gerado usando BCryptPasswordEncoder
     * - length = 255: Suficiente para hashes bcrypt (60 caracteres)
     * - name = "senha_hash": Mapeamento explícito para a coluna no banco (snake_case)
     */
    @Column(name = "senha_hash", nullable = false, length = 255)
    private String senhaHash;

    /**
     * Papel do usuário no sistema
     * - @Enumerated: Define como o enum é persistido no banco
     * - EnumType.STRING: Armazena o nome do enum como string ('admin', 'user')
     * - Alternativa seria ORDINAL (armazena 0, 1, 2...), mas STRING é mais legível
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

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
     * Enum que define os papéis possíveis no sistema
     * - ADMIN: Acesso total (pode criar, editar, excluir fornecedores e gerar backups)
     * - USER: Acesso limitado (pode apenas visualizar e criar fornecedores)
     */
    public enum Role {
        ADMIN,
        USER
    }

    /**
     * @PrePersist: Define createdAt e updatedAt antes de salvar
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * @PreUpdate: Atualiza updatedAt antes de modificar
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
