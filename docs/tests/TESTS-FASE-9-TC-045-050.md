# Testes Manuais — FASE 9 (TC-045..TC-050)

TC-045 — Página pública avançada carrega informações do profissional
- Abra `/agenda/:profissionalId`; verifique nome, profissão e lista de serviços.

TC-046 — Link para `/agendar/:profissionalId` funciona
- Na página pública, clique em agendar e confirme que redireciona para o fluxo de agendamento público.

TC-047 — Informações públicas não expõem dados sensíveis
- Verifique que a página pública não exibe `webhookUrl`, `proprietarioUid`, ou outros campos sensíveis.

TC-048 — SEO básico (meta tags)
- Verificar que `pagina-publica.html` inclui meta tags `title` e `description` baseadas no perfil do profissional (to be improved).

TC-049 — Performance: carregar apenas dados necessários
- Confirmar que a página carrega apenas o documento `empresas/{id}` e não subcollections desnecessárias.

TC-050 — Link público permanece acessível sem autenticação
- Acessar a página sem estar autenticado; conteúdo deve ser visível (read-only).

***
