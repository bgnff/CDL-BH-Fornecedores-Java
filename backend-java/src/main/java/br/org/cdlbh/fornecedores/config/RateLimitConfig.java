package br.org.cdlbh.fornecedores.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.BucketConfiguration;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.function.Supplier;

/**
 * Configuração de Rate Limiting usando Bucket4j
 * 
 * Rate Limiting: Limita o número de requisições em um período de tempo
 * - Usado para prevenir ataques de força bruta no login
 * - Limita a 5 tentativas de login em 15 minutos por IP
 * 
 * Por que usar Rate Limiting?
 * - Sem rate limiting, um atacante poderia tentar milhares de senhas por segundo
 * - Com rate limiting, após 5 tentativas falhas, precisa esperar 15 minutos
 * - Isso torna ataques de força bruta impraticáveis
 * 
 * Bucket4j: Biblioteca Java que implementa o algoritmo Token Bucket
 * - Token Bucket: Um "balde" que enche com tokens a uma taxa fixa
 * - Cada requisição consome um token
 * - Se o balde estiver vazio, a requisição é rejeitada
 */
@Component
public class RateLimitConfig {

    /**
     * Proxy manager para buckets distribuídos
     * - Em produção, poderia usar Redis para buckets compartilhados entre instâncias
     * - Para desenvolvimento, usamos buckets em memória
     */
    @Autowired(required = false)
    private ProxyManager<String> proxyManager;

    /**
     * Cria um bucket de rate limiting para um IP específico
     * 
     * @param request Requisição HTTP (para extrair o IP)
     * @return Bucket configurado com limites de taxa
     */
    public Bucket resolveBucket(HttpServletRequest request) {
        String key = getIpKey(request);
        
        if (proxyManager != null) {
            // Modo distribuído (Redis) - para produção com múltiplas instâncias
            Supplier<BucketConfiguration> configSupplier = getConfigSupplierForUser();
            return proxyManager.builder().build(key, configSupplier);
        } else {
            // Modo local (memória) - para desenvolvimento
            return createLocalBucket();
        }
    }

    /**
     * Cria um bucket local em memória
     * 
     * Configuração: 5 tentativas em 15 minutos
     * - capacity: 5 tokens (capacidade máxima do balde)
     * - refill: 1 token a cada 3 minutos (5 tokens em 15 minutos)
     */
    private Bucket createLocalBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(5) // 5 tentativas
                .refillIntervally(1, Duration.ofMinutes(3)) // 1 token a cada 3 minutos
                .build();
        
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * Configuração para modo distribuído (não usado neste projeto, mas preparado para produção)
     */
    private Supplier<BucketConfiguration> getConfigSupplierForUser() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(5)
                .refillIntervally(1, Duration.ofMinutes(3))
                .build();
        
        return () -> BucketConfiguration.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * Extrai uma chave única para o IP da requisição
     * 
     * @param request Requisição HTTP
     * @return String com o IP (ou "unknown" se não for possível determinar)
     */
    private String getIpKey(HttpServletRequest request) {
        String ip = request.getRemoteAddr();
        
        // Verifica headers de proxy (caso esteja atrás de load balancer)
        // X-Forwarded-For: Header com o IP original quando há proxy
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            ip = xForwardedFor.split(",")[0].trim();
        }
        
        return ip != null ? ip : "unknown";
    }
}
