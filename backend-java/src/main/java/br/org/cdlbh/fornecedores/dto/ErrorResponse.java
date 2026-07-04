package br.org.cdlbh.fornecedores.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para resposta de erro
 * 
 * Mantém o formato {"error": "mensagem"} do backend Node.js
 * Isso garante que o frontend continue funcionando sem alterações
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponse {

    /**
     * Mensagem de erro
     */
    private String error;

    /**
     * Método estático para criar uma resposta de erro
     * 
     * @param message Mensagem de erro
     * @return ErrorResponse com a mensagem
     */
    public static ErrorResponse of(String message) {
        return new ErrorResponse(message);
    }
}
