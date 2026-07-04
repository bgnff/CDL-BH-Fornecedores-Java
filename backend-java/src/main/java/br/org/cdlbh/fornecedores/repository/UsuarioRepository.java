package br.org.cdlbh.fornecedores.repository;

import br.org.cdlbh.fornecedores.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository Spring Data JPA para a entidade Usuario
 * 
 * @Repository: Marca esta interface como um componente Spring do tipo Repository
 * - Não é estritamente necessário JpaRepository já é anotado com @Repository
 * - Mas deixa explícito o propósito da interface
 * 
 * JpaRepository<Usuario, Long>: Interface do Spring Data JPA
 * - Primeiro parâmetro: Tipo da entidade (Usuario)
 * - Segundo parâmetro: Tipo da chave primária (Long)
 * 
 * O que essa interface fornece automaticamente?
 * - Métodos CRUD básicos: save(), findById(), findAll(), deleteById(), etc.
 * - Métodos de paginação e ordenação
 * - Tudo sem escrever uma linha de SQL!
 * 
 * Por que usar Repository em vez de escrever SQL diretamente?
 * - Abstração: Não precisamos nos preocupar com Connection, Statement, ResultSet
 * - Type safety: O Java verifica tipos em tempo de compilação
 * - Manutenibilidade: Mudanças no schema são mais fáceis de gerenciar
 * - Testabilidade: Fácil de mockar em testes
 */
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    /**
     * Método customizado para buscar usuário por e-mail
     * 
     * O Spring Data JPA interpreta o nome do método e gera a query automaticamente!
     * - findByEmail: "SELECT * FROM usuarios WHERE email = ?"
     * 
     * @param email E-mail do usuário
     * @return Optional<Usuario>: Pode conter o usuário ou estar vazio
     * 
     * Por que Optional?
     * - Evita NullPointerException: força o desenvolvedor a tratar o caso de não encontrar
     * - Mais seguro que retornar null
     */
    Optional<Usuario> findByEmail(String email);

    /**
     * Método para verificar se um e-mail já existe
     * 
     * existsByEmail: "SELECT COUNT(*) > 0 FROM usuarios WHERE email = ?"
     * 
     * @param email E-mail a verificar
     * @return true se o e-mail já existe, false caso contrário
     */
    boolean existsByEmail(String email);
}
