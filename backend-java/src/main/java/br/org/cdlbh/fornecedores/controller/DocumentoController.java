package br.org.cdlbh.fornecedores.controller;

import br.org.cdlbh.fornecedores.entity.Documento;
import br.org.cdlbh.fornecedores.service.DocumentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller REST para documentos
 * 
 * Gerencia operações CRUD de documentos vinculados aos fornecedores
 */
@RestController
@RequestMapping("/api/documentos")
public class DocumentoController {

    @Autowired
    private DocumentoService documentoService;

    /**
     * Lista todos os documentos
     * 
     * GET /api/documentos
     * - Exige autenticação
     * - Retorna todos os documentos ordenados por created_at DESC
     * 
     * @return Lista de documentos
     */
    @GetMapping
    public ResponseEntity<List<Documento>> listarTodos() {
        List<Documento> documentos = documentoService.listarTodos();
        return ResponseEntity.ok(documentos);
    }

    /**
     * Busca documentos de um fornecedor específico
     * 
     * GET /api/documentos/fornecedor/:id
     * - Exige autenticação
     * - Retorna todos os documentos de um fornecedor
     * 
     * @param fornecedorId ID do fornecedor
     * @return Lista de documentos do fornecedor
     */
    @GetMapping("/fornecedor/{fornecedorId}")
    public ResponseEntity<List<Documento>> listarPorFornecedor(@PathVariable Long fornecedorId) {
        List<Documento> documentos = documentoService.listarPorFornecedor(fornecedorId);
        return ResponseEntity.ok(documentos);
    }

    /**
     * Busca documentos vencendo nos próximos N dias
     * 
     * GET /api/documentos/vencendo?dias=30
     * - Exige autenticação
     * - Retorna documentos vencendo no período especificado
     * 
     * @param dias Número de dias (padrão: 30)
     * @return Lista de documentos vencendo
     */
    @GetMapping("/vencendo")
    public ResponseEntity<List<Documento>> listarVencendo(@RequestParam(defaultValue = "30") int dias) {
        List<Documento> documentos = documentoService.buscarVencendoEm(dias);
        return ResponseEntity.ok(documentos);
    }

    /**
     * Busca documentos já vencidos
     * 
     * GET /api/documentos/vencidos
     * - Exige autenticação
     * - Retorna documentos com data de vencimento no passado
     * 
     * @return Lista de documentos vencidos
     */
    @GetMapping("/vencidos")
    public ResponseEntity<List<Documento>> listarVencidos() {
        List<Documento> documentos = documentoService.buscarVencidos();
        return ResponseEntity.ok(documentos);
    }

    /**
     * Busca um documento por ID
     * 
     * GET /api/documentos/:id
     * - Exige autenticação
     * - Retorna detalhes de um documento específico
     * 
     * @param id ID do documento
     * @return Documento
     */
    @GetMapping("/{id}")
    public ResponseEntity<Documento> buscarPorId(@PathVariable Long id) {
        Documento documento = documentoService.buscarPorId(id);
        return ResponseEntity.ok(documento);
    }

    /**
     * Cria um novo documento
     * 
     * POST /api/documentos
     * - Exige autenticação
     * - Apenas ADMIN pode criar documentos
     * 
     * @param documento Dados do documento
     * @param fornecedorId ID do fornecedor (query param)
     * @param authentication Objeto de autenticação (para auditoria)
     * @return Documento criado (status 201)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Documento> criar(@RequestBody Documento documento,
                                          @RequestParam(required = false) Long fornecedorId,
                                          Authentication authentication) {
        Long targetFornecedorId = fornecedorId;
        if (targetFornecedorId == null && documento.getFornecedor() != null) {
            targetFornecedorId = documento.getFornecedor().getId();
        }
        if (targetFornecedorId == null) {
            throw new IllegalArgumentException("fornecedorId é obrigatório.");
        }

        // Extrai dados do usuário para auditoria
        Long usuarioId = Long.parseLong(authentication.getName());
        String usuarioNome = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        
        // Chama o service para criar
        Documento response = documentoService.criar(documento, targetFornecedorId, usuarioId, usuarioNome);
        return ResponseEntity.status(201).body(response);
    }

    /**
     * Atualiza um documento existente
     * 
     * PUT /api/documentos/:id
     * - Exige autenticação
     * - Apenas ADMIN pode atualizar
     * 
     * @param id ID do documento
     * @param dados Novos dados
     * @param authentication Objeto de autenticação
     * @return Documento atualizado
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Documento> atualizar(@PathVariable Long id,
                                             @RequestBody Documento dados,
                                             Authentication authentication) {
        Long usuarioId = Long.parseLong(authentication.getName());
        String usuarioNome = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        
        Documento response = documentoService.atualizar(id, dados, usuarioId, usuarioNome);
        return ResponseEntity.ok(response);
    }

    /**
     * Exclui um documento
     * 
     * DELETE /api/documentos/:id
     * - Exige autenticação
     * - Apenas ADMIN pode excluir
     * 
     * @param id ID do documento
     * @param authentication Objeto de autenticação
     * @return Resposta vazia com status 200
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> excluir(@PathVariable Long id,
                                                       Authentication authentication) {
        Long usuarioId = Long.parseLong(authentication.getName());
        String usuarioNome = authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        
        documentoService.excluir(id, usuarioId, usuarioNome);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
