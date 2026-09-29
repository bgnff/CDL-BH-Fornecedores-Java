package br.org.cdlbh.fornecedores.controller;

import br.org.cdlbh.fornecedores.dto.LoginRequest;
import br.org.cdlbh.fornecedores.dto.LoginResponse;
import br.org.cdlbh.fornecedores.dto.UserResponse;
import br.org.cdlbh.fornecedores.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * Controller REST para autenticação
 * 
 * @RestController: Combina @Controller e @ResponseBody
 * - @Controller: Marca esta classe como um controller Spring MVC
 * - @ResponseBody: Indica que os métodos retornam JSON diretamente
 * - Não precisamos anotar cada método com @ResponseBody
 * 
 * @RequestMapping: Define o caminho base para todos os endpoints deste controller
 * - Todos os endpoints começam com /api/auth
 * 
 * Equivalente às rotas do Express em backend/routes/auth.js
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private br.org.cdlbh.fornecedores.config.RateLimitConfig rateLimitConfig;

    /**
     * Endpoint de login
     * 
     * POST /api/auth/login
     * - Público (não exige autenticação)
     * - Rate limited: 5 tentativas em 15 minutos por IP
     * 
     * @param request Dados de login (email e senha)
     * @param httpRequest Requisição HTTP (para rate limiting)
     * @return LoginResponse com token JWT e dados do usuário
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, jakarta.servlet.http.HttpServletRequest httpRequest) {
        io.github.bucket4j.Bucket bucket = rateLimitConfig.resolveBucket(httpRequest);
        if (!bucket.tryConsume(1)) {
            return ResponseEntity.status(429).body(java.util.Map.of(
                    "error", "Muitas tentativas de login. Aguarde alguns minutos antes de tentar novamente."
            ));
        }

        // Chama o service para processar o login
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para obter dados do usuário autenticado
     * 
     * GET /api/auth/me
     * - Exige autenticação (JWT válido)
     * - Retorna os dados do usuário logado
     * 
     * @param authentication Objeto de autenticação do Spring Security
     * @return UserResponse com dados do usuário
     */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMe(Authentication authentication) {
        // Extrai o ID do usuário do contexto de segurança
        // O principal (identificação) é o ID do usuário (definido no JwtAuthenticationFilter)
        Long userId = Long.parseLong(authentication.getName());
        
        // Chama o service para obter os dados do usuário
        UserResponse response = authService.getMe(userId);
        return ResponseEntity.ok(response);
    }
}
