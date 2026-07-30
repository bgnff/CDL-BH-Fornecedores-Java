package br.org.cdlbh.fornecedores.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entidade JPA que representa a tabela "backup_metadata" no banco de dados
 * 
 * Esta entidade armazena metadados dos backups executados pelo sistema.
 * É CRÍTICA para backups incrementais pois permite saber de onde cada backup
 * incremental deve começar a capturar mudanças do binary log (binlog).
 */
@Entity
@Table(name = "backup_metadata")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BackupMetadata {

    /**
     * Chave primária auto-incrementada
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Tipo de backup: FULL (dump completo) ou INCREMENTAL (apenas mudanças via binlog)
     * 
     * FULL: Dump completo do banco via mysqldump
     * - Arquivo grande, demora mais para gerar
     * - Contém todos os dados do banco no momento do backup
     * 
     * INCREMENTAL: Apenas as mudanças desde o último backup via binlog
     * - Arquivo pequeno, rápido para gerar
     * - Contém apenas as alterações (INSERT/UPDATE/DELETE/DDL) desde o último backup
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Tipo tipo;

    /**
     * Nome do arquivo de backup gerado
     * Ex: backup_2024-01-15T01-00-00-000.sql
     * Ex: incremental_2024-01-15T08-00-00-000.sql
     */
    @Column(nullable = false, length = 255)
    private String arquivo;

    /**
     * Nome do arquivo de binlog no momento do backup
     * Ex: mysql-bin.000123
     * 
     * O binlog é um arquivo sequencial que registra todas as alterações no banco
     * Cada backup incremental precisa saber qual arquivo de binlog usar
     */
    @Column(name = "binlog_file", length = 100)
    private String binlogFile;

    /**
     * Posição dentro do binlog no momento do backup
     * 
     * O binlog é um arquivo sequencial - cada evento tem uma posição
     * O próximo incremental começa a partir desta posição
     * Isso permite capturar apenas as mudanças desde o último backup
     */
    @Column(name = "binlog_position")
    private Long binlogPosition;

    /**
     * Timestamp de quando o backup foi executado
     */
    @Column(name = "executado_em", nullable = false, updatable = false)
    private LocalDateTime executadoEm;

    /**
     * Enum que define os tipos possíveis de backup
     */
    public enum Tipo {
        FULL,
        INCREMENTAL
    }

    /**
     * @PrePersist: Define executadoEm antes de salvar
     */
    @PrePersist
    protected void onCreate() {
        executadoEm = LocalDateTime.now();
    }
}
