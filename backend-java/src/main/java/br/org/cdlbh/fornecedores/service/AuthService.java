package br.org.cdlbh.fornecedores.service;

import br.org.cdlbh.fornecedores.dto.LoginRequest;
import br.org.cdlbh.fornecedores.dto.LoginResponse;
import br.org.cdlbh.fornecedores.dto.UserResponse;
import br.org.cdlbh.fornecedores.entity.Usuario;
import br.org.cdlbh.fornecedores.exception.CredenciaisInvalidasException;
import br.org.cdlbh.fornecedores.exception.RecursoNaoEncontradoException;
import br.org.cdlbh.fornecedores.repository.UsuarioRepository;
import br.org.cdlbh.fornecedores.security.JwtProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service de autenticação
 *
 * @Service: Marca esta classe como um serviço Spring
 * - Serviços contêm a lógica de negócio da aplicação
 * - Controllers delegam para serviços, que delegam para repositories
 * - Isso separa responsabilidades: Controller = HTTP, Service = Lógica, Repository = Dados
 *
 * Por que ter uma camada de serviço?
 * - No Express/Node.js, as rotas faziam tudo junto (validação, lógica, acesso a dados)
 * - Em Spring Boot, separamos em camadas para melhor organização e testabilidade
 * - Podemos testar a lógica de negócio sem HTTP, e testar HTTP sem lógica
 */
@Service
public class AuthService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtProvider jwtProvider;

    /**
     * Realiza o login de um usuário
     *
     * @param request Dados de login (email e senha)
     * @return LoginResponse com token JWT e dados do usuário
     * @throws CredenciaisInvalidasException se o e-mail não existir ou a senha estiver errada
     *
     * IMPORTANTE (por que trocamos RuntimeException por uma exceção própria):
     * Antes, os dois cenários de erro abaixo (e-mail não encontrado / senha errada)
     * lançavam "RuntimeException" genérica. O problema é que RuntimeException também
     * é a classe-pai de praticamente qualquer bug inesperado do sistema (ex: erro de
     * conexão com o banco, NullPointerException, etc). Se o GlobalExceptionHandler
     * capturasse "RuntimeException" para devolver 401, um bug real do sistema também
     * viraria "credenciais inválidas" na tela — o que esconde erros de verdade e
     * dificulta o diagnóstico.
     *
     * Com uma exceção específica (CredenciaisInvalidasException), o GlobalExceptionHandler
     * consegue diferenciar com precisão: erro de negócio esperado (401) vs. bug real (500,
     * logado com stack trace completo para investigação).
     */
    public LoginResponse login(LoginRequest request) {
        // Busca o usuário pelo e-mail
        // Por segurança, NUNCA revelamos ao cliente se o problema foi o e-mail
        // não existir ou a senha estar errada — a mensagem é sempre genérica
        // ("Credenciais inválidas"), para evitar que alguém descubra, por tentativa
        // e erro, quais e-mails estão cadastrados no sistema (enumeração de usuários)
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new CredenciaisInvalidasException("Credenciais inválidas."));

        // Verifica se a senha está correta
        // passwordEncoder.matches(): Compara a senha em texto plano com o hash bcrypt
        // - Retorna true se a senha corresponde ao hash
        // - É seguro porque bcrypt é lento (dificulta força bruta) e usa salt
        //   (o mesmo texto gera hashes diferentes a cada vez que é gerado)
        if (!passwordEncoder.matches(request.getPassword(), usuario.getSenhaHash())) {
            throw new CredenciaisInvalidasException("Credenciais inválidas.");
        }

        // Gera o token JWT com os dados do usuário autenticado
        String token = jwtProvider.generateToken(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getNome(),
                usuario.getRole().name()
        );

        // Cria a resposta com o token e dados do usuário
        LoginResponse response = new LoginResponse();
        response.setAccess_token(token);
        response.setUser(UserResponse.fromEntity(usuario));

        return response;
    }

    /**
     * Obtém os dados do usuário autenticado
     *
     * @param userId ID do usuário (extraído do token JWT pelo JwtAuthenticationFilter)
     * @return UserResponse com dados do usuário
     * @throws RecursoNaoEncontradoException se o usuário do token não existir mais no banco
     *
     * Por que RecursoNaoEncontradoException aqui, e não CredenciaisInvalidasException?
     * Este método só é chamado quando o token JWT já foi validado como autêntico
     * (o JwtAuthenticationFilter já rodou antes). Se o usuário não existe mais no banco
     * (ex: foi excluído depois que o token foi emitido), o problema não é "credenciais
     * inválidas" — é "o recurso que você está procurando não existe mais". Isso deve
     * virar um 404, não um 401.
     */
    @SuppressWarnings("null")
    public UserResponse getMe(Long userId) {
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new RecursoNaoEncontradoException("Usuário não encontrado."));
        return UserResponse.fromEntity(usuario);
    }
}