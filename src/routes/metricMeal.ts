import type { FastifyInstance } from 'fastify'
import { knexConfig as knex } from '../database'
import { checkSessionIdExists } from '../middleware/check-session-id-exists.ts'
import { z } from 'zod'
/**
 * Plugin que registra as rotas relacionadas a refeições (meals)
 * Todas as rotas aqui são prefixadas automaticamente por '/meals' no server.ts
 */
export async function getMealMetricRoutes(app: FastifyInstance) {
  /**
   * GET /meals/metric
   *
   * Rota para buscar as metricas das refeiçõs existente.
   * Apenas o usuário dono da refeição (identificado pelo session_id) pode acessá-la.
   */
  app.get(
    '/meals/metric',
    {
      preHandler: checkSessionIdExists,
      // Documentação da rota para Swagger
      schema: {
        tags: ['Meals'],
        description: 'Busca as métricas das refeições do usuário',
        response: {
          200: z
            .object({
              totalMeals: z.number().describe('Total de refeições do usuário'),
              mealsOnDiet: z
                .number()
                .describe('Total de refeições dentro da dieta'),
              mealsOffDiet: z
                .number()
                .describe('Total de refeições fora da dieta'),
              bestSequence: z
                .number()
                .describe('Maior sequência de refeições dentro da dieta'),
            })
            .describe('Métricas das refeições do usuário'),
        },
      },
    }, // Verifica se o cookie sessionId existe (401 se não)
    async (request, reply) => {
      // Recupera o sessionId do cookie (já garantido pelo middleware)
      const sessionId = request.cookies.sessionId

      const user = await knex('users').where({ session_id: sessionId }).first()

      // Busca a refeição verificando se ela existe E pertence ao usuário atual
      const meal = await knex('meals')
        .where({
          user_id: user.id, // Segurança: impede edição de refeição de outro usuário
        })
        .returning('*')

      // Quantidade total de refeições dentro da dieta e fora da dieta

      const totalMeals = meal.length

      const mealsOnDiet = meal.filter((meal) => meal.is_on_diet).length

      const mealsOffDiet = meal.filter((meal) => !meal.is_on_diet).length

      // Maior sequência de refeições dentro da dieta
      let bestSequence = 0
      let currentSequence = 0

      for (const mealItem of meal) {
        if (mealItem.is_on_diet) {
          currentSequence += 1
          if (currentSequence > bestSequence) {
            bestSequence = currentSequence
          }
        } else {
          currentSequence = 0
        }
      }

      // Resposta de sucesso com a refeição encontrada
      return reply.status(200).send({
        totalMeals,
        mealsOnDiet,
        mealsOffDiet,
        bestSequence,
      })
    },
  )
}
