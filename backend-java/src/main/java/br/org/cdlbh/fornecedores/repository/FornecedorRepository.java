package br.org.cdlbh.fornecedores.repository;

import br.org.cdlbh.fornecedores.entity.Fornecedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository Spring Data JPA para a entidade Fornecedor
 */
@Repository
public interface FornecedorRepository extends JpaRepository<Fornecedor, Long> {

    /**
     * Busca todos os fornecedores ordenados por data de criação (mais recentes primeiro)
     * 
     * findAllByOrderByCreatedAtDesc: Gera automaticamente a query:
     * "SELECT * FROM fornecedores ORDER BY created_at DESC"
     * 
     * @return Lista de fornecedores ordenada
     */
    List<Fornecedor> findAllByOrderByCreatedAtDesc();

    /**
     * Busca fornecedores por status
     * 
     * @param status Status (ativo ou inativo)
     * @return Lista de fornecedores com o status especificado
     */
    List<Fornecedor> findByStatus(Fornecedor.Status status);

    /**
     * Busca fornecedores por projeto
     * 
     * @param projetoId ID do projeto
     * @return Lista de fornecedores do projeto
     */
    List<Fornecedor> findByProjetoId(Long projetoId);

    /**
     * Conta o número de fornecedores vinculados a um projeto
     */
    long countByProjetoId(Long projetoId);

    /**
     * Busca textual usando FULLTEXT index do MySQL
     * 
     * @Query: Define uma query JPQL ou SQL customizada
     * - nativeQuery = true: Indica que é SQL nativo (não JPQL)
     * - MATCH...AGAINST: Sintaxe do MySQL para busca FULLTEXT
     * 
     * Por que usar SQL nativo aqui?
     * - O Spring Data JPA não suporta nativamente FULLTEXT do MySQL
     * - Precisamos usar a sintaxe específica do MySQL para busca textual eficiente
     * 
     * @param termo Termo de busca
     * @return Lista de fornecedores que correspondem ao termo
     */
    @Query(value = "SELECT * FROM fornecedores WHERE MATCH(nome, empresa_pf, palavra_chave) AGAINST(:termo IN NATURAL LANGUAGE MODE)", 
           nativeQuery = true)
    List<Fornecedor> buscarPorTexto(@Param("termo") String termo);

    /**
     * Busca combinada por status e projeto
     * 
     * @param status Status
     * @param projetoId ID do projeto
     * @return Lista de fornecedores com o status e projeto especificados
     */
    List<Fornecedor> findByStatusAndProjetoId(Fornecedor.Status status, Long projetoId);

    /**
     * Busca fornecedores por CNPJ (busca parcial, case-insensitive)
     * 
     * @param cnpj CNPJ ou parte do CNPJ
     * @return Lista de fornecedores com o CNPJ especificado
     */
    List<Fornecedor> findByCnpjContainingIgnoreCase(String cnpj);
}
