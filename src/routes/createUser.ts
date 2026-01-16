import type { FastifyInstance } from 'fastify'

import { z } from 'zod'

import { knexConfig as knex } from '../database'

import { randomUUID } from 'node:crypto'

export async function createUserRoutes(app: FastifyInstance) {
  app.post(
    '/users',
    {
      // schema de validação e documentação da rota
      schema: {
        tags: ['Users'],
        description: 'Cria uma nova sessão de usuário ou retorna a existente',
        body: z.object({
          name: z.string().optional(), // pode ser opcional se quiser
        }),
        response: {
          201: z.object({
            message: z.string(),
            user: z.object({
              id: z.uuid(),
              name: z.string(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      // Validação do body da requisição
      const createUserBodySchema = z.object({
        name: z.string().optional(), // pode ser opcional se quiser
      })

      const { name } = createUserBodySchema.parse(request.body)

      // Pega o sessionId do cookie ou cria um novo
      let sessionId = request.cookies.sessionId

      if (!sessionId) {
        sessionId = randomUUID()
        reply.setCookie('sessionId', sessionId, {
          path: '/',
          maxAge: 1000 * 60 * 60 * 24 * 7, // 7 dias
          httpOnly: true, // boa prática de segurança
        })
      }

      // VERIFICA SE JÁ EXISTE UM USUÁRIO COM ESSE session_id
      let user = await knex('users').where({ session_id: sessionId }).first()

      // Se NÃO existir → cria um novo
      if (!user) {
        const newUserId = randomUUID()

        await knex('users').insert({
          id: newUserId,
          name: name ?? 'Usuário', // nome padrão se não vier
          session_id: sessionId,
        })

        // Atualiza o objeto user com o novo usuário criado
        user = { id: newUserId, name: name ?? 'Usuário', session_id: sessionId }
      }

      // Se vier um name no body e o usuário já existir, você pode atualizar o nome
      // (útil se o cara quiser mudar o nome depois)
      if (name && user.name !== name) {
        await knex('users').where({ id: user.id }).update({ name })

        user.name = name
      }

      return reply.status(201).send({
        message: 'User session ready',
        user: {
          id: user.id,
          name: user.name,
        },
      })
    },
  )
}
