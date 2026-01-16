import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { knexConfig as knex } from '../database'
import { checkSessionIdExists } from '../middleware/check-session-id-exists.ts'

/**
 * Plugin que registra as rotas relacionadas a refeições (meals)
 * Todas as rotas aqui são prefixadas automaticamente por '/meals' no server.ts
 */
export async function updateMealsRoutes(app: FastifyInstance) {
  // Esquemas de validação usando Zod
  const updateMealparamsSchema = z.object({
    id: z.uuid().describe('ID da refeição a ser atualizada'),
  })
  // Esquema para o corpo da requisição de atualização de refeição
  const updateMealBodySchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    dateTime: z.coerce.date().optional(), // Converte string → Date automaticamente
    isOnDiet: z.boolean().optional(),
  })
  /**
   * PATCH /meals/:id
   *
   * Rota para atualizar parcialmente uma refeição existente.
   * Apenas o usuário dono da refeição (identificado pelo session_id) pode editá-la.
   */
  app.patch(
    '/meals/:id',
    {
      preHandler: checkSessionIdExists,
      // Documentação da rota para Swagger
      schema: {
        tags: ['Meals'],
        description: 'Atualiza parcialmente uma refeição existente pelo ID',
        response: {
          200: z.object({
            message: z.string().describe('Mensagem de sucesso da atualização'),
            meal: z
              .object({
                id: z.uuid(),
                user_id: z.uuid(),
                name: z.string(),
                description: z.string(),
                date_time: z.coerce.date(),
                is_on_diet: z.coerce.boolean(),
                created_at: z.coerce.date(),
                updated_at: z.coerce.date(),
              })
              .describe('Refeição atualizada'),
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
      // Extrai e valida os parâmetros da rota e o corpo da requisição
      const body = request.body as z.infer<typeof updateMealBodySchema>
      const { id } = request.params as z.infer<typeof updateMealparamsSchema>

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

      // Atualiza apenas os campos enviados no body
      // O Knex ignora valores undefined, então não sobrescreve campos não informados
      await knex('meals').where({ id }).update({
        name: body.name,
        description: body.description,
        date_time: body.dateTime,
        is_on_diet: body.isOnDiet,
        updated_at: knex.fn.now(), // Boa prática: registra quando foi a última alteração
      })

      // Busca a refeição atualizada para retornar ao cliente
      const updatedMeal = await knex('meals')
        .where({
          id,
          user_id: user.id,
        })
        .first()

      // Resposta de sucesso com a refeição atualizada
      return reply.status(200).send({
        message: 'Meal updated successfully',
        meal: updatedMeal,
      })
    },
  )
}
