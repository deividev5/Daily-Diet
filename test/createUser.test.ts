import { afterAll, beforeAll, beforeEach, test } from 'vitest'
import { app } from '../src/app.ts'
import request from 'supertest'
import { execSync } from 'node:child_process'

// Teste para criação de usuários
// Inicializa o app antes dos testes e fecha após todos os testes
beforeAll(async () => {
  await app.ready()
})

afterAll(async () => {
  await app.close()
})

// Roda as migrations antes de cada teste para garantir um banco limpo
beforeEach(async () => {
  execSync('npm run knex migrate:rollback --all')
  execSync('npm run knex migrate:latest')
})

// Teste que faz a requisição para criar um novo usuário
test('Create a new user', async () => {
  await request(app.server)
    .post('/users')
    .send({
      name: 'Simon',
    })
    .expect(201)
})
