-- Função do gatilho "ensure_rls" (veio com o projeto): ninguém precisa chamá-la pela API.
-- O gatilho continua ligando o RLS nas tabelas novas. Condicional para valer em bancos sem ela.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end
$$;
