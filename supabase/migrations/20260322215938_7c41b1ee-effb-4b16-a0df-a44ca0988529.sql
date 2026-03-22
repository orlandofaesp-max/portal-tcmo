
CREATE OR REPLACE VIEW public.vw_pessoas_resolvidas AS
SELECT
  s.nome AS nome_origem,
  COALESCE(d.pessoa_id_destino, p.id) AS pessoa_id_final
FROM staging_pessoas s
LEFT JOIN de_para_pessoas d
  ON d.nome_origem = s.nome AND d.aprovado = true
LEFT JOIN pessoas p
  ON p.nome = s.nome;
