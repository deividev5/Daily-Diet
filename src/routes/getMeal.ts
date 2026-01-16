import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knexConfig as knex } from '../database'
import { checkSessionIdExists } from '../middleware/check-session-id-exists.ts'

/**
 * Plugin que registra as rotas relacionadas a refeições (meals)
 * Todas as rotas aqui são prefixadas automaticamente por '/meals' no server.ts
 */
export async function getMealRoutes(app: FastifyInstance) {
  // Schema Zod para validação dos parâmetros da rota
  const getMealParamsSchema = z.object({
    id: z.uuid().describe('ID da refeição a ser buscada'),
  })

  /**
   * GET /meals/:id
   *
   * Rota para buscar uma refeição existente.
   * Apenas o usuário dono da refeição (identificado pelo session_id) pode acessá-la.
   */
  app.get(
    '/meals/:id',
    {
      preHandler: checkSessionIdExists,
      // Documentação da rota para Swagger/OpenAPI
      schema: {
        tags: ['Meals'],
        description: 'Busca uma refeição existente pelo ID',
        response: {
          200: z.object({
            meal: z
              .object({
                id: z.uuid(),
                user_id: z.uuid(),
                name: z.string(),
                description: z.string(),
                date_time: z.coerce.date(),
                is_on_diet: z.coerce.boolean(),
                created_at: z.string(),
                updated_at: z.string(),
              })
              .describe('Refeição encontrada'),
          }),
          404: z.object({
            message: z
              .string()
              .describe('Mensagem de erro caso a refeição não seja encontrada'),
          }),
        },
      },
    },
    async (request, reply) => {
      // Parse seguro: lança erro se os dados não estiverem no formato esperado
      const { id } = request.params as z.infer<typeof getMealParamsSchema>

      // Recupera o sessionId do cookie (já garantido pelo middleware)
      const sessionId = request.cookies.sessionId

      const user = await knex('users').where({ session_id: sessionId }).first()

      // Busca a refeição verificando se ela existe E pertence ao usuário atual
      const meal = await knex('meals')
        .where({
          id,
          user_id: user.id, // Segurança: impede edição de refeição de outro usuário
        })
        .first()

      // Caso a refeição não exista ou não pertença ao usuário → 404
      if (!meal) {
        return reply.status(404).send({ message: 'Meal not found.' })
      }

      // Resposta de sucesso com a refeição encontrada
      return reply.status(200).send({
        meal,
      })
    },
  )
}
