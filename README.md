# 🥗 Daily Diet API

Uma API RESTful moderna para controle e acompanhamento da dieta diária, construída com **Fastify**, **TypeScript**, **Zod** e **PostgreSQL**.

## ✨ Funcionalidades

- ✅ Criar e gerenciar usuários
- ✅ Registrar refeições e alimentos
- ✅ Atualizar informações de refeições
- ✅ Deletar refeições
- ✅ Listar todas as refeições
- ✅ Obter detalhes de uma refeição específica
- ✅ Gerar métricas e estatísticas da dieta
- ✅ Autenticação segura com cookies
- ✅ Documentação interativa com Swagger/OpenAPI

## 🚀 Tecnologias Utilizadas

- **[Fastify](https://www.fastify.io/)** - Framework web rápido e eficiente
- **[TypeScript](https://www.typescriptlang.org/)** - Linguagem tipada para JavaScript
- **[Zod](https://zod.dev/)** - Validação de esquemas TypeScript-first
- **[Knex.js](http://knexjs.org/)** - Query builder SQL
- **[PostgreSQL](https://www.postgresql.org/)** - Banco de dados relacional
- **[Vitest](https://vitest.dev/)** - Framework de testes unitários
- **[Supertest](https://github.com/visionmedia/supertest)** - Testes de HTTP

## 📋 Pré-requisitos

- **Node.js** >= 18.0.0
- **PostgreSQL** instalado e rodando
- **npm** ou **yarn**

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/desafio-daily_diet.git
cd desafio-daily_diet
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Adicione suas configurações no arquivo `.env`:
```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/daily_diet
NODE_ENV=development
```

4. Execute as migrações do banco de dados:
```bash
npm run knex migrate:latest
```

## 🏃 Como Usar

### Modo Desenvolvimento

Inicie o servidor em modo de desenvolvimento com hot-reload:

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3333`

### Documentação da API

Acesse a documentação interativa do Swagger em:

```
http://localhost:3000/docs
```

### Testes

Execute todos os testes:
```bash
npm test
```

Execute os testes em modo watch:
```bash
npm run test:watch
```

### Build para Produção

Compile o projeto TypeScript:
```bash
npm run build
```

### Linting

Valide e corrija o código:
```bash
npm run lint
```

## 📚 Estrutura do Projeto

```
desafio-daily_diet/
├── db/
│   └── migrations/           # Migrações do banco de dados
├── src/
│   ├── @types/              # Definições de tipos TypeScript
│   ├── env/                 # Configurações de ambiente
│   ├── middleware/          # Middlewares customizados
│   ├── routes/              # Rotas da aplicação
│   ├── app.ts              # Configuração do Fastify
│   ├── database.ts         # Configuração do Knex
│   └── server.ts           # Inicialização do servidor
├── test/                   # Testes unitários
├── knexfile.ts            # Configuração do Knex
├── package.json           # Dependências do projeto
└── tsconfig.json          # Configuração do TypeScript
```

## 🔌 Endpoints Principais

### Usuários
- `POST /users` - Criar novo usuário
- `GET /users/:id` - Obter dados do usuário

### Refeições
- `POST /meals` - Criar nova refeição
- `GET /meals` - Listar todas as refeições
- `GET /meals/:id` - Obter detalhes de uma refeição
- `PUT /meals/:id` - Atualizar refeição
- `DELETE /meals/:id` - Deletar refeição

### Métricas
- `GET /meals/metrics` - Obter estatísticas da dieta

## 🔒 Autenticação

A API utiliza **cookies de sessão** para autenticação segura. Cada requisição deve incluir o cookie de sessão válido.

## 📝 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | URL de conexão com PostgreSQL | `postgresql://user:pass@localhost:5432/db` |
| `NODE_ENV` | Ambiente de execução | `development` ou `production` |

## 🧪 Executando os Testes

Os testes cobrem as funcionalidades principais da API:

```bash
# Testes de criação de usuários
npm test createUser.test.ts

# Testes de refeições
npm test Meals.test.ts
```

## 📖 Padrões e Convenções

- **Validação**: Todos os inputs são validados com Zod
- **Tipagem**: 100% tipado com TypeScript
- **Rotas**: Uso de plugin pattern do Fastify
- **Banco de Dados**: Migrações versionadas com Knex
- **Testes**: Cobertura de testes com Vitest

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👤 Autor

Desenvolvido como um desafio de aprendizado em Node.js com Fastify e TypeScript por Deivisson Gonçalves.

## 📞 Suporte

Se encontrar problemas ou tiver dúvidas, abra uma [issue](https://github.com/seu-usuario/desafio-daily_diet/issues) no repositório.

---

**Desenvolvido com ❤️ usando Fastify e TypeScript**
