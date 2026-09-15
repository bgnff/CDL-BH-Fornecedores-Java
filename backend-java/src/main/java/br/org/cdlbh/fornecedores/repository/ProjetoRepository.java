package br.org.cdlbh.fornecedores.repository;

import br.org.cdlbh.fornecedores.entity.Projeto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository Spring Data JPA para a entidade Projeto
 */
@Repository
public interface ProjetoRepository extends JpaRepository<Projeto, Long> {

    /**
     * Busca projeto por nome
     * 
     * @param nome Nome do projeto
     * @return Optional<Projeto>
     */
    Optional<Projeto> findByNome(String nome);

    /**
     * Busca todos os projetos ordenados por nome alfabético
     */
    java.util.List<Projeto> findAllByOrderByNomeAsc();

    /**
     * Verifica se um projeto com o nome já existe
     * 
     * @param nome Nome do projeto
     * @return true se existe, false caso contrário
     */
    boolean existsByNome(String nome);

    /**
     * Verifica se um projeto com o mesmo nome já existe (case-insensitive)
     */
    boolean existsByNomeIgnoreCase(String nome);

    /**
     * Verifica duplicidade de nome ignorando o próprio ID durante atualização
     */
    boolean existsByNomeIgnoreCaseAndIdNot(String nome, Long id);
}
