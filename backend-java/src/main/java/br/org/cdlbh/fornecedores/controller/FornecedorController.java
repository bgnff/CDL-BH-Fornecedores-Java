package br.org.cdlbh.fornecedores.controller;

import br.org.cdlbh.fornecedores.dto.FornecedorRequest;
import br.org.cdlbh.fornecedores.dto.FornecedorResponse;
import br.org.cdlbh.fornecedores.service.FornecedorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller REST para fornecedores
 * 
 * Equivalente às rotas do Express em backend/routes/fornecedores.js
 */
@RestController
@RequestMapping("/api/fornecedores")
public class FornecedorController {

    @Autowired
    private FornecedorService fornecedorService;

    /**
     * Lista todos os fornecedores
     * 
     * GET /api/fornecedores
     * - Exige autenticação
     * - Retorna todos os fornecedores ordenados por created_at DESC
     * 
     * @return Lista de FornecedorResponse
     */
    @GetMapping
    public ResponseEntity<List<FornecedorResponse>> listarTodos() {
        List<FornecedorResponse> fornecedores = fornecedorService.listarTodos();
        return ResponseEntity.ok(fornecedores);
    }

    /**
     * Busca um fornecedor por ID
     * 
     * GET /api/fornecedores/:id
     * - Exige autenticação
     * - Retorna detalhes de um fornecedor específico
     * 
     * @param id ID do fornecedor
     * @return FornecedorResponse
     */
    @GetMapping("/{id}")
    public ResponseEntity<FornecedorResponse> buscarPorId(@PathVariable Long id) {
        FornecedorResponse fornecedor = fornecedorService.buscarPorId(id);
        return ResponseEntity.ok(fornecedor);
    }

    /**
     * Cria um novo fornecedor
     * 
     * POST /api/fornecedores
     * - Exige autenticação
     * - Qualquer usuário autenticado pode criar
     * 
     * @param request Dados do fornecedor
     * @param authentication Objeto de autenticação (para auditoria)
     * @return FornecedorResponse com o fornecedor criado (status 201)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FornecedorResponse> criar(@Valid @RequestBody FornecedorRequest request,
                                                     Authentication authentication) {
        // Extrai dados do usuário para auditoria
        Long usuarioId = Long.parseLong(authentication.getName());
        String usuarioNome = authentication.getCredentials() != null ? authentication.getCredentials().toString() : "Usuário";
        
        // Chama o service para criar
        FornecedorResponse response = fornecedorService.criar(request, usuarioId, usuarioNome);
        return ResponseEntity.status(201).body(response);
    }

    /**
     * Atualiza um fornecedor existente
     * 
     * PUT /api/fornecedores/:id
     * - Exige autenticação
     * - Apenas ADMIN pode atualizar
     * 
     * @param id ID do fornecedor
     * @param request Novos dados
     * @param authentication Objeto de autenticação
     * @return FornecedorResponse atualizado
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FornecedorResponse> atualizar(@PathVariable Long id,
                                                         @Valid @RequestBody FornecedorRequest request,
                                                         Authentication authentication) {
        Long usuarioId = Long.parseLong(authentication.getName());
        String usuarioNome = authentication.getCredentials() != null ? authentication.getCredentials().toString() : "Usuário";
        
        FornecedorResponse response = fornecedorService.atualizar(id, request, usuarioId, usuarioNome);
        return ResponseEntity.ok(response);
    }

    /**
     * Exclui um fornecedor
     * 
     * DELETE /api/fornecedores/:id
     * - Exige autenticação
     * - Apenas ADMIN pode excluir
     * 
     * @param id ID do fornecedor
     * @param authentication Objeto de autenticação
     * @return Resposta vazia com status 200
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> excluir(@PathVariable Long id,
                                                        Authentication authentication) {
        Long usuarioId = Long.parseLong(authentication.getName());
        String usuarioNome = authentication.getCredentials() != null ? authentication.getCredentials().toString() : "Usuário";
        
        fornecedorService.excluir(id, usuarioId, usuarioNome);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
