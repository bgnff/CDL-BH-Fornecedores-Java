package br.org.cdlbh.fornecedores.dto;

import br.org.cdlbh.fornecedores.entity.Log;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * DTO para resposta de logs de auditoria
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LogResponse {

    private Long id;
    private Long usuario_id;
    private String usuario_nome;
    private String acao;
    private String tabela;
    private Long registro_id;
    private Map<String, Object> detalhes;
    private LocalDateTime created_at;

    public static LogResponse fromEntity(Log log) {
        if (log == null) return null;

        Long usuarioId = log.getUsuario() != null ? log.getUsuario().getId() : null;
        String usuarioNome = log.getUsuarioNome();
        if (usuarioNome == null && log.getUsuario() != null) {
            usuarioNome = log.getUsuario().getNome();
        }

        return new LogResponse(
            log.getId(),
            usuarioId,
            usuarioNome,
            log.getAcao(),
            log.getTabela(),
            log.getRegistroId(),
            log.getDetalhes(),
            log.getCreatedAt()
        );
    }
}
