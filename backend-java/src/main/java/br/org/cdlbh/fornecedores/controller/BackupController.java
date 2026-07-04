package br.org.cdlbh.fornecedores.controller;

import br.org.cdlbh.fornecedores.dto.BackupInfo;
import br.org.cdlbh.fornecedores.service.BackupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Path;
import java.util.List;
import java.util.Map;

/**
 * Controller REST para backup
 * 
 * Equivalente às rotas do Express em backend/routes/backup.js
 */
@RestController
@RequestMapping("/api/backup")
public class BackupController {

    @Autowired
    private BackupService backupService;

    /**
     * Gera um backup do banco de dados
     * 
     * POST /api/backup/generate
     * - Exige autenticação
     * - Apenas ADMIN pode gerar backup
     * 
     * @return Nome do arquivo de backup gerado
     */
    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> gerarBackup() {
        String filename = backupService.gerarBackup();
        return ResponseEntity.ok(Map.of(
                "success", true,
                "filename", filename
        ));
    }

    /**
     * Lista todos os backups existentes
     * 
     * GET /api/backup/list
     * - Exige autenticação
     * - Apenas ADMIN pode listar backups
     * 
     * @return Lista de informações dos backups
     */
    @GetMapping("/list")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BackupInfo>> listarBackups() {
        List<BackupInfo> backups = backupService.listarBackups();
        return ResponseEntity.ok(backups);
    }

    /**
     * Baixa um arquivo de backup
     * 
     * GET /api/backup/download/:filename
     * - Exige autenticação
     * - Apenas ADMIN pode baixar backup
     * 
     * @param filename Nome do arquivo
     * @return Arquivo de backup para download
     */
    @GetMapping("/download/{filename}")
    @PreAuthorize("hasRole('ADMIN')")
    @SuppressWarnings("null")
    public ResponseEntity<Resource> downloadBackup(@PathVariable String filename) {
        try {
            // Obtém o caminho do arquivo (com validação de path traversal)
            Path filepath = backupService.getBackupPath(filename);
            Resource resource = new FileSystemResource(filepath);

            // Configura headers para download
            HttpHeaders headers = new HttpHeaders();
            headers.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");
            headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(resource);
        } catch (RuntimeException e) {
            // Se houver erro (arquivo não encontrado, nome inválido, etc.)
            return ResponseEntity.notFound().build();
        }
    }
}
