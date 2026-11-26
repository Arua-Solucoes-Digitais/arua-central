// Migração 5 (26/11/2026, pedido do responsável): o projeto da Pousada Encanto da Mata foi encerrado.
// A demonstração do Aruá Hospedagens passa a ser a página de exemplo com negócio fictício,
// mas só se o administrador não tiver trocado o link pelo painel.
export const migration5 = `
update base_projects
   set demo_url = '/exemplos/pousada',
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
 where slug = 'arua-hospedagens' and demo_url = '/demos/encanto-da-mata/index.html';
`;
