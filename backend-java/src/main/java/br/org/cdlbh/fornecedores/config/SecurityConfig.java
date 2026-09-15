package br.org.cdlbh.fornecedores.config;

import br.org.cdlbh.fornecedores.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Configuração de segurança do Spring Security
 * 
 * @Configuration: Marca esta classe como uma classe de configuração do Spring
 * - O Spring vai ler esta classe e aplicar as configurações definidas
 * 
 * @EnableWebSecurity: Habilita a segurança web do Spring Security
 * - Ativa o filtro de segurança que intercepta todas as requisições
 * 
 * @EnableMethodSecurity: Habilita segurança em nível de método
 * - Permite usar @PreAuthorize, @Secured, etc. nos métodos dos controllers/services
 * - Ex: @PreAuthorize("hasRole('ADMIN')") restringe acesso a admins
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    /**
     * URLs do frontend permitidas pelo CORS
     * - @Value: Injeta a lista de URLs do application.properties
     * - Se não estiver definida, usa localhost:5173 como padrão
     */
    @Value("${cors.allowed-origins:http://localhost:5173}")
    private String corsAllowedOrigins;

    /**
     * Configura o encoder de senha (BCrypt)
     * 
     * @Bean: Indica que este método retorna um bean gerenciado pelo Spring
     * - O Spring vai chamar este método e manter a instância
     * - Podemos injetar este bean em outras classes com @Autowired
     * 
     * Por que usar BCrypt?
     * - É um algoritmo de hash de senha seguro e amplamente usado
     * - Inclui salt automático (cada senha tem um hash diferente mesmo se iguais)
     * - É lento propositalmente (dificulta ataques de força bruta)
     * - A força padrão (10) é considerada segura em 2024
     * 
     * @return BCryptPasswordEncoder configurado
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * Configura a fonte de CORS (Cross-Origin Resource Sharing)
     * 
     * CORS é um mecanismo de segurança do navegador que bloqueia requisições
     * entre origens diferentes (ex: frontend em localhost:5173 acessando backend em localhost:8080)
     * 
     * Por que precisamos configurar CORS?
     * - Sem configuração, o navegador bloqueia requisições de origens diferentes
     * - Precisamos whitelistar as origens permitidas (nosso frontend)
     * 
     * @return CorsConfigurationSource com as origens permitidas
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // Converte a string de origens em lista (separada por vírgula)
        List<String> allowedOrigins = Arrays.asList(corsAllowedOrigins.split(","));
        
        // Configura as origens permitidas (compatível com allowCredentials e wildcards)
        configuration.setAllowedOriginPatterns(allowedOrigins);
        
        // Métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        
        // Headers permitidos (inclui Authorization para JWT)
        configuration.setAllowedHeaders(Arrays.asList("*"));
        
        // Permite enviar cookies/credentials (não usamos neste projeto, mas é boa prática)
        configuration.setAllowCredentials(true);
        
        // Configura a origem baseada em URL
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }

    /**
     * Configura a cadeia de filtros de segurança
     * 
     * Este é o método principal onde definimos:
     * - Quais endpoints são públicos (não exigem autenticação)
     * - Quais endpoints exigem autenticação
     * - Como autenticar (via JWT)
     * - Headers de segurança (CSP, HSTS, etc.)
     * 
     * @param http Objeto de configuração HTTP do Spring Security
     * @return SecurityFilterChain configurado
     * @throws Exception Se houver erro na configuração
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Desabilita CSRF (Cross-Site Request Forgery)
                // CSRF é relevante para aplicações com sessões (cookies)
                // Como usamos JWT (stateless), CSRF não é necessário
                .csrf(csrf -> csrf.disable())
                
                // Configura CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                // Configura autorização de requisições
                .authorizeHttpRequests(auth -> auth
                        // Endpoints públicos (não exigem autenticação)
                        .requestMatchers("/api/auth/login", "/api/health").permitAll()
                        
                        // Todas as outras requisições exigem autenticação
                        .anyRequest().authenticated()
                )
                
                // Configura gestão de sessão como STATELESS
                // STATELESS: O servidor não mantém sessão do usuário
                // Cada requisição deve incluir o token JWT
                // Isso é ideal para APIs REST e escalabilidade horizontal
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                
                // Adiciona headers de segurança HTTP (equivalente ao Helmet do Node.js)
                // Esses headers protegem contra diversos ataques
                .headers(headers -> headers
                        // X-Content-Type-Options: Previne sniffing de MIME type
                        .contentTypeOptions(contentType -> contentType.disable())
                        
                        // X-Frame-Options: Previne clickjacking (site dentro de iframe)
                        .frameOptions(frame -> frame.sameOrigin())
                        
                        // X-XSS-Protection: Habilita filtro XSS do navegador
                        .xssProtection(xss -> xss.disable())
                        
                        // Strict-Transport-Security (HSTS): Força HTTPS
                        // Importante para produção, mas pode causar problemas em desenvolvimento HTTP
                        // .httpStrictTransportSecurity(hsts -> hsts
                        //         .includeSubDomains(true)
                        //         .maxAgeInSeconds(31536000)
                        // )
                        
                        // Content-Security-Policy (CSP): Controla quais recursos podem ser carregados
                        // Previne XSS ao restringir origens de scripts, estilos, etc.
                        // .contentSecurityPolicy(csp -> csp
                        //         .policyDirectives(policy -> "default-src 'self'")
                        // )
                )
                
                // Adiciona nosso filtro JWT antes do filtro de autenticação padrão
                // UsernamePasswordAuthenticationFilter é onde o Spring Security tenta autenticar
                // Adicionamos antes para que nosso JWT filter processe primeiro
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
