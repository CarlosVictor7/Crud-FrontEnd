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
