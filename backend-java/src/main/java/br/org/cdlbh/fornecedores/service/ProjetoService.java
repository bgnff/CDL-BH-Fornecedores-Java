package br.org.cdlbh.fornecedores.service;

import br.org.cdlbh.fornecedores.dto.ProjetoDTO;
import br.org.cdlbh.fornecedores.dto.ProjetoRequest;
import br.org.cdlbh.fornecedores.entity.Fornecedor;
import br.org.cdlbh.fornecedores.entity.Projeto;
import br.org.cdlbh.fornecedores.repository.FornecedorRepository;
import br.org.cdlbh.fornecedores.repository.ProjetoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service para gerenciamento de Projetos Sociais da Fundação CDL-BH
 */
@Service
public class ProjetoService {

    @Autowired
    private ProjetoRepository projetoRepository;

    @Autowired
    private FornecedorRepository fornecedorRepository;

    @Autowired
    private LogService logService;

    /**
     * Lista todos os projetos ordenados por nome com a contagem de fornecedores
     */
    public List<ProjetoDTO> listarTodos() {
        List<Projeto> projetos = projetoRepository.findAllByOrderByNomeAsc();
        return projetos.stream()
                .map(p -> {
                    long count = fornecedorRepository.countByProjetoId(p.getId());
                    return ProjetoDTO.fromEntity(p, count);
                })
                .toList();
    }

    /**
     * Busca um projeto por ID
     */
    @SuppressWarnings("null")
    public ProjetoDTO buscarPorId(Long id) {
        Projeto projeto = projetoRepository.findById(id)
                .orElseThrow(() -> new br.org.cdlbh.fornecedores.exception.RecursoNaoEncontradoException("Projeto não encontrado."));
        long count = fornecedorRepository.countByProjetoId(id);
        return ProjetoDTO.fromEntity(projeto, count);
    }

    /**
     * Cria um novo projeto social
     */
    @Transactional
    public ProjetoDTO criar(ProjetoRequest request, Long usuarioId, String usuarioNome) {
        String nomeLimpo = request.getNome().trim();
        if (projetoRepository.existsByNomeIgnoreCase(nomeLimpo)) {
            throw new RuntimeException("Já existe um projeto cadastrado com o nome '" + nomeLimpo + "'.");
        }

        Projeto p = new Projeto();
        p.setNome(nomeLimpo);
        p.setDescricao(request.getDescricao() != null ? request.getDescricao().trim() : null);
        p = projetoRepository.save(p);

        // Registro de Auditoria
        Map<String, Object> detalhes = new HashMap<>();
        detalhes.put("nome", p.getNome());
        logService.registrarLog(usuarioId, usuarioNome, "CREATE", "projetos", p.getId(), detalhes);

        return ProjetoDTO.fromEntity(p, 0);
    }

    /**
     * Atualiza dados de um projeto existente
     */
    @Transactional
    @SuppressWarnings("null")
    public ProjetoDTO atualizar(Long id, ProjetoRequest request, Long usuarioId, String usuarioNome) {
        Projeto p = projetoRepository.findById(id)
                .orElseThrow(() -> new br.org.cdlbh.fornecedores.exception.RecursoNaoEncontradoException("Projeto não encontrado."));

        String novoNome = request.getNome().trim();
        if (projetoRepository.existsByNomeIgnoreCaseAndIdNot(novoNome, id)) {
            throw new RuntimeException("Já existe outro projeto cadastrado com o nome '" + novoNome + "'.");
        }

        p.setNome(novoNome);
        p.setDescricao(request.getDescricao() != null ? request.getDescricao().trim() : null);
        p = projetoRepository.save(p);

        // Registro de Auditoria
        Map<String, Object> detalhes = new HashMap<>();
        detalhes.put("nome", p.getNome());
        logService.registrarLog(usuarioId, usuarioNome, "UPDATE", "projetos", p.getId(), detalhes);

        long count = fornecedorRepository.countByProjetoId(id);
        return ProjetoDTO.fromEntity(p, count);
    }

    /**
     * Exclui um projeto desvinculando fornecedores associados
     */
    @Transactional
    @SuppressWarnings("null")
    public void excluir(Long id, Long usuarioId, String usuarioNome) {
        Projeto p = projetoRepository.findById(id)
                .orElseThrow(() -> new br.org.cdlbh.fornecedores.exception.RecursoNaoEncontradoException("Projeto não encontrado."));

        // Desvincula fornecedores associados sem apagá-los (ON DELETE SET NULL)
        List<Fornecedor> fornecedores = fornecedorRepository.findByProjetoId(id);
        if (!fornecedores.isEmpty()) {
            for (Fornecedor f : fornecedores) {
                f.setProjeto(null);
            }
            fornecedorRepository.saveAll(fornecedores);
        }

        projetoRepository.delete(p);

        // Registro de Auditoria
        Map<String, Object> detalhes = new HashMap<>();
        detalhes.put("nome", p.getNome());
        detalhes.put("fornecedores_desvinculados", fornecedores.size());
        logService.registrarLog(usuarioId, usuarioNome, "DELETE", "projetos", id, detalhes);
    }
}
