/*
 * Copyright (c) 2026 Brayan Oliveira de Souza
 * Todos os direitos reservados.
 *
 * Protegido sob a Lei Federal nº 9.609/1998 (Lei do Software)
 * e Lei Federal nº 9.610/1998 (Direitos Autorais).
 */
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
        
        // Configura as origens permitidas
        if (allowedOrigins.contains("*")) {
            configuration.setAllowedOriginPatterns(Arrays.asList("http://localhost:[*]", "http://127.0.0.1:[*]", "https://*.netlify.app", "https://*.cdlbh.org.br"));
        } else {
            configuration.setAllowedOriginPatterns(allowedOrigins);
        }
        
        // Métodos HTTP permitidos
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        
        // Headers permitidos (inclui Authorization para JWT)
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        
        // Expõe headers importantes para o cliente
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Content-Disposition"));
        
        // Permite enviar cookies/credentials com origens controladas
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        // Configura a origem baseada em URL
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        
        return source;
    }

    /**
     * Configura a cadeia de filtros de segurança com headers de defesa em profundidade (OWASP)
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Desabilita CSRF pois usamos JWT stateless via Bearer header
                .csrf(csrf -> csrf.disable())
                
                // Configura CORS controlado
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                
                // Configura autorização de requisições
                .authorizeHttpRequests(auth -> auth
                        // Endpoints públicos estritos
                        .requestMatchers("/api/auth/login", "/api/health").permitAll()
                        // Console H2 se ativo em ambiente local
                        .requestMatchers("/h2-console/**").permitAll()
                        // Todas as outras requisições exigem autenticação válida
                        .anyRequest().authenticated()
                )
                
                // Configura gestão de sessão como STATELESS (sem sessões no servidor)
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                
                // Headers avançados de segurança HTTP (OWASP Recommended)
                .headers(headers -> headers
                        // Previne sniffing de MIME type
                        .contentTypeOptions(org.springframework.security.config.Customizer.withDefaults())
                        
                        // Previne clickjacking (mesma origem para iframes locais como h2-console)
                        .frameOptions(frame -> frame.sameOrigin())
                        
                        // Referrer Policy estrita
                        .referrerPolicy(referrer -> referrer
                                .policy(org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
                        )
                        
                        // Permissions Policy: desabilita recursos desnecessários do navegador
                        .permissionsPolicy(permissions -> permissions
                                .policy("camera=(), microphone=(), geolocation=(), payment=()")
                        )
                )
                
                // Adiciona filtro JWT antes do filtro de autenticação padrão
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
