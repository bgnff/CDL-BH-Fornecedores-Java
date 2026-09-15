package br.org.cdlbh.fornecedores.controller;

import br.org.cdlbh.fornecedores.dto.ProjetoDTO;
import br.org.cdlbh.fornecedores.dto.ProjetoRequest;
import br.org.cdlbh.fornecedores.service.ProjetoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controller REST para projetos da Fundação CDL-BH
 */
@RestController
@RequestMapping("/api/projetos")
public class ProjetoController {

    @Autowired
    private ProjetoService projetoService;

    /**
     * Lista todos os projetos disponíveis
     * 
     * GET /api/projetos
     */
    @GetMapping
    public ResponseEntity<List<ProjetoDTO>> listarProjetos() {
        List<ProjetoDTO> projetos = projetoService.listarTodos();
        return ResponseEntity.ok(projetos);
    }

    /**
     * Busca um projeto por ID
     * 
     * GET /api/projetos/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProjetoDTO> buscarPorId(@PathVariable Long id) {
        ProjetoDTO projeto = projetoService.buscarPorId(id);
        return ResponseEntity.ok(projeto);
    }

    /**
     * Cria um novo projeto
     * 
     * POST /api/projetos
     */
    @PostMapping
    public ResponseEntity<ProjetoDTO> criar(@Valid @RequestBody ProjetoRequest request,
                                            Authentication authentication) {
        Long usuarioId = authentication != null && authentication.getName() != null && !authentication.getName().equals("anonymousUser")
                ? Long.parseLong(authentication.getName()) : 1L;
        String usuarioNome = authentication != null && !authentication.getAuthorities().isEmpty()
                ? authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "")
                : "Sistema";

        ProjetoDTO criado = projetoService.criar(request, usuarioId, usuarioNome);
        return ResponseEntity.status(201).body(criado);
    }

    /**
     * Atualiza um projeto existente
     * 
     * PUT /api/projetos/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ProjetoDTO> atualizar(@PathVariable Long id,
                                                @Valid @RequestBody ProjetoRequest request,
                                                Authentication authentication) {
        Long usuarioId = authentication != null && authentication.getName() != null && !authentication.getName().equals("anonymousUser")
                ? Long.parseLong(authentication.getName()) : 1L;
        String usuarioNome = authentication != null && !authentication.getAuthorities().isEmpty()
                ? authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "")
                : "Sistema";

        ProjetoDTO atualizado = projetoService.atualizar(id, request, usuarioId, usuarioNome);
        return ResponseEntity.ok(atualizado);
    }

    /**
     * Exclui um projeto existente
     * 
     * DELETE /api/projetos/{id}
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> excluir(@PathVariable Long id,
                                                        Authentication authentication) {
        Long usuarioId = authentication != null && authentication.getName() != null && !authentication.getName().equals("anonymousUser")
                ? Long.parseLong(authentication.getName()) : 1L;
        String usuarioNome = authentication != null && !authentication.getAuthorities().isEmpty()
                ? authentication.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "")
                : "Sistema";

        projetoService.excluir(id, usuarioId, usuarioNome);
        return ResponseEntity.ok(Map.of("success", true));
    }
}
