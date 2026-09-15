package br.org.cdlbh.fornecedores.exception;

import br.org.cdlbh.fornecedores.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
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

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

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
     * Trata CredenciaisInvalidasException
     * 
     * Lançada quando o e-mail não existe ou a senha está incorreta no login.
     * Retorna HTTP 401 (Unauthorized).
     * 
     * Por que ter este handler específico?
     * - Diferencia erros de autenticação esperados (401) de bugs reais do sistema (500)
     * - Permite que o frontend mostre mensagem apropriada ao usuário
     * - O stack trace completo é logado no servidor para diagnóstico, mas não exposto ao cliente
     * 
     * @param ex Exceção de credenciais inválidas
     * @return ErrorResponse com mensagem de erro
     */
    @ExceptionHandler(CredenciaisInvalidasException.class)
    public ResponseEntity<ErrorResponse> handleCredenciaisInvalidasException(CredenciaisInvalidasException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ErrorResponse.of(ex.getMessage()));
    }

    /**
     * Trata RecursoNaoEncontradoException
     * 
     * Lançada quando um recurso (usuário, fornecedor, etc.) buscado por ID não é encontrado.
     * Retorna HTTP 404 (Not Found).
     * 
     * Por que ter este handler específico?
     * - Diferencia recursos não encontrados (404) de outros erros
     * - Permite que o frontend mostre mensagem apropriada ao usuário
     * - O stack trace completo é logado no servidor para diagnóstico, mas não exposto ao cliente
     * 
     * @param ex Exceção de recurso não encontrado
     * @return ErrorResponse com mensagem de erro
     */
    @ExceptionHandler(RecursoNaoEncontradoException.class)
    public ResponseEntity<ErrorResponse> handleRecursoNaoEncontradoException(RecursoNaoEncontradoException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ErrorResponse.of(ex.getMessage()));
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
     * Trata exceções genéricas (RuntimeException)
     * 
     * Este handler captura RuntimeExceptions que não são das exceções específicas acima.
     * É um fallback para erros de negócio que ainda usam RuntimeException.
     * 
     * NOTA: Idealmente, todos os erros de negócio deveriam usar exceções específicas
     * (como CredenciaisInvalidasException) para permitir tratamento mais preciso.
     * 
     * @param ex Exceção genérica
     * @return ErrorResponse com mensagem de erro
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        logger.error("RuntimeException capturada: ", ex);
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
     * Trata qualquer outra exceção não tratada (fallback genérico)
     * 
     * Este é o handler de última instância para erros inesperados do sistema.
     * Captura exceções que não foram tratadas pelos handlers específicos acima.
     * 
     * Por que este handler é importante?
     * - Garante que o sistema nunca vaze informações sensíveis (stack traces, detalhes internos)
     * para o cliente, mesmo em caso de bugs inesperados
     * - Registra o stack trace completo no log do servidor para diagnóstico
     * - Retorna uma mensagem genérica ao cliente ("Erro interno do servidor")
     * - Isso permite que desenvolvedores investiguem erros reais sem expor detalhes técnicos aos usuários
     * 
     * @param ex Exceção não tratada
     * @return ErrorResponse genérico
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        // Log do erro completo no servidor para diagnóstico
        logger.error("Erro não tratado: ", ex);
        
        // Retorna mensagem genérica ao cliente - nunca expor detalhes internos
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResponse.of("Erro interno do servidor."));
    }
}
