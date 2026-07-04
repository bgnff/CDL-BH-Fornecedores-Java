package br.org.cdlbh.fornecedores.repository;

import br.org.cdlbh.fornecedores.entity.Log;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository Spring Data JPA para a entidade Log
 */
@Repository
public interface LogRepository extends JpaRepository<Log, Long> {

    /**
     * Busca logs por usuário
     * 
     * @param usuarioId ID do usuário
     * @return Lista de logs do usuário
     */
    List<Log> findByUsuarioId(Long usuarioId);

    /**
     * Busca logs por tabela
     * 
     * @param tabela Nome da tabela
     * @return Lista de logs da tabela
     */
    List<Log> findByTabela(String tabela);

    /**
     * Busca logs por registro específico
     * 
     * @param tabela Nome da tabela
     * @param registroId ID do registro
     * @return Lista de logs do registro
     */
    List<Log> findByTabelaAndRegistroId(String tabela, Long registroId);

    /**
     * Busca logs por tipo de ação
     * 
     * @param acao Tipo de ação (CREATE, UPDATE, DELETE)
     * @return Lista de logs da ação
     */
    List<Log> findByAcao(String acao);

    /**
     * Busca todos os logs ordenados por data (mais recentes primeiro)
     * 
     * @return Lista de logs ordenada
     */
    List<Log> findAllByOrderByCreatedAtDesc();
}
