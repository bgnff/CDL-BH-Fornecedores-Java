USE cdl_bh_fornecedores_java;

ALTER TABLE usuarios MODIFY COLUMN role ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER';

UPDATE usuarios SET role = 'ADMIN';

SELECT id, email, nome, role FROM usuarios;
