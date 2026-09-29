package br.org.cdlbh.fornecedores;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GerarHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String senha = (args != null && args.length > 0) ? args[0] : "admin123";
        String hash = encoder.encode(senha);
        System.out.println("Hash BCrypt gerado com sucesso: " + hash);
    }
}
