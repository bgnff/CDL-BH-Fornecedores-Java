package br.org.cdlbh.fornecedores.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

import java.util.List;

/**
 * AttributeConverter para converter List<String> em JSON e vice-versa
 * 
 * O JPA não sabe como converter automaticamente um List<String> para JSON no banco.
 * Esta classe ensina ao JPA como fazer essa conversão.
 * 
 * @AttributeConverter: Marca esta classe como um conversor de atributos JPA
 * - autoApply = true: Aplica automaticamente a todos os campos do tipo List<String>
 * 
 * Por que precisamos disso?
 * - No banco, permissao_para é armazenado como JSON: '["Fornecer materiais", "Doação de produtos"]'
 * - No Java, representamos como List<String>: List.of("Fornecer materiais", "Doação de produtos")
 * - Este conversor faz a ponte entre os dois formatos
 */
@Converter(autoApply = true)
public class PermissaoParaConverter implements AttributeConverter<List<String>, String> {

    /**
     * ObjectMapper do Jackson para serializar/deserializar JSON
     * - Jackson é a biblioteca padrão do Spring Boot para JSON
     */
    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Converte List<String> (Java) para String (JSON no banco)
     * 
     * @param attribute Lista de permissões em Java
     * @return String JSON para armazenar no banco
     */
    @Override
    public String convertToDatabaseColumn(List<String> attribute) {
        if (attribute == null || attribute.isEmpty()) {
            return null;
        }
        try {
            // Converte a lista para JSON string
            return objectMapper.writeValueAsString(attribute);
        } catch (JsonProcessingException e) {
            // Se der erro na conversão, lança RuntimeException
            // Isso fará a transação ser revertida (rollback)
            throw new RuntimeException("Erro ao converter lista para JSON", e);
        }
    }

    /**
     * Converte String (JSON do banco) para List<String> (Java)
     * 
     * @param dbData String JSON do banco
     * @return Lista de permissões em Java
     */
    @Override
    public List<String> convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return List.of();
        }
        try {
            // Converte a string JSON de volta para List<String>
            // TypeReference é necessário porque o Jackson precisa saber o tipo genérico
            return objectMapper.readValue(dbData, new TypeReference<List<String>>() {});
        } catch (JsonProcessingException e) {
            // Se der erro na conversão, lança RuntimeException
            throw new RuntimeException("Erro ao converter JSON para lista", e);
        }
    }
}
