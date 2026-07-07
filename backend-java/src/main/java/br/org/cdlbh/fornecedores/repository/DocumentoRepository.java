package br.org.cdlbh.fornecedores.repository;

import br.org.cdlbh.fornecedores.entity.Documento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

/**
 * Repository JPA para a entidade Documento
 * 
 * Fornece métodos para operações de banco de dados relacionadas a documentos
 */
@Repository
public interface DocumentoRepository extends JpaRepository<Documento, Long> {

    /**
     * Busca todos os documentos de um fornecedor específico
     * 
     * @param fornecedorId ID do fornecedor
     * @return Lista de documentos do fornecedor
     */
    List<Documento> findByFornecedorId(Long fornecedorId);

    /**
     * Busca documentos com data de vencimento entre duas datas
     * Útil para encontrar documentos vencendo em um período específico
     * 
     * @param startDate Data inicial
     * @param endDate Data final
     * @return Lista de documentos vencendo no período
     */
    List<Documento> findByDataVencimentoBetween(LocalDate startDate, LocalDate endDate);

    /**
     * Busca documentos com data de vencimento antes de uma data específica
     * Útil para encontrar documentos já vencidos
     * 
     * @param date Data limite
     * @return Lista de documentos vencidos
     */
    List<Documento> findByDataVencimentoBefore(LocalDate date);

    /**
     * Busca documentos por tipo
     * 
     * @param tipo Tipo do documento
     * @return Lista de documentos do tipo especificado
     */
    List<Documento> findByTipo(Documento.Tipo tipo);

    /**
     * Busca documentos vencendo nos próximos N dias
     * 
     * @param hoje Data atual
     * @param dias Número de dias à frente
     * @return Lista de documentos vencendo no período
     */
    @Query("SELECT d FROM Documento d WHERE d.dataVencimento BETWEEN :hoje AND :limite")
    List<Documento> findVencendoEm(@Param("hoje") LocalDate hoje, @Param("limite") LocalDate limite);

    /**
     * Busca documentos já vencidos
     * 
     * @param hoje Data atual
     * @return Lista de documentos vencidos
     */
    @Query("SELECT d FROM Documento d WHERE d.dataVencimento < :hoje")
    List<Documento> findVencidos(@Param("hoje") LocalDate hoje);
}
