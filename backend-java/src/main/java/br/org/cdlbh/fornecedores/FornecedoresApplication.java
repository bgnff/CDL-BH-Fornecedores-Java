package br.org.cdlbh.fornecedores;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Classe principal da aplicação Spring Boot
 * 
 * Esta é a classe de entrada (entry point) da aplicação. Quando executamos
 * o projeto, o Spring Boot inicia a partir desta classe.
 * 
 * @SpringBootApplication: É uma anotação composta que inclui:
 * - @Configuration: Indica que esta classe define configurações do Spring
 * - @EnableAutoConfiguration: Habilita configuração automática do Spring Boot
 *   (o Spring tenta configurar automaticamente baseado nas dependências)
 * - @ComponentScan: Escaneia o pacote atual e subpacotes em busca de
 *   componentes Spring (@Controller, @Service, @Repository, etc.)
 * 
 * @EnableScheduling: Habilita suporte a tarefas agendadas (scheduled tasks)
 * Necessário para o backup automático que roda a cada hora
 */
@SpringBootApplication
@EnableScheduling
public class FornecedoresApplication {

    /**
     * Método main - ponto de entrada da aplicação Java
     * 
     * @param args Argumentos de linha de comando (não usados neste projeto)
     */
    public static void main(String[] args) {
        // SpringApplication.run() inicia o contexto Spring e oservidor embutido
        // O Spring Boot configura automaticamente o Tomcat na porta 8080
        SpringApplication.run(FornecedoresApplication.class, args);
    }
}
