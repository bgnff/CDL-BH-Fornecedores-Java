package br.org.cdlbh.fornecedores.service;

import br.org.cdlbh.fornecedores.dto.BackupInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * Service de backup do banco de dados
 * 
 * Responsável por gerar e gerenciar backups usando mysqldump
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

    /**
     * Gera um backup do banco de dados usando mysqldump
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
            // ProcessBuilder é mais seguro que Runtime.exec() porque separa argumentos
            // Isso previne command injection pois não concatenamos strings
            ProcessBuilder processBuilder = new ProcessBuilder(
                    mysqldumpPath,
                    "-h", sanitizedHost,
                    "-P", sanitizedPort,
                    "-u", sanitizedUser,
                    "-p" + dbPassword, // Senha via argumento (alternativa: variável de ambiente MYSQL_PWD)
                    sanitizedName
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
                throw new RuntimeException("Erro ao gerar backup: " + error.toString());
            }

            return filename;

        } catch (IOException | InterruptedException e) {
            throw new RuntimeException("Erro ao gerar backup: " + e.getMessage(), e);
        }
    }

    /**
     * Lista todos os arquivos de backup existentes
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
            // Lista todos os arquivos .sql no diretório
            Files.list(backupDir)
                    .filter(path -> path.toString().endsWith(".sql"))
                    .forEach(path -> {
                        try {
                            BackupInfo info = new BackupInfo();
                            info.setFilename(path.getFileName().toString());
                            info.setSize(Files.size(path));
                            info.setCreated(LocalDateTime.ofInstant(Instant.ofEpochMilli(Files.getLastModifiedTime(path).toMillis()), ZoneId.systemDefault()));
                            backups.add(info);
                        } catch (IOException e) {
                            // Ignora arquivos que não conseguimos ler
                        }
                    });

            // Ordena por data de criação (mais recentes primeiro)
            backups.sort((a, b) -> b.getCreated().compareTo(a.getCreated()));

        } catch (IOException e) {
            // Se der erro ao listar, retorna lista vazia
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
     * Formato esperado: backup_YYYY-MM-DDTHH-MM-SS-SSSZ.sql
     * Exemplo: backup_2024-01-15T10-30-00-000.sql
     * 
     * @param filename Nome do arquivo
     * @return true se válido, false caso contrário
     */
    private boolean isValidFilename(String filename) {
        // Regex que valida o formato do nome do arquivo
        // ^backup_: começa com "backup_"
        // \\d{4}-\\d{2}-\\d{2}: data no formato YYYY-MM-DD
        // T: separador
        // \\d{2}-\\d{2}-\\d{2}-\\d{3}: hora no formato HH-MM-SS-SSS
        // \\.sql$: termina com ".sql"
        Pattern pattern = Pattern.compile("^backup_\\d{4}-\\d{2}-\\d{2}T\\d{2}-\\d{2}-\\d{2}-\\d{3}Z\\.sql$");
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
