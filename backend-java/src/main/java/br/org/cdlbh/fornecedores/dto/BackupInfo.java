package br.org.cdlbh.fornecedores.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para informações de um arquivo de backup
 * 
 * Usado no endpoint /api/backup/list para retornar metadados dos backups
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BackupInfo {

    /**
     * Nome do arquivo de backup
     */
    private String filename;

    /**
     * Tamanho do arquivo em bytes
     */
    private Long size;

    /**
     * Data/hora de criação do backup
     */
    private LocalDateTime created;
}
