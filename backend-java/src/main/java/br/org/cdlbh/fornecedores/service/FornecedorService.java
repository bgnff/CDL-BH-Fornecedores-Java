package br.org.cdlbh.fornecedores.service;

import br.org.cdlbh.fornecedores.dto.FornecedorRequest;
import br.org.cdlbh.fornecedores.dto.FornecedorResponse;
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
 * Service de fornecedores
 * 
 * Contém toda a lógica de negócio relacionada a fornecedores:
 * - CRUD de fornecedores
 * - Validação de permissões
 * - Registro de auditoria (logs)
 */
@Service
public class FornecedorService {

    @Autowired
    private FornecedorRepository fornecedorRepository;

    @Autowired
    private ProjetoRepository projetoRepository;

    @Autowired
    private LogService logService;

    /**
     * Lista todos os fornecedores ordenados por data de criação
     * 
     * @return Lista de FornecedorResponse
     */
    public List<FornecedorResponse> listarTodos() {
        List<Fornecedor> fornecedores = fornecedorRepository.findAllByOrderByCreatedAtDesc();
        return fornecedores.stream()
                .map(FornecedorResponse::fromEntity)
                .toList();
    }

    /**
     * Busca um fornecedor por ID
     * 
     * @param id ID do fornecedor
     * @return FornecedorResponse
     * @throws RuntimeException se fornecedor não for encontrado
     */
    @SuppressWarnings("null")
    public FornecedorResponse buscarPorId(Long id) {
        Fornecedor fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new br.org.cdlbh.fornecedores.exception.RecursoNaoEncontradoException("Fornecedor não encontrado."));
        return FornecedorResponse.fromEntity(fornecedor);
    }

    /**
     * Cria um novo fornecedor
     * 
     * @param request Dados do fornecedor
     * @param usuarioId ID do usuário que está criando (para auditoria)
     * @param usuarioNome Nome do usuário que está criando (para auditoria)
     * @return FornecedorResponse com o fornecedor criado
     */
    @Transactional
    public FornecedorResponse criar(FornecedorRequest request, Long usuarioId, String usuarioNome) {
        // Converte DTO em entidade
        Fornecedor fornecedor = new Fornecedor();
        fornecedor.setNome(request.getNome());
        fornecedor.setEmpresaPf(request.getEmpresa_pf());
        fornecedor.setCnpj(request.getCnpj());
        fornecedor.setEmail(request.getEmail());
        fornecedor.setTelefone(request.getTelefone());
        fornecedor.setPalavraChave(request.getPalavra_chave());
        fornecedor.setObservacao(request.getObservacao());
        fornecedor.setPermissaoPara(request.getPermissao_para() != null ? request.getPermissao_para() : List.of());
        
        // Define favorito e tipo de pessoa
        if (request.getFavorito() != null) {
            fornecedor.setFavorito(request.getFavorito());
        }
        if (request.getTipo_pessoa() != null) {
            fornecedor.setTipoPessoa(request.getTipo_pessoa());
        }
        
        // Busca o projeto pelo nome (se fornecido)
        if (request.getProjeto() != null && !request.getProjeto().isEmpty()) {
            Projeto projeto = projetoRepository.findByNome(request.getProjeto())
                    .orElse(null); // Se não encontrar, deixa como null
            fornecedor.setProjeto(projeto);
        }
        
        // Define o status
        if (request.getStatus() != null) {
            fornecedor.setStatus(Fornecedor.Status.valueOf(request.getStatus().toLowerCase()));
        } else {
            fornecedor.setStatus(Fornecedor.Status.ativo);
        }

        // Salva no banco
        fornecedor = fornecedorRepository.save(fornecedor);

        // Registra log de auditoria
        // IMPORTANTE: Não incluímos campos sensíveis (email, telefone, observacao) no log
        Map<String, Object> detalhes = new HashMap<>();
        detalhes.put("nome", fornecedor.getNome());
        if (fornecedor.getProjeto() != null) {
            detalhes.put("projeto", fornecedor.getProjeto().getNome());
        }
        
        logService.registrarLog(usuarioId, usuarioNome, "CREATE", "fornecedores", fornecedor.getId(), detalhes);

        return FornecedorResponse.fromEntity(fornecedor);
    }

    /**
     * Atualiza um fornecedor existente
     * 
     * @param id ID do fornecedor
     * @param request Novos dados
     * @param usuarioId ID do usuário que está atualizando
     * @param usuarioNome Nome do usuário que está atualizando
     * @return FornecedorResponse atualizado
     */
    @Transactional
    @SuppressWarnings("null")
    public FornecedorResponse atualizar(Long id, FornecedorRequest request, Long usuarioId, String usuarioNome) {
        // Busca o fornecedor atual
        Fornecedor fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new br.org.cdlbh.fornecedores.exception.RecursoNaoEncontradoException("Fornecedor não encontrado."));

        // Calcula o diff (campos que mudaram)
        Map<String, Object> alteracoes = new HashMap<>();
        
        if (!equal(fornecedor.getNome(), request.getNome())) {
            alteracoes.put("nome", Map.of("de", fornecedor.getNome(), "para", request.getNome()));
        }
        if (!equal(fornecedor.getEmpresaPf(), request.getEmpresa_pf())) {
            alteracoes.put("empresa_pf", Map.of("de", fornecedor.getEmpresaPf(), "para", request.getEmpresa_pf()));
        }
        if (!equal(fornecedor.getCnpj(), request.getCnpj())) {
            alteracoes.put("cnpj", Map.of("de", fornecedor.getCnpj(), "para", request.getCnpj()));
        }
        // NOTA: email, telefone e observacao são campos sensíveis - não incluímos no diff
        // Mas ainda atualizamos no banco
        if (!equal(fornecedor.getPalavraChave(), request.getPalavra_chave())) {
            alteracoes.put("palavra_chave", Map.of("de", fornecedor.getPalavraChave(), "para", request.getPalavra_chave()));
        }
        
        // Projeto: compara pelo nome
        String projetoNomeAtual = fornecedor.getProjeto() != null ? fornecedor.getProjeto().getNome() : null;
        if (!equal(projetoNomeAtual, request.getProjeto())) {
            alteracoes.put("projeto", Map.of("de", projetoNomeAtual, "para", request.getProjeto()));
        }
        
        if (!equal(fornecedor.getStatus().name().toLowerCase(), request.getStatus())) {
            alteracoes.put("status", Map.of("de", fornecedor.getStatus().name().toLowerCase(), "para", request.getStatus()));
        }

        // Atualiza os campos
        fornecedor.setNome(request.getNome());
        fornecedor.setEmpresaPf(request.getEmpresa_pf());
        fornecedor.setCnpj(request.getCnpj());
        fornecedor.setEmail(request.getEmail());
        fornecedor.setTelefone(request.getTelefone());
        fornecedor.setPalavraChave(request.getPalavra_chave());
        fornecedor.setObservacao(request.getObservacao());
        fornecedor.setPermissaoPara(request.getPermissao_para() != null ? request.getPermissao_para() : List.of());
        
        // Atualiza projeto
        if (request.getProjeto() != null && !request.getProjeto().isEmpty()) {
            Projeto projeto = projetoRepository.findByNome(request.getProjeto()).orElse(null);
            fornecedor.setProjeto(projeto);
        } else {
            fornecedor.setProjeto(null);
        }
        
        // Atualiza status
        if (request.getStatus() != null) {
            fornecedor.setStatus(Fornecedor.Status.valueOf(request.getStatus().toLowerCase()));
        }

        // Atualiza favorito e tipo_pessoa
        if (request.getFavorito() != null) {
            fornecedor.setFavorito(request.getFavorito());
        }
        if (request.getTipo_pessoa() != null) {
            fornecedor.setTipoPessoa(request.getTipo_pessoa());
        }

        // Salva no banco
        fornecedor = fornecedorRepository.save(fornecedor);

        // Registra log de auditoria
        // IMPORTANTE: O diff já não inclui campos sensíveis
        Map<String, Object> detalhes = new HashMap<>();
        detalhes.put("nome", fornecedor.getNome());
        if (!alteracoes.isEmpty()) {
            detalhes.put("alteracoes", alteracoes);
        }
        
        logService.registrarLog(usuarioId, usuarioNome, "UPDATE", "fornecedores", fornecedor.getId(), detalhes);

        return FornecedorResponse.fromEntity(fornecedor);
    }

    /**
     * Exclui um fornecedor
     * 
     * @param id ID do fornecedor
     * @param usuarioId ID do usuário que está excluindo
     * @param usuarioNome Nome do usuário que está excluindo
     */
    @Transactional
    @SuppressWarnings("null")
    public void excluir(Long id, Long usuarioId, String usuarioNome) {
        Fornecedor fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new br.org.cdlbh.fornecedores.exception.RecursoNaoEncontradoException("Fornecedor não encontrado."));

        // Registra log de auditoria antes de excluir
        Map<String, Object> detalhes = new HashMap<>();
        detalhes.put("nome", fornecedor.getNome());
        
        logService.registrarLog(usuarioId, usuarioNome, "DELETE", "fornecedores", fornecedor.getId(), detalhes);

        // Exclui do banco
        fornecedorRepository.deleteById(id);
    }

    /**
     * Busca fornecedores por CNPJ (busca parcial, case-insensitive)
     * 
     * @param cnpj CNPJ ou parte do CNPJ
     * @return Lista de FornecedorResponse
     */
    public List<FornecedorResponse> buscarPorCnpj(String cnpj) {
        List<Fornecedor> fornecedores = fornecedorRepository.findByCnpjContainingIgnoreCase(cnpj);
        return fornecedores.stream()
                .map(FornecedorResponse::fromEntity)
                .toList();
    }

    /**
     * Método auxiliar para comparar dois objetos de forma segura (trata null)
     */
    private boolean equal(Object a, Object b) {
        if (a == null && b == null) return true;
        if (a == null || b == null) return false;
        return a.equals(b);
    }
}
