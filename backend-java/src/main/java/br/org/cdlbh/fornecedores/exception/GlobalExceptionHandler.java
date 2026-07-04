package br.org.cdlbh.fornecedores.exception;

import br.org.cdlbh.fornecedores.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

/**
 * Handler global de exceções
 * 
 * @RestControllerAdvice: Combina @ControllerAdvice e @ResponseBody
 * - @ControllerAdvice: Esta classe intercepta exceções lançadas por qualquer controller
 * - @ResponseBody: As respostas são retornadas como JSON
 * 
 * Por que ter um handler global?
 * - Centraliza o tratamento de erros
 * - Garante formato consistente de resposta de erro
 * - Evita repetição de try-catch em todos os controllers
 * - O frontend espera o formato {"error": "mensagem"} - garantimos isso aqui
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Trata exceções de validação (@Valid nos DTOs)
     * 
     * Quando um DTO falha na validação (ex: email inválido, campo vazio),
     * o Spring lança MethodArgumentNotValidException
     * 
     * @param ex Exceção de validação
     * @return ErrorResponse com mensagens de erro
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex) {
        // Extrai os erros de validação de cada campo
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        // Junta todos os erros em uma string (compatível com o backend Node.js)
        String errorMessage = String.join(", ", errors.values());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ErrorResponse.of(errorMessage));
    }

    /**
     * Trata exceções de acesso negado (usuário sem permissão)
     * 
     * Lançada quando @PreAuthorize("hasRole('ADMIN')") falha
     * 
     * @param ex Exceção de acesso negado
     * @return ErrorResponse com mensagem de permissão
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ErrorResponse.of("Sem permissão."));
    }

    /**
     * Trata exceções de credenciais inválidas
     * 
     * Lançada pelo AuthenticationManager quando senha está incorreta
     * 
     * @param ex Exceção de credenciais inválidas
     * @return ErrorResponse com mensagem de erro
     */
    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentialsException(BadCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of("Credenciais inválidas."));
    }

    /**
     * Trata exceções genéricas (RuntimeException)
     * 
     * Usado para erros de negócio (ex: fornecedor não encontrado)
     * 
     * @param ex Exceção genérica
     * @return ErrorResponse com mensagem de erro
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        // Se a mensagem já estiver no formato esperado, usa ela
        // Caso contrário, usa a mensagem da exceção
        String message = ex.getMessage();
        
        // Determina o status HTTP baseado na mensagem
        HttpStatus status = HttpStatus.INTERNAL_SERVER_ERROR;
        if (message.contains("não encontrado") || message.contains("not found")) {
            status = HttpStatus.NOT_FOUND;
        } else if (message.contains("inválida") || message.contains("inválido")) {
            status = HttpStatus.UNAUTHORIZED;
        }
        
        return ResponseEntity.status(status)
                .body(ErrorResponse.of(message));
    }

    /**
     * Trata qualquer outra exceção não tratada
     * 
     * Este é o fallback para erros inesperados
     * 
     * @param ex Exceção
     * @return ErrorResponse genérico
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        // Log do erro para debug (não expomos o stack trace ao cliente)
        ex.printStackTrace();
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of("Erro interno do servidor."));
    }
}
