import type { FastifyInstance } from 'fastify'

import { z } from 'zod'

import { knexConfig as knex } from '../database'

import { randomUUID } from 'node:crypto'

import { checkSessionIdExists } from '../middleware/check-session-id-exists.ts'

export async function createMealsRoutes(app: FastifyInstance) {
  // Validação do corpo da requisição usando Zod
  const createMealsBodySchema = z.object({
    name: z.string(),
    description: z.string(),
    dateTime: z.coerce.date(),
    isOnDiet: z.boolean(),
  })

  // Rota para criar uma nova refeição
  app.post(
    '/meals',
    {
      preHandler: checkSessionIdExists,
      // schema de validação e documentação da rota
      schema: {
        description: 'Cria uma nova refeição para o usuário autenticado',
        tags: ['Meals'],
        body: createMealsBodySchema,
        response: {
          201: z.object({
            message: z.string(),
            meal: z.object({
              id: z.uuid(),
              name: z.string(),
              description: z.string(),
              date_time: z.coerce.date(),
              is_on_diet: z.coerce.boolean(),
              user_id: z.uuid(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      // Extrai os dados validados do corpo da requisição
      const { name, description, dateTime, isOnDiet } = request.body as z.infer<
        typeof createMealsBodySchema
      >

      // Pega o ID da sessão do cookie para associar a refeição ao usuário
      const sessionId = request.cookies.sessionId

      // Busca o usuário associado à sessão
      const user = await knex('users').where('session_id', sessionId).first()

      // Insere a nova refeição no banco de dados
      const [meal] = await knex('meals')
        .insert({
          id: randomUUID(),
          name,
          description,
          date_time: dateTime,
          is_on_diet: isOnDiet,
          user_id: user.id,
        })
        .returning('*')

      // Retorna a resposta de sucesso com os dados da refeição criada
      return reply
        .status(201)
        .send({ message: 'Meal created successfully', meal })
    },
  )
}
