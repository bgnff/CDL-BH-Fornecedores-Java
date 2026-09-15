package br.org.cdlbh.fornecedores.config;

import br.org.cdlbh.fornecedores.entity.Fornecedor.Status;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Converte o enum Status do fornecedor para string e vice-versa de forma case-insensitive.
 * Suporta 'ativo'/'inativo' e 'ATIVO'/'INATIVO' no banco sem erros de serialização.
 */
@Converter(autoApply = true)
public class StatusConverter implements AttributeConverter<Status, String> {

    @Override
    public String convertToDatabaseColumn(Status status) {
        if (status == null) {
            return Status.ativo.name();
        }
        return status.name();
    }

    @Override
    public Status convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return Status.ativo;
        }
        String normalized = dbData.trim().toLowerCase();
        if ("inativo".equals(normalized)) {
            return Status.inativo;
        }
        return Status.ativo;
    }
}
