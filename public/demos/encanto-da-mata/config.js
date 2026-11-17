/* Configuração compartilhada por index.html e painel.html.
 *
 * Preencha com os dados do projeto no Supabase (Project Settings → API).
 * Use SOMENTE a chave "anon / public". NUNCA coloque aqui a chave service_role
 * nem senhas: este arquivo é público, qualquer visitante consegue lê-lo.
 * A senha do painel fica cadastrada apenas dentro do Supabase.
 */
window.EM_CONFIG = {
  supabaseUrl: '',        // ex.: https://abcdefgh.supabase.co
  supabaseAnonKey: '',    // chave anon/public
  // O painel pede "usuário" e senha. O usuário vira o e-mail  usuario@dominioLogin  no Supabase.
  // Ex.: usuário HJAMAL  ->  hjamal@painel.encantodamata.app
  dominioLogin: 'painel.encantodamata.app',
};
