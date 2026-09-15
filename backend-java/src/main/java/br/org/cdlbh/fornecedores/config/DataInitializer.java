package br.org.cdlbh.fornecedores.config;

import br.org.cdlbh.fornecedores.entity.Documento;
import br.org.cdlbh.fornecedores.entity.Fornecedor;
import br.org.cdlbh.fornecedores.entity.Projeto;
import br.org.cdlbh.fornecedores.entity.Usuario;
import br.org.cdlbh.fornecedores.repository.DocumentoRepository;
import br.org.cdlbh.fornecedores.repository.FornecedorRepository;
import br.org.cdlbh.fornecedores.repository.ProjetoRepository;
import br.org.cdlbh.fornecedores.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

/**
 * Inicializa dados automáticos no banco em memória H2 quando o perfil 'local' estiver ativo.
 */
@Component
@Profile("local")
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private ProjetoRepository projetoRepository;

    @Autowired
    private FornecedorRepository fornecedorRepository;

    @Autowired
    private DocumentoRepository documentoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        System.out.println("============================================================");
        System.out.println("🚀 [MODO TESTE LOCAL] Inicializando dados no banco H2...");
        System.out.println("============================================================");

        // 1. Criar Usuários padrão
        if (usuarioRepository.count() == 0) {
            Usuario admin = new Usuario();
            admin.setNome("Administrador CDL BH");
            admin.setEmail("admin@cdlbh.org.br");
            admin.setSenhaHash(passwordEncoder.encode("admin123"));
            admin.setRole(Usuario.Role.admin);
            usuarioRepository.save(admin);

            Usuario user = new Usuario();
            user.setNome("Colaborador CDL BH");
            user.setEmail("user@cdlbh.org.br");
            user.setSenhaHash(passwordEncoder.encode("user123"));
            user.setRole(Usuario.Role.user);
            usuarioRepository.save(user);

            System.out.println("✅ Usuários criados: admin@cdlbh.org.br / admin123 | user@cdlbh.org.br / user123");
        }

        // 2. Criar Projetos
        if (projetoRepository.count() == 0) {
            List<String> projetos = List.of(
                "Projeto Afeto", "Afeto Empreendedorismo", "Alimentando Vidas",
                "Brincadeira é Coisa Séria", "Brinquedoteca Itinerante", "Despertar Empreendedor",
                "Liderança Jovem", "Natal de Todo Mundo", "Programa Educação e Trabalho (PET)",
                "Protagonizar en Cena", "Sorridente", "Ver é Bom Demais", "Outro"
            );

            for (String nomeProj : projetos) {
                Projeto p = new Projeto();
                p.setNome(nomeProj);
                p.setDescricao("Iniciativa social da Fundação CDL-BH");
                projetoRepository.save(p);
            }
            System.out.println("✅ 13 projetos oficiais cadastrados.");
        }

        // 3. Criar Fornecedores e Documentos de Teste
        if (fornecedorRepository.count() == 0) {
            Projeto projAfeto = projetoRepository.findByNome("Projeto Afeto").orElse(null);
            Projeto projSorridente = projetoRepository.findByNome("Sorridente").orElse(null);

            Fornecedor f1 = new Fornecedor();
            f1.setNome("Maria Silva");
            f1.setEmpresaPf("Distribuidora Silva LTDA");
            f1.setCnpj("12.345.678/0001-90");
            f1.setEmail("maria@silva.com");
            f1.setTelefone("(31) 99999-1111");
            f1.setPalavraChave("fraldas, higiene");
            f1.setProjeto(projAfeto);
            f1.setPermissaoPara(List.of("Fornecer materiais", "Doação de produtos"));
            f1.setStatus(Fornecedor.Status.ativo);
            f1.setObservacao("Fornecedora parceira de longa data.");
            f1 = fornecedorRepository.save(f1);

            Fornecedor f2 = new Fornecedor();
            f2.setNome("João Costa");
            f2.setEmpresaPf("JC Transportes ME");
            f2.setCnpj("98.765.432/0001-10");
            f2.setEmail("joao@jctransportes.com");
            f2.setTelefone("(31) 98888-2222");
            f2.setPalavraChave("transporte, logística");
            f2.setProjeto(projSorridente);
            f2.setPermissaoPara(List.of("Transporte e logística"));
            f2.setStatus(Fornecedor.Status.ativo);
            f2 = fornecedorRepository.save(f2);

            // Documentos
            Documento d1 = new Documento();
            d1.setFornecedor(f1);
            d1.setNome("Contrato de Prestação de Serviços 2026");
            d1.setTipo(Documento.Tipo.Contrato);
            d1.setDataVencimento(LocalDate.now().plusDays(15));
            d1.setArquivoUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
            documentoRepository.save(d1);

            Documento d2 = new Documento();
            d2.setFornecedor(f2);
            d2.setNome("Alvará Municipal de Transporte");
            d2.setTipo(Documento.Tipo.Alvará);
            d2.setDataVencimento(LocalDate.now().minusDays(5)); // Vencido
            d2.setArquivoUrl("https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf");
            documentoRepository.save(d2);

            System.out.println("✅ Fornecedores e documentos de exemplo inseridos com sucesso.");
        }

        System.out.println("============================================================");
        System.out.println("✅ [MODO TESTE LOCAL] Pronto! Acesse http://localhost:8080");
        System.out.println("============================================================");
    }
}
