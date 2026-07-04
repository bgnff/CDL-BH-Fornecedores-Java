package br.org.cdlbh.fornecedores.config;

import br.org.cdlbh.fornecedores.service.BackupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Configuração de tarefas agendadas (scheduled tasks)
 * 
 * @Component: Marca esta classe como um componente Spring gerenciado
 * 
 * @Scheduled: Habilita suporte a tarefas agendadas
 * - Já habilitado na classe principal via @EnableScheduling
 * 
 * Este arquivo contém tarefas que rodam automaticamente em intervalos regulares
 * Equivalente ao node-cron do backend Node.js
 */
@Component
public class ScheduledTasks {

    @Autowired
    private BackupService backupService;

    /**
     * Tarefa agendada para gerar backup automático a cada hora
     * 
     * @Scheduled: Define quando a tarefa deve rodar
     * - cron = "0 0 * * * *": Expressão cron que define o agendamento
     * 
     * Expressão cron Spring (6 campos): segundo minuto hora dia mês dia-da-semana
     * - "0 0 * * * *": 
     *   - Segundo: 0 (no segundo 0)
     *   - Minuto: 0 (no minuto 0)
     *   - Hora: * (todas as horas)
     *   - Dia do mês: * (todos os dias)
     *   - Mês: * (todos os meses)
     *   - Dia da semana: * (todos os dias da semana)
     * 
     * Resultado: Roda no início de cada hora (00:00, 01:00, 02:00, etc.)
     * 
     * Equivalente ao node-cron: cron.schedule('0 * * * *', ...)
     * - Node.js usa 5 campos (minuto hora dia mês dia-da-semana)
     * - Spring usa 6 campos (inclui segundo)
     * 
     * Por que usar @Scheduled em vez de cron externo?
     * - Roda dentro da aplicação Java (não depende do sistema operacional)
     * - Fácil de configurar via código
     * - Funciona da mesma forma em Windows, Linux, Mac
     * - Pode ser desabilitado via configuração se necessário
     */
    @Scheduled(cron = "0 0 * * * *")
    public void gerarBackupAutomatico() {
        try {
            System.out.println("Iniciando backup automático...");
            String filename = backupService.gerarBackup();
            System.out.println("✅ Backup automático gerado: " + filename);
        } catch (Exception e) {
            // Se o backup falhar, logamos o erro mas não interrompemos a aplicação
            // A tarefa vai tentar novamente na próxima hora
            System.err.println("❌ Erro no backup automático: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
