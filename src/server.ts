import { env } from './env/index.ts'
import { app } from './app.ts'

// Inicia o servidor na porta definida nas variáveis de ambiente
app.listen({ port: env.PORT }).then(() => {
  console.log('Server is running on http://localhost:3333')
})
