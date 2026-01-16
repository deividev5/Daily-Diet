import type { FastifyReply, FastifyRequest } from 'fastify'

// Middleware para verificar se o cookie sessionId existe na requisição
export async function checkSessionIdExists(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  // Extrai o cookie sessionId da requisição
  const sessionId = request.cookies.sessionId

  // Se o cookie sessionId não existir, retorna um erro 401 Unauthorized
  if (!sessionId) {
    return reply.status(401).send('Unauthorized: sessionId cookie missing')
  }
}
