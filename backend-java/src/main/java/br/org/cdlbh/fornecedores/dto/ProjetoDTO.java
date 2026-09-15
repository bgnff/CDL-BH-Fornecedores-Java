package br.org.cdlbh.fornecedores.dto;

import br.org.cdlbh.fornecedores.entity.Projeto;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para resposta de projetos sociais
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjetoDTO {

    private Long id;

    private String nome;

    private String descricao;

    @JsonProperty("fornecedores_count")
    private long fornecedoresCount;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    @JsonProperty("updated_at")
    private LocalDateTime updatedAt;

    public static ProjetoDTO fromEntity(Projeto p, long count) {
        if (p == null) return null;
        return new ProjetoDTO(
                p.getId(),
                p.getNome(),
                p.getDescricao(),
                count,
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
