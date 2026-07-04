USE cdl_bh_fornecedores_java;

UPDATE usuarios SET role = 'ADMIN';

SELECT id, email, nome, role FROM usuarios;
