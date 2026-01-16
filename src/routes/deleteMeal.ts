import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knexConfig as knex } from '../database'
import { checkSessionIdExists } from '../middleware/check-session-id-exists.ts'

/**
 * Plugin que registra as rotas relacionadas a refeições (meals)
 * Todas as rotas aqui são prefixadas automaticamente por '/meals' no server.ts
 */
export async function deleteMealsRoutes(app: FastifyInstance) {
  // Validação dos parâmetros da rota usando Zod
  const deleteMealParamsSchema = z.object({
    id: z.uuid().describe('ID da refeição a ser deletada'),
  })

  /**
   * DELETE /meals/:id
   *
   * Rota para deletar uma refeição existente.
   * Apenas o usuário dono da refeição (identificado pelo session_id) pode deletá-la.
   */
  app.delete(
    '/meals/:id',
    {
      preHandler: checkSessionIdExists,
      // schema de validação e documentação da rota
      schema: {
        tags: ['Meals'],
        description: 'Deleta uma refeição existente pelo ID',
        response: {
          200: z.object({
            message: z
              .string()
              .describe('Mensagem de sucesso na deleção da refeição'),
          }),
          404: z.object({
            message: z
              .string()
              .describe('Mensagem de erro caso a refeição não seja encontrada'),
          }),
        },
      },
    }, // Verifica se o cookie sessionId existe (401 se não)
    async (request, reply) => {
      // Parse seguro: lança erro se os dados não estiverem no formato esperado
      const { id } = request.params as z.infer<typeof deleteMealParamsSchema>

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

      // Deleta a refeição
      await knex('meals').where({ id }).delete()

      // Resposta de sucesso com a refeição deletada
      return reply.status(200).send({
        message: 'Meal deleted successfully',
      })
    },
  )
}
