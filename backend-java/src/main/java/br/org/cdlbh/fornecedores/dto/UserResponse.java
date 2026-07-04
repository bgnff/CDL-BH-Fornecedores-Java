package br.org.cdlbh.fornecedores.dto;

import br.org.cdlbh.fornecedores.entity.Usuario;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para resposta com dados do usuário
 * 
 * Contém apenas os campos seguros para expor na API
 * NÃO inclui senhaHash ou outros campos sensíveis
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    /**
     * ID do usuário
     */
    private Long id;

    /**
     * E-mail do usuário
     */
    private String email;

    /**
     * Nome completo do usuário
     * - O campo é chamado de "full_name" para manter compatibilidade com o backend Node.js
     */
    private String full_name;

    /**
     * Papel do usuário (admin ou user)
     */
    private String role;

    /**
     * Método estático para converter entidade Usuario em UserResponse
     * 
     * Por que um método estático?
     * - É um padrão comum para conversão de entidades para DTOs
     * - Evita acoplamento: o DTO não precisa conhecer a entidade diretamente
     * - Facilita testes: podemos testar a conversão isoladamente
     * 
     * @param usuario Entidade Usuario
     * @return UserResponse com os dados do usuário
     */
    public static UserResponse fromEntity(Usuario usuario) {
        UserResponse response = new UserResponse();
        response.setId(usuario.getId());
        response.setEmail(usuario.getEmail());
        response.setFull_name(usuario.getNome());
        response.setRole(usuario.getRole().name());
        return response;
    }
}
