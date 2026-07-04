package br.org.cdlbh.fornecedores.service;

import br.org.cdlbh.fornecedores.dto.LoginRequest;
import br.org.cdlbh.fornecedores.dto.LoginResponse;
import br.org.cdlbh.fornecedores.dto.UserResponse;
import br.org.cdlbh.fornecedores.entity.Usuario;
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
     * @throws RuntimeException se credenciais forem inválidas
     */
    public LoginResponse login(LoginRequest request) {
        // Log para debug
        System.out.println("[AuthService] Tentativa de login para email: " + request.getEmail());
        
        // Busca o usuário pelo e-mail
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    System.out.println("[AuthService] Usuário não encontrado: " + request.getEmail());
                    return new RuntimeException("Credenciais inválidas.");
                });

        System.out.println("[AuthService] Usuário encontrado: " + usuario.getEmail() + ", ID: " + usuario.getId());

        // Verifica se a senha está correta
        // passwordEncoder.matches(): Compara a senha em texto plano com o hash bcrypt
        // - Retorna true se a senha corresponde ao hash
        // - É seguro porque bcrypt é lento e usa salt
        if (!passwordEncoder.matches(request.getPassword(), usuario.getSenhaHash())) {
            System.out.println("[AuthService] Senha incorreta para usuário: " + request.getEmail());
            throw new RuntimeException("Credenciais inválidas.");
        }

        System.out.println("[AuthService] Senha correta, gerando token JWT");

        // Gera o token JWT
        String token = jwtProvider.generateToken(
                usuario.getId(),
                usuario.getEmail(),
                usuario.getNome(),
                usuario.getRole().name()
        );

        System.out.println("[AuthService] Token JWT gerado com sucesso");

        // Cria a resposta com o token e dados do usuário
        LoginResponse response = new LoginResponse();
        response.setAccess_token(token);
        response.setUser(UserResponse.fromEntity(usuario));

        return response;
    }

    /**
     * Obtém os dados do usuário autenticado
     * 
     * @param userId ID do usuário (extraído do token JWT)
     * @return UserResponse com dados do usuário
     */
    @SuppressWarnings("null")
    public UserResponse getMe(Long userId) {
        Usuario usuario = usuarioRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));
        return UserResponse.fromEntity(usuario);
    }
}
