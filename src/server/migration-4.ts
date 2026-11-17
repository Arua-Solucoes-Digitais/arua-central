// Migração 4 (17/11/2026, aprovada pelo responsável): o Aruá Hospedagens deixa de ter a vitrine fictícia.
// - Apaga "Sítio Recanto do Ipê (demonstração)" (slug demonstracao), criada pela migração 2.
//   Modalidades, fotos e pedidos de teste dela saem em cascata.
// - A demonstração do produto passa a ser o site real da Pousada Encanto da Mata (public/demos),
//   mas só se o administrador não tiver trocado o link pelo painel.
export const migration4 = `
delete from properties where slug = 'demonstracao' and is_demo = 1;
update base_projects
   set demo_url = '/demos/encanto-da-mata/index.html',
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
 where slug = 'arua-hospedagens' and demo_url = '/hospedagens/demonstracao';
`;
