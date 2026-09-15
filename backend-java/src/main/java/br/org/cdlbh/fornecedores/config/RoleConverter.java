package br.org.cdlbh.fornecedores.config;

import br.org.cdlbh.fornecedores.entity.Usuario.Role;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Converte o enum Role do usuário para string e vice-versa de forma tolerante a maiúsculas/minúsculas.
 * Permite compatibilidade perfeita tanto com 'ADMIN'/'USER' quanto 'admin'/'user' no banco.
 */
@Converter(autoApply = true)
public class RoleConverter implements AttributeConverter<Role, String> {

    @Override
    public String convertToDatabaseColumn(Role role) {
        if (role == null) {
            return Role.user.name();
        }
        return role.name();
    }

    @Override
    public Role convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return Role.user;
        }
        String normalized = dbData.trim().toLowerCase();
        if ("admin".equals(normalized)) {
            return Role.admin;
        }
        return Role.user;
    }
}
