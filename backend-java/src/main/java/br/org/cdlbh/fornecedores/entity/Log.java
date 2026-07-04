package br.org.cdlbh.fornecedores.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Entidade JPA que representa a tabela "logs" no banco de dados
 * 
 * Esta entidade armazena o registro de auditoria de todas as ações no sistema
 * CRÍTICO PARA SEGURANÇA: Permite rastrear quem fez o quê e quando
 */
@Entity
@Table(name = "logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Log {

    /**
     * Chave primária auto-incrementada
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Chave estrangeira para o usuário que realizou a ação
     * 
     * @ManyToOne: Muitos logs podem referenciar o mesmo usuário
     * 
     * @JoinColumn: Configura a FK
     * - nullable = true: Um log pode não ter usuário (ex: ações do sistema)
     */
    @ManyToOne
    @JoinColumn(name = "usuario_id", referencedColumnName = "id", nullable = true)
    private Usuario usuario;

    /**
     * Nome do usuário no momento da ação (cópia para preservar histórico)
     * - Se o usuário mudar de nome depois, o log continua com o nome antigo
     * - Isso é importante para auditoria, pois o nome pode mudar ao longo do tempo
     */
    @Column(name = "usuario_nome", length = 150)
    private String usuarioNome;

    /**
     * Tipo de ação realizada
     * - CREATE: Criação de registro
     * - UPDATE: Atualização de registro
     * - DELETE: Exclusão de registro
     */
    @Column(nullable = false, length = 50)
    private String acao;

    /**
     * Tabela que foi afetada pela ação
     * - Ex: "fornecedores", "usuarios", "projetos"
     */
    @Column(nullable = false, length = 50)
    private String tabela;

    /**
     * ID do registro que foi modificado
     * - Permite identificar qual registro foi afetado
     */
    @Column(name = "registro_id")
    private Long registroId;

    /**
     * Detalhes da ação em formato JSON
     * 
     * IMPORTANTE: Campos sensíveis (email, telefone, observacao) NUNCA são gravados aqui
     * Isso é feito na camada de serviço antes de persistir o log
     * 
     * Exemplo de estrutura:
     * {
     *   "nome": "Maria Silva",
     *   "alteracoes": {
     *     "email": {"de": "antigo@email.com", "para": "novo@email.com"},
     *     "status": {"de": "ativo", "para": "inativo"}
     *   }
     * }
     * 
     * @Column com columnDefinition = "JSON": Define explicitamente que é JSON no MySQL
     * O JPA converterá automaticamente o Map<String, Object> para JSON
     */
    @Column(columnDefinition = "JSON")
    private Map<String, Object> detalhes;

    /**
     * Timestamp de criação do log
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * @PrePersist: Define createdAt antes de salvar
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
