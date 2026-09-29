package br.org.cdlbh.fornecedores.service;

import br.org.cdlbh.fornecedores.dto.BackupInfo;
import br.org.cdlbh.fornecedores.entity.BackupMetadata;
import br.org.cdlbh.fornecedores.repository.BackupMetadataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Pattern;

/**
 * Service de backup do banco de dados
 * 
 * Responsável por gerar e gerenciar backups usando mysqldump (FULL)
 * e mysqlbinlog (INCREMENTAL)
 * 
 * POLÍTICA DE BACKUP:
 * - FULL: Todos os dias às 01:00 da manhã
 * - INCREMENTAL: De 3 em 3 horas (08:00, 11:00, 14:00, 17:00, 20:00, 23:00)
 */
@Service
public class BackupService {

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUser;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Value("${backup.directory:../backups}")
    private String backupDirectory;

    @Value("${mysql.mysqldump-path:mysqldump}")
    private String mysqldumpPath;

    @Value("${mysql.mysqlbinlog-path:mysqlbinlog}")
    private String mysqlbinlogPath;

    @Autowired
    private DataSource dataSource;

    @Autowired
    private BackupMetadataRepository backupMetadataRepository;

    /**
     * Gera um backup FULL do banco de dados usando mysqldump
     * 
     * Este método é chamado manualmente via endpoint ou pelo job agendado
     * 
     * @return Nome do arquivo de backup gerado
     * @throws RuntimeException se houver erro ao gerar o backup
     */
    public String gerarBackup() {
        try {
            // Extrai o nome do banco da URL JDBC
            // URL formato: jdbc:mysql://host:port/database
            String dbName = extrairNomeBanco(dbUrl);
            String dbHost = extrairHost(dbUrl);
            String dbPort = extrairPort(dbUrl);

            // Cria o diretório de backups se não existir
            Path backupDir = Paths.get(backupDirectory);
            if (!Files.exists(backupDir)) {
                Files.createDirectories(backupDir);
            }

            // Gera o nome do arquivo com timestamp
            // Formato: backup_2024-01-15T10-30-00-000.sql
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME).replace(":", "-").replace(".", "-");
            String filename = "backup_" + timestamp + ".sql";
            Path filepath = backupDir.resolve(filename);

            // Sanitização para prevenir command injection
            // Removemos caracteres que poderiam ser usados para injetar comandos
            String sanitizedHost = sanitizarString(dbHost);
            String sanitizedPort = sanitizarString(dbPort);
            String sanitizedUser = sanitizarString(dbUser);
            String sanitizedName = sanitizarString(dbName);

            // Executa o mysqldump usando ProcessBuilder
            // A senha é passada via variável de ambiente MYSQL_PWD para não vazar na lista de processos do SO (ps/Process Explorer)
            ProcessBuilder processBuilder = new ProcessBuilder(
                    mysqldumpPath,
                    "-h", sanitizedHost,
                    "-P", sanitizedPort,
                    "-u", sanitizedUser,
                    sanitizedName
            );

            if (dbPassword != null && !dbPassword.isEmpty()) {
                processBuilder.environment().put("MYSQL_PWD", dbPassword);
            }

            // Redireciona a saída para o arquivo
            processBuilder.redirectOutput(filepath.toFile());

            // Executa o processo
            Process process = processBuilder.start();

            // Aguarda o processo terminar
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                // Lê o erro se houver
                BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
                StringBuilder error = new StringBuilder();
                String line;
                while ((line = errorReader.readLine()) != null) {
                    error.append(line).append("\n");
                }
                throw new RuntimeException("Erro ao gerar backup: " + error.toString());
            }

