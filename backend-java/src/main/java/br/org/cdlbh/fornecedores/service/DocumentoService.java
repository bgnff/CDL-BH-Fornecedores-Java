package br.org.cdlbh.fornecedores.service;

import br.org.cdlbh.fornecedores.entity.Documento;
import br.org.cdlbh.fornecedores.entity.Fornecedor;
import br.org.cdlbh.fornecedores.repository.DocumentoRepository;
import br.org.cdlbh.fornecedores.repository.FornecedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

/**
 * Service de documentos
 * 
 * Contém toda a lógica de negócio relacionada a documentos:
 * - CRUD de documentos
 * - Busca de documentos vencendo
 * - Registro de auditoria (logs)
 */
@Service
public class DocumentoService {

    @Autowired
    private DocumentoRepository documentoRepository;

    @Autowired
    private FornecedorRepository fornecedorRepository;

    @Autowired
    private LogService logService;

    /**
     * Lista todos os documentos ordenados por data de criação
     * 
     * @return Lista de documentos
     */
    public List<Documento> listarTodos() {
        return documentoRepository.findAll();
    }

    /**
     * Busca documentos de um fornecedor específico
     * 
     * @param fornecedorId ID do fornecedor
     * @return Lista de documentos do fornecedor
     */
    public List<Documento> listarPorFornecedor(Long fornecedorId) {
        return documentoRepository.findByFornecedorId(fornecedorId);
    }

    /**
     * Busca um documento por ID
     * 
     * @param id ID do documento
     * @return Documento
     * @throws RuntimeException se documento não for encontrado
     */
    @SuppressWarnings("null")
    public Documento buscarPorId(Long id) {
        return documentoRepository.findById(id)
                .orElseThrow(() -> new br.org.cdlbh.fornecedores.exception.RecursoNaoEncontradoException("Documento não encontrado."));
    }

    /**
     * Busca documentos vencendo nos próximos N dias
     * 
     * @param dias Número de dias à frente
     * @return Lista de documentos vencendo no período
     */
    public List<Documento> buscarVencendoEm(int dias) {
        LocalDate hoje = LocalDate.now();
        LocalDate limite = hoje.plusDays(dias);
        return documentoRepository.findVencendoEm(hoje, limite);
    }

    /**
     * Busca documentos já vencidos
     * 
     * @return Lista de documentos vencidos
     */
    public List<Documento> buscarVencidos() {
        return documentoRepository.findVencidos(LocalDate.now());
    }

    /**
     * Cria um novo documento
     * 
     * @param documento Dados do documento
     * @param fornecedorId ID do fornecedor
     * @param usuarioId ID do usuário que está criando (para auditoria)
     * @param usuarioNome Nome do usuário que está criando (para auditoria)
     * @return Documento criado
     */
    @Transactional
    @SuppressWarnings("null")
    public Documento criar(Documento documento, Long fornecedorId, Long usuarioId, String usuarioNome) {
        // Busca o fornecedor
        Fornecedor fornecedor = fornecedorRepository.findById(fornecedorId)
                .orElseThrow(() -> new br.org.cdlbh.fornecedores.exception.RecursoNaoEncontradoException("Fornecedor não encontrado."));
        
        // Define o fornecedor no documento
        documento.setFornecedor(fornecedor);
        
        // Salva no banco
        documento = documentoRepository.save(documento);

        // Registra log de auditoria
        logService.registrarLog(usuarioId, usuarioNome, "CREATE", "documentos", documento.getId(), 
                java.util.Map.of("nome", documento.getNome(), "tipo", documento.getTipo().name()));

        return documento;
    }

    /**
     * Atualiza um documento existente
     * 
     * @param id ID do documento
     * @param dados Novos dados
     * @param usuarioId ID do usuário que está atualizando
     * @param usuarioNome Nome do usuário que está atualizando
     * @return Documento atualizado
     */
    @Transactional
    @SuppressWarnings("null")
    public Documento atualizar(Long id, Documento dados, Long usuarioId, String usuarioNome) {
        // Busca o documento atual
        Documento documento = documentoRepository.findById(id)
                .orElseThrow(() -> new br.org.cdlbh.fornecedores.exception.RecursoNaoEncontradoException("Documento não encontrado."));

        // Atualiza os campos
        documento.setNome(dados.getNome());
        documento.setTipo(dados.getTipo());
        documento.setDataVencimento(dados.getDataVencimento());
        documento.setArquivoUrl(dados.getArquivoUrl());
        documento.setObservacao(dados.getObservacao());

        // Salva no banco
        documento = documentoRepository.save(documento);

        // Registra log de auditoria
        logService.registrarLog(usuarioId, usuarioNome, "UPDATE", "documentos", documento.getId(), 
                java.util.Map.of("nome", documento.getNome()));

        return documento;
    }

    /**
     * Exclui um documento
     * 
     * @param id ID do documento
     * @param usuarioId ID do usuário que está excluindo
     * @param usuarioNome Nome do usuário que está excluindo
     */
    @Transactional
    @SuppressWarnings("null")
    public void excluir(Long id, Long usuarioId, String usuarioNome) {
        Documento documento = documentoRepository.findById(id)
                .orElseThrow(() -> new br.org.cdlbh.fornecedores.exception.RecursoNaoEncontradoException("Documento não encontrado."));

        // Registra log de auditoria antes de excluir
        logService.registrarLog(usuarioId, usuarioNome, "DELETE", "documentos", documento.getId(), 
                java.util.Map.of("nome", documento.getNome()));

        // Exclui do banco
        documentoRepository.deleteById(id);
    }
}
