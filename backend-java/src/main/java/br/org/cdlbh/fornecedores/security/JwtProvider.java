/*
 * Copyright (c) 2026 Brayan Oliveira de Souza
 * Todos os direitos reservados.
 *
 * Protegido sob a Lei Federal nº 9.609/1998 (Lei do Software)
 * e Lei Federal nº 9.610/1998 (Direitos Autorais).
 */
package br.org.cdlbh.fornecedores.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

/**
 * Componente responsável por gerar e validar tokens JWT
 * Autor: Brayan Oliveira de Souza
 * 
 * @Component: Marca esta classe como um componente Spring gerenciado
 * - O Spring vai criar uma instância automaticamente e injetar onde for necessário
 * 
 * JWT (JSON Web Token): Token compacto e URL-safe que representa claims
 * - Usado para autenticação stateless (o servidor não precisa manter sessão)
 * - O token contém todas as informações necessárias (payload)
 * - Assinado com uma chave secreta para garantir autenticidade
 */
@Component
public class JwtProvider {

    /**
     * Chave secreta usada para assinar os tokens
     * - @Value: Injeta o valor da propriedade do application.properties
     * - Se não estiver definida, usa um valor padrão (NÃO recomendado para produção)
     * 
     * Por que a chave secreta é importante?
     * - Se alguém descobrir a chave, pode forjar tokens e acessar o sistema
     * - Deve ser longa, aleatória e mantida em segredo
     * - NUNCA commitar a chave real no repositório
     */
    @Value("${jwt.secret:cdlbh_secret_default_change_in_production}")
    private String jwtSecret;

    /**
     * Tempo de expiração do token em milissegundos
     * - 30 minutos = 30 * 60 * 1000 = 1800000 ms
     * - Após esse tempo, o token expira e o usuário precisa fazer login novamente
     */
    @Value("${jwt.expiration:1800000}")
    private Long jwtExpiration;

    /**
     * Gera a chave criptográfica a partir da string secreta
     * - Keys.hmacShaKeyFor(): Cria uma chave HMAC-SHA
     * - getBytes(StandardCharsets.UTF_8): Converte string para bytes
     * 
     * Por que usar HMAC-SHA?
     * - É um algoritmo de assinatura digital seguro
     * - Garante que o token não foi alterado
     * - Verifica a autenticidade do emissor
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Gera um token JWT para um usuário
     * 
     * @param userId ID do usuário
     * @param email E-mail do usuário
     * @param fullName Nome completo do usuário
     * @param role Papel do usuário (admin/user)
     * @return String com o token JWT
     */
    public String generateToken(Long userId, String email, String fullName, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + jwtExpiration);

        // Jwts.builder(): Inicia a construção do token
        return Jwts.builder()
                .subject(String.valueOf(userId)) // subject: identificação principal (ID do usuário)
                .claim("email", email) // claim: dados adicionais (e-mail)
                .claim("full_name", fullName) // claim: nome completo
                .claim("role", role) // claim: papel do usuário
                .issuedAt(now) // issuedAt: data de emissão
                .expiration(expiryDate) // expiration: data de expiração
                .signWith(getSigningKey()) // signWith: assina com a chave secreta
                .compact(); // compact: gera a string do token
    }

    /**
     * Extrai o ID do usuário do token JWT
     * 
     * @param token Token JWT
     * @return ID do usuário como Long
     */
    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey()) // Verifica a assinatura com a chave
                .build()
                .parseSignedClaims(token) // Parse e valida o token
                .getPayload(); // Extrai o payload (claims)

        return Long.parseLong(claims.getSubject());
    }

    /**
     * Extrai o e-mail do usuário do token JWT
     */
    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.get("email", String.class);
    }

    /**
     * Extrai o nome completo do usuário do token JWT
     */
    public String getFullNameFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.get("full_name", String.class);
    }

    /**
     * Extrai o papel do usuário do token JWT
     */
    public String getRoleFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();

        return claims.get("role", String.class);
    }

    /**
     * Valida se o token JWT é válido
     * 
     * @param token Token JWT
     * @return true se válido, false se inválido ou expirado
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (SecurityException ex) {
            // Assinatura inválida (token foi alterado ou chave incorreta)
            System.err.println("Assinatura JWT inválida: " + ex.getMessage());
        } catch (MalformedJwtException ex) {
            // Token malformado (não é um JWT válido)
            System.err.println("Token JWT malformado: " + ex.getMessage());
        } catch (ExpiredJwtException ex) {
            // Token expirado
            System.err.println("Token JWT expirado: " + ex.getMessage());
        } catch (UnsupportedJwtException ex) {
            // Token não suportado (formato desconhecido)
            System.err.println("Token JWT não suportado: " + ex.getMessage());
        } catch (IllegalArgumentException ex) {
            // Token vazio ou nulo
            System.err.println("Claims JWT vazios: " + ex.getMessage());
        }
        return false;
    }
}
