package br.org.cdlbh.fornecedores.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.Map;

/**
 * AttributeConverter para converter Map<String, Object> em JSON e vice-versa
 * 
 * O JPA não sabe como converter automaticamente um Map<String, Object> para JSON no banco.
 * Esta classe ensina ao JPA como fazer essa conversão para o campo detalhes da entidade Log.
 * 
 * @AttributeConverter: Marca esta classe como um conversor de atributos JPA
 * - autoApply = true: Aplica automaticamente a todos os campos do tipo Map<String, Object>
 * 
 * Por que precisamos disso?
 * - No banco, detalhes é armazenado como JSON: '{"nome": "Maria Silva", "status": "ativo"}'
 * - No Java, representamos como Map<String, Object>: Map.of("nome", "Maria Silva", "status", "ativo")
 * - Este conversor faz a ponte entre os dois formatos
 */
@Converter(autoApply = true)
public class DetalhesLogConverter implements AttributeConverter<Map<String, Object>, String> {

    /**
     * ObjectMapper do Jackson para serializar/deserializar JSON
     * - Jackson é a biblioteca padrão do Spring Boot para JSON
     */
    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Converte Map<String, Object> (Java) para String (JSON no banco)
     * 
     * @param attribute Map de detalhes em Java
     * @return String JSON para armazenar no banco
     */
    @Override
    public String convertToDatabaseColumn(Map<String, Object> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }
        try {
            // Converte o map para JSON string
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            // Se der erro na conversão, lança RuntimeException
            // Isso fará a transação ser revertida (rollback)
            throw new RuntimeException("Erro ao converter map para JSON", e);
        }
    }

    /**
     * Converte String (JSON do banco) para Map<String, Object> (Java)
     * 
     * @param dbData String JSON do banco
     * @return Map de detalhes em Java
     */
    @Override
    public Map<String, Object> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return Map.of();
        }
        try {
            String json = dbData.trim();
            // Se veio serializado como string JSON escapada (ex: "\"{\\\"nome\\\":...}\"")
            if (json.startsWith("\"") && json.endsWith("\"") && json.length() > 2) {
                try {
                    json = objectMapper.readValue(json, String.class);
                } catch (Exception ignored) {
                }
            }
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            // Fallback seguro para evitar erro 500 na listagem de logs
            return Map.of("resumo", dbData);
        }
    }
}
