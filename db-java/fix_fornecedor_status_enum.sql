USE cdl_bh_fornecedores_java;

ALTER TABLE fornecedores MODIFY COLUMN status ENUM('ATIVO','INATIVO') NOT NULL DEFAULT 'ATIVO';

UPDATE fornecedores SET status = 'ATIVO';

SELECT id, nome, status FROM fornecedores;
