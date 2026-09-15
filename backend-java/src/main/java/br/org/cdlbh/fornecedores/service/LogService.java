package br.org.cdlbh.fornecedores.service;

import br.org.cdlbh.fornecedores.entity.Log;
import br.org.cdlbh.fornecedores.entity.Usuario;
import br.org.cdlbh.fornecedores.repository.LogRepository;
import br.org.cdlbh.fornecedores.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Service de logs de auditoria
 * 
 * Responsável por registrar todas as ações no sistema para fins de auditoria
 */
@Service
public class LogService {

    @Autowired
    private LogRepository logRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    /**
     * Registra um log de auditoria
     * 
     * @param usuarioId ID do usuário (pode ser null)
     * @param usuarioNome Nome do usuário (cópia para preservar histórico)
     * @param acao Tipo de ação (CREATE, UPDATE, DELETE)
     * @param tabela Tabela afetada
     * @param registroId ID do registro afetado
     * @param detalhes Detalhes da ação (já sanitizado - sem campos sensíveis)
     */
    public void registrarLog(Long usuarioId, String usuarioNome, String acao, String tabela, Long registroId, Map<String, Object> detalhes) {
        // Sanitização adicional de segurança
        // Remove campos sensíveis se por acaso ainda estiverem presentes
        if (detalhes != null) {
            detalhes.remove("email");
            detalhes.remove("telefone");
            detalhes.remove("observacao");
            
            // Sanitiza também dentro de "alteracoes" se existir
            if (detalhes.containsKey("alteracoes")) {
                @SuppressWarnings("unchecked")
                Map<String, Object> alteracoes = (Map<String, Object>) detalhes.get("alteracoes");
                if (alteracoes != null) {
                    alteracoes.remove("email");
                    alteracoes.remove("telefone");
                    alteracoes.remove("observacao");
                }
            }
        }

        // Cria a entidade de log
        Log log = new Log();
        log.setAcao(acao);
        log.setTabela(tabela);
        log.setRegistroId(registroId);
        log.setDetalhes(detalhes);
        log.setUsuarioNome(usuarioNome);

        // Busca o usuário se o ID foi fornecido
        if (usuarioId != null) {
            Usuario usuario = usuarioRepository.findById(usuarioId).orElse(null);
            log.setUsuario(usuario);
        }

        // Salva no banco
        logRepository.save(log);
    }

    /**
     * Lista todos os logs de auditoria em ordem decrescente de criação
     * 
     * @return Lista de LogResponse
     */
    public java.util.List<br.org.cdlbh.fornecedores.dto.LogResponse> listarTodos() {
        return logRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(br.org.cdlbh.fornecedores.dto.LogResponse::fromEntity)
                .collect(java.util.stream.Collectors.toList());
    }
}
