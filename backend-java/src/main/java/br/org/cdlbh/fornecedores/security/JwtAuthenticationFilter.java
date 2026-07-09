package br.org.cdlbh.fornecedores.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

/**
 * Filtro JWT para autenticação de requisições
 * 
 * @Component: Marca como componente Spring gerenciado
 * @OncePerRequestFilter: Garante que o filtro execute apenas uma vez por requisição
 * - Importante porque o Spring pode chamar filtros múltiplas vezes
 * 
 * Este filtro intercepta todas as requisições HTTP e verifica se há um token JWT válido
 * Se houver, autentica o usuário no contexto de segurança do Spring
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtProvider jwtProvider;

    /**
     * Header onde o token JWT deve estar
     * - Padrão: Authorization: Bearer <token>
     * - NÃO aceitamos token via query param por segurança
     * 
     * Por que não aceitar via query param?
     * - Query params ficam em logs de servidor, proxies, histórico de navegador
     - Isso exporia o token em lugares onde não deveria
     * - Headers são mais seguros pois não são logados por padrão
     */
    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    /**
     * Método principal do filtro - executa em cada requisição
     * 
     * @param request Requisição HTTP
     * @param response Resposta HTTP
     * @param filterChain Cadeia de filtros (permite passar para o próximo filtro)
     */
    @Override
    @SuppressWarnings("null")
    protected void doFilterInternal(HttpServletRequest request, 
                                    HttpServletResponse response, 
                                    FilterChain filterChain) throws ServletException, IOException {
        
        // Extrai o header Authorization da requisição
        String authorizationHeader = request.getHeader(AUTHORIZATION_HEADER);

        // Verifica se o header existe e começa com "Bearer "
        if (authorizationHeader != null && authorizationHeader.startsWith(BEARER_PREFIX)) {
            // Extrai o token removendo o prefixo "Bearer "
            String token = authorizationHeader.substring(BEARER_PREFIX.length());

            try {
                // Valida o token usando o JwtProvider
                if (jwtProvider.validateToken(token)) {
                    // Token válido - extrai as informações do usuário
                    Long userId = jwtProvider.getUserIdFromToken(token);
                    String role = jwtProvider.getRoleFromToken(token);

                    // Cria um objeto de autenticação do Spring Security
                    // UsernamePasswordAuthenticationToken: Representa um usuário autenticado
                    // - Primeiro parâmetro: principal (identificação do usuário - usamos o ID)
                    // - Segundo parâmetro: credentials (não usamos pois é JWT)
                    // - Terceiro parâmetro: authorities (permissões/roles do usuário)
                    UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(
                                    userId, 
                                    null, 
                                    Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role))
                            );

                    // Adiciona detalhes da requisição (IP, session ID, etc.)
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Define o usuário como autenticado no contexto de segurança
                    // A partir daqui, o Spring Security sabe quem está fazendo a requisição
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                // Se houver erro na validação do token, retorna 401 para que o frontend limpe o token
                // Isso é importante para tokens expirados, pois o frontend precisa saber para fazer logout
                logger.error("Erro ao processar token JWT: " + e.getMessage());
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"error\":\"Token inválido ou expirado\"}");
                return;
            }
        }

        // Passa a requisição para o próximo filtro na cadeia
        // Isso é obrigatório para que a requisição continue até o controller
        filterChain.doFilter(request, response);
    }
}
