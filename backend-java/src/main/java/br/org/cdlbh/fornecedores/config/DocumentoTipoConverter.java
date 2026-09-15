package br.org.cdlbh.fornecedores.config;

import br.org.cdlbh.fornecedores.entity.Documento.Tipo;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * Converte o tipo de documento entre a representação Java e banco de dados.
 * Mapeia com segurança variações como "Nota Fiscal" (com espaço) para Tipo.Nota_Fiscal.
 */
@Converter(autoApply = true)
public class DocumentoTipoConverter implements AttributeConverter<Tipo, String> {

    @Override
    public String convertToDatabaseColumn(Tipo tipo) {
        if (tipo == null) {
            return "Outro";
        }
        if (tipo == Tipo.Nota_Fiscal) {
            return "Nota Fiscal";
        }
        return tipo.name();
    }

    @Override
    public Tipo convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.trim().isEmpty()) {
            return Tipo.Outro;
        }
        String clean = dbData.trim();
        if ("Nota Fiscal".equalsIgnoreCase(clean) || "Nota_Fiscal".equalsIgnoreCase(clean)) {
            return Tipo.Nota_Fiscal;
        }
        if ("Contrato".equalsIgnoreCase(clean)) {
            return Tipo.Contrato;
        }
        if ("Certidão".equalsIgnoreCase(clean) || "Certidao".equalsIgnoreCase(clean)) {
            return Tipo.Certidão;
        }
        if ("Alvará".equalsIgnoreCase(clean) || "Alvara".equalsIgnoreCase(clean)) {
            return Tipo.Alvará;
        }
        return Tipo.Outro;
    }
}
