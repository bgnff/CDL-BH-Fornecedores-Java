package br.org.cdlbh.fornecedores.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para resposta de login
 * 
 * Retorna o token JWT e os dados do usuário
 * Este formato é idêntico ao backend Node.js para manter compatibilidade com o frontend
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    /**
     * Token JWT de acesso
     * O frontend usará este token no header Authorization: Bearer <token>
     */
    private String access_token;

    /**
     * Dados do usuário logado
     */
    private UserResponse user;
}
