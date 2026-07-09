package br.org.cdlbh.fornecedores.config;

import org.springframework.stereotype.Component;

/**
 * Configuração de tarefas agendadas (scheduled tasks)
 * 
 * @Component: Marca esta classe como um componente Spring gerenciado
 * 
 * @Scheduled: Habilita suporte a tarefas agendadas
 * - Já habilitado na classe principal via @EnableScheduling
 * 
 * NOTA: As tarefas agendadas de backup foram movidas para BackupService.java
 * para implementar a nova política de backup (FULL + INCREMENTAL) com
 * rastreamento de metadados na tabela backup_metadata.
 * 
 * Este arquivo está vazio pois as tarefas agora estão no próprio serviço
 * que implementa a lógica de backup, mantendo melhor coesão e organização.
 */
@Component
public class ScheduledTasks {

    // Tarefas agendadas movidas para BackupService.java
    // - backupFullAgendado(): FULL diário às 01:00
    // - backupIncrementalAgendado(): INCREMENTAL de 3 em 3 horas (08:00, 11:00, 14:00, 17:00, 20:00, 23:00)
}
