package br.org.cdlbh.fornecedores.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO (Data Transfer Object) para requisição de login
 * 
 * Por que usar DTOs em vez de expor as entidades diretamente?
 * - Separação de responsabilidades: Entidades representam o banco, DTOs representam a API
 * - Segurança: Não expomos campos internos (senhaHash, createdAt, etc.)
 * - Validação: Podemos validar apenas os campos necessários para a requisição
 * - Flexibilidade: Podemos mudar o contrato da API sem afetar o banco de dados
 * 
 * @Data: Lombok gera getters, setters, toString, equals, hashCode
 * @NoArgsConstructor: Construtor sem argumentos (necessário para desserialização JSON)
 * @AllArgsConstructor: Construtor com todos os argumentos
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginRequest {

    /**
     * E-mail do usuário
     * 
     * @NotBlank: Não pode ser nulo nem vazio (apenas espaços em branco)
     * @Email: Deve ser um e-mail válido
     * @message: Mensagem customizada de erro se a validação falhar
     */
    @NotBlank(message = "E-mail é obrigatório")
    @Email(message = "E-mail inválido")
    private String email;

    /**
     * Senha do usuário
     * 
     * @NotBlank: Não pode ser nulo nem vazio
     * @Size: Tamanho mínimo de 6 caracteres (ajustado para ser mais flexível)
     */
    @NotBlank(message = "Senha é obrigatória")
    @Size(min = 6, message = "Senha deve ter no mínimo 6 caracteres")
    private String password;
}
