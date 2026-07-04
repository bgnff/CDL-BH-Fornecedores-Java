package br.org.cdlbh.fornecedores;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class GerarHash {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String senha = "testefcdl2026";
        String hash = encoder.encode(senha);
        System.out.println("Hash: " + hash);
    }
}
