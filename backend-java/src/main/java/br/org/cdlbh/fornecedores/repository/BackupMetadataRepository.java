package br.org.cdlbh.fornecedores.repository;

import br.org.cdlbh.fornecedores.entity.BackupMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository JPA para a entidade BackupMetadata
 * 
 * Fornece métodos para operações de banco de dados relacionadas a metadados de backups
 */
@Repository
public interface BackupMetadataRepository extends JpaRepository<BackupMetadata, Long> {

    /**
     * Busca o último backup executado (ordenado por timestamp descendente)
     * 
     * Este método é usado para saber qual foi o último backup executado,
     * seja FULL ou INCREMENTAL, para determinar de onde o próximo incremental deve começar
     * 
     * @return Optional com o último backup, ou vazio se não houver nenhum
     */
    Optional<BackupMetadata> findFirstByOrderByExecutadoEmDesc();
}
