package br.org.cdlbh.fornecedores.exception;

/**
 * Lançada quando o e-mail não existe ou a senha não confere no login.
 * O GlobalExceptionHandler captura esta exceção e retorna HTTP 401.
 */
public class CredenciaisInvalidasException extends RuntimeException {
    public CredenciaisInvalidasException(String mensagem) {
        super(mensagem);
    }
}
