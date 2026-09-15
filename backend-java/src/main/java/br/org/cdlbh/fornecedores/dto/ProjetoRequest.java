package br.org.cdlbh.fornecedores.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para cadastro e atualização de projeto
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProjetoRequest {

    @NotBlank(message = "Nome do projeto é obrigatório")
    @Size(max = 100, message = "Nome do projeto deve ter no máximo 100 caracteres")
    private String nome;

    private String descricao;
}
