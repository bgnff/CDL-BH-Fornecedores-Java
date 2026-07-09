-- Criar usuário Brayan@email.com com senha brayan5784
-- Hash bcrypt gerado com BCryptPasswordEncoder força 10
INSERT INTO usuarios (nome, email, senha_hash, role) VALUES
('Brayan', 'Brayan@email.com', '$2a$10$T3cEcjpfDebFNCB2BdwzYe1m6HC3Ce2NlEdIgMbr3JfLfjGhGTn8e', 'admin');
