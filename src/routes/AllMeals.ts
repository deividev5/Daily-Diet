import type { FastifyInstance } from 'fastify'
import { knexConfig as knex } from '../database'
import { checkSessionIdExists } from '../middleware/check-session-id-exists.ts'
import { z } from 'zod'
/**
 * Plugin que registra as rotas relacionadas a refeições (meals)
 * Todas as rotas aqui são prefixadas automaticamente por '/meals' no server.ts
 */
export async function allMealsRoutes(app: FastifyInstance) {
  /**
   * GET /meals/all
   *
   * Rota para buscar todas as refeições do usuário.
   * Apenas o usuário dono da refeição (identificado pelo session_id) pode acessá-las.
   */
  app.get(
    '/meals/all',
    {
      preHandler: checkSessionIdExists,
      // schema de validação e documentação da rota
      schema: {
        description: 'Busca todas as refeições do usuário autenticado',
        tags: ['Meals'],
        response: {
          200: z.object({
            meals: z.array(
              z.object({
                id: z.uuid(),
                name: z.string(),
                description: z.string(),
                date_time: z.coerce.date(),
                is_on_diet: z.coerce.boolean(),
                user_id: z.uuid(),
              }),
            ),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    }, // Verifica se o cookie sessionId existe (401 se não)
    async (request, reply) => {
      // Recupera o sessionId do cookie (já garantido pelo middleware)
      const sessionId = request.cookies.sessionId

      // Busca o usuário associado ao sessionId
      const user = await knex('users').where({ session_id: sessionId }).first()

      // Busca as refeições verificando se elas existem E pertencem ao usuário atual
      const meals = await knex('meals')
        .where({
          user_id: user.id, // Segurança: impede edição de refeição de outro usuário
        })
        .select()

      // Caso a refeição não exista ou não pertença ao usuário, retorna 404
      if (!meals || meals.length === 0) {
        return reply.status(404).send({ message: 'No meals found.' })
      }

      // Retorna as refeições encontradas
      return reply.status(200).send({
        meals,
      })
    },
  )
}
