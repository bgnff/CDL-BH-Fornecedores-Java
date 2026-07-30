package br.org.cdlbh.fornecedores.exception;

/**
 * Lançada quando um recurso (usuário, fornecedor, etc.) buscado por ID não é encontrado.
 * O GlobalExceptionHandler captura esta exceção e retorna HTTP 404.
 */
public class RecursoNaoEncontradoException extends RuntimeException {
    public RecursoNaoEncontradoException(String mensagem) {
        super(mensagem);
    }
}
