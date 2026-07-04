package br.org.cdlbh.fornecedores.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Controller para health check
 * 
 * Endpoint simples para verificar se o servidor está rodando
 */
@RestController
@RequestMapping("/api")
public class HealthController {

    /**
     * Health check
     * 
     * GET /api/health
     * - Público (não exige autenticação)
     * - Retorna {"status":"ok"}
     * 
     * @return Map com status
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
