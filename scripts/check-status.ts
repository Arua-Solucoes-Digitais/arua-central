// Verifica se os sistemas hospedados estão respondendo: npm run status
// No servidor, rode a cada 5 minutos pelo cron, assim a página /status fica atualizada:
//   */5 * * * * cd /caminho/do/site && npm run status >> data/status.log 2>&1
import { closeDb } from "../src/server/db.ts";
import { checkDeployments } from "../src/server/deployments.ts";

const results = await checkDeployments();
closeDb();

if (results.length === 0) {
  console.log("Nenhum sistema ativo para verificar. Cadastre em Área restrita → Sistemas no ar.");
}
for (const r of results) {
  const label = `${r.title} (${r.environment})`;
  console.log(
    r.ok
      ? `NO AR       ${label}: ${r.http_status} em ${r.latency_ms} ms`
      : `FORA DO AR  ${label}: ${r.error ?? "sem detalhe"}`,
  );
}
// Código de saída 1 quando algum sistema está fora, para o cron ou um alerta poder avisar.
process.exitCode = results.some((r) => !r.ok) ? 1 : 0;
