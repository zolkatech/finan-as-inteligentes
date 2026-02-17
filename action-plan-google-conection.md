
## Plano de Ação: Persistência e Renovação de Tokens Google

### 1. Banco de Dados (Supabase)
Precisamos de uma tabela dedicada para armazenar as credenciais de forma segura.
* **Nome da Tabela:** `google_integrations`
* **Colunas:**
    * `user_id` (UUID, FK para auth.users, Primary Key)
    * `access_token` (Text, armazena o token temporário)
    * `refresh_token` (Text, armazena o token permanente - CRÍTICO)
    * `expires_at` (BigInt ou Timestamp, indica quando o access_token vence)
    * `scope` (Text, escopos permitidos)
    * `updated_at` (Timestamp)
* **Segurança (RLS):** Habilitar RLS para que o usuário só possa ler/escrever seus próprios tokens. O "Service Role" (backend) deve ter acesso total.

### 2. Fluxo de Autenticação (Frontend/OAuth)
A conexão inicial precisa ser ajustado para garantir o recebimento do `refresh_token`.
* **Parâmetro `access_type`:** Deve ser definido explicitamente como `offline`.
* **Parâmetro `prompt`:** Deve ser definido como `consent` para forçar a geração do refresh token na primeira conexão (o Google não envia refresh token em re-autenticações automáticas).
* **Ação pós-callback:** Ao receber o código do Google, o backend deve trocar pelo token e salvar **ambos** (`access_token` e `refresh_token`) na tabela `google_integrations`.

### 3. Backend (Edge Function / Service)
Criar uma função reutilizável chamada `getValidGoogleToken(userId)`.
A lógica deve ser:
1.  Buscar o registro do usuário na tabela `google_integrations`.
2.  Verificar se o `access_token` atual expirou (comparar `expires_at` com `Date.now()`).
    * **Cenário A (Token Válido):** Retornar o `access_token` existente.
    * **Cenário B (Token Expirado):**
        1.  Usar o `refresh_token` armazenado para fazer uma requisição à API de OAuth do Google (`grant_type=refresh_token`).
        2.  Receber o novo `access_token` e o novo `expires_at`.
        3.  Atualizar a tabela `google_integrations` com os novos dados.
        4.  Retornar o novo `access_token`.

### 4. Integração
* O Frontend deve parar de armazenar tokens em cookies/local storage para chamadas de API.
* O Frontend deve chamar a Edge Function (ou API route) que usa internamente o `getValidGoogleToken`.
* Meus agentes de IA (n8n/backend) invocarão essa mesma função para obter um token válido antes de operar no calendário.

---

**Solicitação:**
Com base nisso, por favor gere:
1.  O SQL para criar a tabela no Supabase.
2.  O código TypeScript (para uma Supabase Edge Function ou Next.js API route) que implementa a função `getValidGoogleToken` com a lógica de renovação automática.