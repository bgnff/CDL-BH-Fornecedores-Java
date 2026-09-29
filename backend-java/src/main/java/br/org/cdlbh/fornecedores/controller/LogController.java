package br.org.cdlbh.fornecedores.controller;

import br.org.cdlbh.fornecedores.dto.LogResponse;
import br.org.cdlbh.fornecedores.service.LogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller REST para logs de auditoria do sistema
 */
@RestController
@RequestMapping("/api/logs")
public class LogController {

    @Autowired
    private LogService logService;

    /**
     * Lista todos os logs de auditoria
     * Acessível EXCLUSIVAMENTE por administradores
     * 
     * GET /api/logs
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LogResponse>> listarLogs() {
        List<LogResponse> logs = logService.listarTodos();
        return ResponseEntity.ok(logs);
    }
}
