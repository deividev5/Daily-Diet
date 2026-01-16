import { config } from 'dotenv'

// importamos o zod para validar as variaveis de ambiente
import z from 'zod'

// carregando as variaveis de ambiente do arquivo .env dependendo do ambiente
if (process.env.NODE_ENV === 'test') {
  config({ path: '.env.test', override: true })
} else {
  config()
}

// criando um schema para validar as variaveis de ambiente
const envSchema = z.object({
  // definindo o formato esperado para cada variavel de ambiente
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),
  // DATABASE_CLIENT deve ser 'sqlite' ou 'pg'
  DATABASE_CLIENT: z.enum(['sqlite', 'pg']),
  // DATABASE_URL é uma string obrigatória
  DATABASE_URL: z.string(),
  // PORT é um número, se não for definido, o padrão será 3333
  PORT: z.coerce.number().default(3333),
})

// validando as variaveis de ambiente com o schema criado
// se alguma variavel estiver faltando ou com o formato errado, um erro será lançado pelo parse do zod
const _env = envSchema.safeParse(process.env)

// se a validação falhar, exibimos os erros e encerramos a aplicação
if (_env.success === false) {
  console.error('Invalid environment variables:\n')

  _env.error.issues.forEach((issue) => {
    console.error(
      `   • ${issue.path.join('.')} → ${issue.message.toLowerCase()}`,
    )
  })

  console.error('\n')
  process.exit(1)
}

export const env = _env.data