            return filename;

        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Erro ao gerar backup: " + e.getMessage(), e);
        }
    }

    /**
     * Job agendado para backup FULL - executa todos os dias às 01:00 da manhã
     * 
     * @Scheduled: Indica que este método deve ser executado automaticamente
     * cron = "0 0 1 * * *": Segundos Minutos Hora DiaDoMes Mes DiaDaSemana
     * - 0: Segundos = 0
     * - 0: Minutos = 0
     * - 1: Hora = 1 (01:00 da manhã)
     * - *: Dia do mês = todos os dias
     * - *: Mês = todos os meses
     * - *: Dia da semana = todos os dias da semana
     * 
     * Este job:
     * 1. Executa mysqldump para gerar backup completo
     * 2. Captura o binlog_file e binlog_position atual via SHOW MASTER STATUS
     * 3. Salva metadados na tabela backup_metadata
     */
    @Scheduled(cron = "0 0 1 * * *")
    @Transactional
    public void backupFullAgendado() {
        try {
            // Gera o backup FULL
            String filename = gerarBackup();
            
            // Captura o binlog_file e binlog_position atual
            // Isso é necessário para que o próximo incremental saiba de onde começar
            BinlogInfo binlogInfo = capturarBinlogStatus();
            
            // Salva metadados do backup
            BackupMetadata metadata = new BackupMetadata();
            metadata.setTipo(BackupMetadata.Tipo.FULL);
            metadata.setArquivo(filename);
            metadata.setBinlogFile(binlogInfo.file);
            metadata.setBinlogPosition(binlogInfo.position);
            
            backupMetadataRepository.save(metadata);
            
            System.out.println("Backup FULL gerado com sucesso: " + filename);
            
        } catch (Exception e) {
            System.err.println("Erro ao gerar backup FULL agendado: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Job agendado para backup INCREMENTAL - executa de 3 em 3 horas
     * Horários: 08:00, 11:00, 14:00, 17:00, 20:00, 23:00
     * 
     * @Scheduled: Indica que este método deve ser executado automaticamente
     * cron = "0 0 8,11,14,17,20,23 * * *": Segundos Minutos Hora DiaDoMes Mes DiaDaSemana
     * - 0: Segundos = 0
     * - 0: Minutos = 0
     * - 8,11,14,17,20,23: Horas = 08:00, 11:00, 14:00, 17:00, 20:00, 23:00
     * - *: Dia do mês = todos os dias
     * - *: Mês = todos os meses
     * - *: Dia da semana = todos os dias da semana
     * 
     * Este job:
     * 1. Busca o último backup (FULL ou INCREMENTAL) para saber de onde começar
     * 2. Executa mysqlbinlog para exportar apenas as mudanças desde o último backup
     * 3. Captura o novo binlog_file e binlog_position
     * 4. Salva metadados na tabela backup_metadata
     */
    @Scheduled(cron = "0 0 8,11,14,17,20,23 * * *")
    @Transactional
    public void backupIncrementalAgendado() {
        try {
            // Busca o último backup executado
            Optional<BackupMetadata> ultimoBackupOpt = backupMetadataRepository.findFirstByOrderByExecutadoEmDesc();
            
            if (ultimoBackupOpt.isEmpty()) {
                System.err.println("Não há backup anterior para gerar incremental. Execute um backup FULL primeiro.");
                return;
            }
            
            BackupMetadata ultimoBackup = ultimoBackupOpt.get();
            
            // Gera o backup INCREMENTAL usando mysqlbinlog
            String filename = gerarBackupIncremental(ultimoBackup);
            
            // Captura o novo binlog_file e binlog_position
            BinlogInfo binlogInfo = capturarBinlogStatus();
            
            // Salva metadados do backup
            BackupMetadata metadata = new BackupMetadata();
            metadata.setTipo(BackupMetadata.Tipo.INCREMENTAL);
            metadata.setArquivo(filename);
            metadata.setBinlogFile(binlogInfo.file);
            metadata.setBinlogPosition(binlogInfo.position);
            
            backupMetadataRepository.save(metadata);
            
            System.out.println("Backup INCREMENTAL gerado com sucesso: " + filename);
            
        } catch (Exception e) {
            System.err.println("Erro ao gerar backup INCREMENTAL agendado: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Gera um backup INCREMENTAL usando mysqlbinlog
     * 
     * mysqlbinlog é uma ferramenta que extrai eventos do binary log (binlog)
     * O binlog registra todas as alterações (INSERT/UPDATE/DELETE/DDL) no banco
     * 
     * @param ultimoBackup O último backup executado (ponto de partida)
     * @return Nome do arquivo de backup incremental gerado
     * @throws RuntimeException se houver erro ao gerar o backup
     */
    private String gerarBackupIncremental(BackupMetadata ultimoBackup) {
        try {
            // Cria o diretório de backups se não existir
            Path backupDir = Paths.get(backupDirectory);
            if (!Files.exists(backupDir)) {
                Files.createDirectories(backupDir);
            }

            // Gera o nome do arquivo com timestamp
            // Formato: incremental_2024-01-15T10-30-00-000.sql
            String timestamp = LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME).replace(":", "-").replace(".", "-");
            String filename = "incremental_" + timestamp + ".sql";
            Path filepath = backupDir.resolve(filename);

            // Sanitização do binlog_file para prevenir command injection
            String sanitizedBinlogFile = sanitizarString(ultimoBackup.getBinlogFile());
            
            // Executa mysqlbinlog usando ProcessBuilder
            // --start-position: Começa a partir da posição especificada
            // Isso captura apenas as mudanças desde o último backup
            ProcessBuilder processBuilder = new ProcessBuilder(
                    mysqlbinlogPath,
                    "--start-position=" + ultimoBackup.getBinlogPosition(),
                    sanitizedBinlogFile
            );

            // Redireciona a saída para o arquivo
            processBuilder.redirectOutput(filepath.toFile());

            // Executa o processo
            Process process = processBuilder.start();

            // Aguarda o processo terminar
            int exitCode = process.waitFor();

            if (exitCode != 0) {
                // Lê o erro se houver
                BufferedReader errorReader = new BufferedReader(new InputStreamReader(process.getErrorStream()));
                StringBuilder error = new StringBuilder();
                String line;
                while ((line = errorReader.readLine()) != null) {
                    error.append(line).append("\n");
                }
                throw new RuntimeException("Erro ao gerar backup incremental: " + error.toString());
            }

            return filename;

        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Erro ao gerar backup incremental: " + e.getMessage(), e);
        }
    }

    /**
     * Captura o status atual do binary log (binlog)
     * 
     * Executa o comando SQL "SHOW MASTER STATUS" para obter:
     * - File: Nome do arquivo de binlog atual (ex: mysql-bin.000123)
     * - Position: Posição atual dentro do binlog
     * 
     * Essas informações são necessárias para saber de onde o próximo
     * backup incremental deve começar
     * 
     * @return BinlogInfo com file e position
     * @throws RuntimeException se houver erro ao capturar o status
     */
    private BinlogInfo capturarBinlogStatus() {
        try (Connection connection = dataSource.getConnection();
             Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery("SHOW MASTER STATUS")) {
            
            if (resultSet.next()) {
                String file = resultSet.getString("File");
                long position = resultSet.getLong("Position");
                return new BinlogInfo(file, position);
            } else {
                throw new RuntimeException("Não foi possível obter o status do binlog. Verifique se o binary log está habilitado no MySQL.");
            }
            
        } catch (Exception e) {
            throw new RuntimeException("Erro ao capturar status do binlog: " + e.getMessage(), e);
        }
    }

    /**
     * Classe auxiliar para armazenar informações do binlog
     */
    private static class BinlogInfo {
        String file;
        long position;
        
        BinlogInfo(String file, long position) {
            this.file = file;
            this.position = position;
        }
    }

    /**
     * Lista todos os arquivos de backup existentes
     * 
     * Este método agora inclui informações do tipo de backup (FULL/INCREMENTAL)
     * consultando a tabela backup_metadata
     * 
     * @return Lista de informações dos backups
     */
    public List<BackupInfo> listarBackups() {
        List<BackupInfo> backups = new ArrayList<>();
        Path backupDir = Paths.get(backupDirectory);

        if (!Files.exists(backupDir)) {
            return backups;
        }

        try {
            // Busca todos os metadados de backups do banco
            List<BackupMetadata> metadados = backupMetadataRepository.findAll();
            
            // Cria um mapa de arquivo -> tipo para busca rápida
            java.util.Map<String, BackupMetadata.Tipo> arquivoParaTipo = new java.util.HashMap<>();
            for (BackupMetadata meta : metadados) {
                arquivoParaTipo.put(meta.getArquivo(), meta.getTipo());
            }

            // Lista todos os arquivos .sql no diretório
            Files.list(backupDir)
                    .filter(path -> path.toString().endsWith(".sql"))
                    .forEach(path -> {
                        try {
                            BackupInfo info = new BackupInfo();
                            info.setFilename(path.getFileName().toString());
                            info.setSize(Files.size(path));
                            info.setCreated(LocalDateTime.ofInstant(Instant.ofEpochMilli(Files.getLastModifiedTime(path).toMillis()), ZoneId.systemDefault()));
                            
                            // Define o tipo do backup se existir nos metadados
                            BackupMetadata.Tipo tipo = arquivoParaTipo.get(path.getFileName().toString());
                            if (tipo != null) {
                                info.setTipo(tipo.name());
                            } else {
                                // Se não estiver nos metadados, tenta inferir pelo nome do arquivo
                                if (path.getFileName().toString().startsWith("incremental_")) {
                                    info.setTipo("INCREMENTAL");
                                } else {
                                    info.setTipo("FULL");
                                }
                            }
                            
                            backups.add(info);
                        } catch (Exception e) {
                            // Ignora erros ao ler metadados de arquivo individual
                            System.err.println("Erro ao ler metadados do arquivo " + path.getFileName() + ": " + e.getMessage());
                        }
                    });
        } catch (Exception e) {
            // Se houver erro ao listar backups, retorna lista vazia
            System.err.println("Erro ao listar backups: " + e.getMessage());
            e.printStackTrace();
        }

        return backups;
    }

    /**
     * Obtém o caminho completo de um arquivo de backup
     * 
     * @param filename Nome do arquivo
     * @return Path do arquivo
     * @throws RuntimeException se o nome for inválido ou arquivo não existir
     */
    public Path getBackupPath(String filename) {
        // Validação de filename para prevenir path traversal
        // Path traversal: sem essa validação, alguém poderia pedir filename=../../../etc/passwd
        // e ler arquivos fora da pasta de backups
        if (!isValidFilename(filename)) {
            throw new RuntimeException("Nome de arquivo inválido.");
        }

        Path backupDir = Paths.get(backupDirectory).toAbsolutePath();
        Path filepath = backupDir.resolve(filename).toAbsolutePath();

        // Verificação adicional: garante que o arquivo está dentro do diretório de backups
        if (!filepath.startsWith(backupDir)) {
            throw new RuntimeException("Acesso negado.");
        }

        if (!Files.exists(filepath)) {
            throw new RuntimeException("Arquivo não encontrado.");
        }

        return filepath;
    }

    /**
     * Valida se o nome do arquivo está no formato correto
     * 
     * Formato esperado para FULL: backup_YYYY-MM-DDTHH-MM-SS-SSSZ.sql
     * Exemplo: backup_2024-01-15T10-30-00-000.sql
     * 
     * Formato esperado para INCREMENTAL: incremental_YYYY-MM-DDTHH-MM-SS-SSSZ.sql
     * Exemplo: incremental_2024-01-15T10-30-00-000.sql
     * 
     * @param filename Nome do arquivo
     * @return true se válido, false caso contrário
     */
    private boolean isValidFilename(String filename) {
        if (filename == null || filename.contains("/") || filename.contains("\\") || filename.contains("..")) {
            return false;
        }
        // Regex que valida o formato do nome do arquivo (aceita FULL e INCREMENTAL)
        Pattern pattern = Pattern.compile("^(backup_|incremental_)\\d{4}-\\d{2}-\\d{2}T\\d{2}-\\d{2}-\\d{2}(-\\d+)?(Z)?\\.sql$");
        return pattern.matcher(filename).matches();
    }

    /**
     * Extrai o nome do banco da URL JDBC
     */
    private String extrairNomeBanco(String url) {
        // jdbc:mysql://host:port/database
        int lastSlash = url.lastIndexOf('/');
        if (lastSlash == -1) return "";
        return url.substring(lastSlash + 1);
    }

    /**
     * Extrai o host da URL JDBC
     */
    private String extrairHost(String url) {
        // jdbc:mysql://host:port/database
        int start = url.indexOf("://") + 3;
        int end = url.indexOf(':', start);
        if (end == -1) end = url.indexOf('/', start);
        return url.substring(start, end);
    }

    /**
     * Extrai a porta da URL JDBC
     */
    private String extrairPort(String url) {
        // jdbc:mysql://host:port/database
        int start = url.indexOf(':', url.indexOf("://") + 3) + 1;
        int end = url.indexOf('/', start);
        if (end == -1) return "3306"; // Porta padrão do MySQL
        return url.substring(start, end);
    }

    /**
     * Sanitiza uma string removendo caracteres perigosos
     * 
     * Por que sanitizar?
     * - Mesmo usando ProcessBuilder com argumentos separados, é boa prática sanitizar
     * - Remove caracteres que poderiam ser usados para injection
     * - Defesa em profundidade (defense in depth)
     */
    private String sanitizarString(String input) {
        if (input == null) return "";
        // Remove caracteres que não são alfanuméricos, ponto, hífen ou underscore
        return input.replaceAll("[^a-zA-Z0-9._-]", "");
    }
}
