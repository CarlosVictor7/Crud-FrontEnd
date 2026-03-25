# LoboCore - Frontend

Frontend preparado para sistema administrativo full stack com React, Vite e TypeScript.

## Stack Tecnológica

- **Framework**: React 18
- **Build Tool**: Vite
- **Linguagem**: TypeScript
- **Roteamento**: React Router DOM
- **HTTP Client**: Axios

## Estrutura do Projeto

```
Crud-FrontEnd/
├── src/
│   ├── app/              # Configurações da aplicação
│   ├── components/       # Componentes reutilizáveis
│   ├── features/         # Funcionalidades por domínio
│   │   ├── auth/
│   │   ├── users/
│   │   ├── clients/
│   │   ├── products/
│   │   └── dashboard/
│   ├── layouts/          # Layouts (MainLayout, AuthLayout)
│   ├── pages/            # Páginas da aplicação
│   ├── routes/           # Configuração de rotas
│   ├── services/         # Serviços de API
│   ├── store/            # Estado global
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilitários
│   ├── types/            # Tipos TypeScript
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Configuração

### 1. Instalar Dependências

```bash
npm install
```

### 2. Executar em Desenvolvimento

```bash
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

### 3. Configurar Gemini (IA)

1. Crie um arquivo `.env` na raiz de `Crud-FrontEnd`.
2. Copie o conteúdo de `.env.example`.
3. Preencha `VITE_GEMINI_API_KEY` com sua chave válida.

Variáveis suportadas:

- `VITE_API_BASE_URL`: URL base do backend (ex.: `https://seu-backend.onrender.com/api`)
- `VITE_GEMINI_API_KEY`: chave da API Gemini
- `VITE_GEMINI_MODEL`: modelo (padrão: `gemini-2.5-flash`)
- `VITE_GEMINI_API_BASE_URL`: base da API (padrão: `https://generativelanguage.googleapis.com`)

## Deploy na Vercel

1. Faça push do frontend para o GitHub.
2. Na Vercel, clique em `Add New > Project` e importe o repositório.
3. Configure o `Root Directory` como `Crud-FrontEnd`.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Em `Environment Variables`, adicione:

- `VITE_API_BASE_URL` (URL do backend publicado, terminando com `/api`)
- `VITE_GEMINI_API_KEY`
- `VITE_GEMINI_MODEL` (ex.: `gemini-2.5-flash`)
- `VITE_GEMINI_API_BASE_URL` (opcional, padrão Google)

7. Clique em `Deploy`.

Observações:

- O projeto já inclui fallback de rota SPA em `vercel.json`.
- Sem `VITE_API_BASE_URL` em produção, as chamadas de API não vão alcançar seu backend.

## Scripts Disponíveis

```bash
# Desenvolvimento com hot reload
npm run dev

# Build para produção
npm run build

# Preview da build de produção
npm run preview

# Lint
npm run lint
```

## Integração com Backend

O Vite está configurado para fazer proxy das chamadas `/api` para `http://localhost:3000`.

Isso significa que você pode fazer chamadas como:

```typescript
axios.get('/api/health')
```

E elas serão automaticamente redirecionadas para o backend.

## Próximos Passos

Esta é uma estrutura inicial preparada. Os próximos passos incluem:

- [ ] Implementar sistema de autenticação
- [ ] Criar componentes de layout (sidebar, header)
- [ ] Implementar roteamento com React Router
- [ ] Criar páginas de CRUD
- [ ] Implementar gerenciamento de estado
- [ ] Adicionar componentes de UI
- [ ] Implementar tema claro/escuro
- [ ] Adicionar validação de formulários
- [ ] Implementar tratamento de erros
- [ ] Adicionar testes

## Funcionalidades Planejadas

- Dashboard com métricas
- CRUD de Usuários
- CRUD de Clientes
- CRUD de Produtos
- Sistema de autenticação JWT
- Controle de acesso por perfil (Super Admin, Admin, Cliente)
- Sidebar responsiva
- Modo claro e escuro
- Design moderno e tecnológico

## Licença

MIT
