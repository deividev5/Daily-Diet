import { afterAll, beforeAll, test, beforeEach, describe, expect } from 'vitest'
import { app } from '../src/app.ts'
import request from 'supertest'
import { execSync } from 'node:child_process'

let cookies: string[]
// Teste para criação de refeições
describe('Test Meals', () => {
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

    // Cria um usuário para autenticação nos testes
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: 'John Doe',
        email: 'john@doe.com',
      })
      .expect(201)

    // Armazena os cookies de autenticação para uso nos testes
    cookies = createUserResponse.get('Set-Cookie') || []
  })

  // Teste que faz a requisição para criar uma nova refeição
  test('Create a new meal', async () => {
    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Salad',
        description: 'Fresh vegetable salad',
        dateTime: '2026-01-01T12:00:00Z',
        isOnDiet: true,
      })
      .expect(201)
  })

  // Teste que faz a requisição para atualizar uma refeição existente
  test('Update a meal', async () => {
    // Primeiro cria uma refeição para depois atualizar
    const createResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Salad',
        description: 'Fresh vegetable salad',
        dateTime: '2026-01-01T12:00:00Z',
        isOnDiet: true,
      })

    // Pega o ID da refeição criada
    const mealId = createResponse.body.meal.id

    // Agora atualiza a refeição criada
    await request(app.server)
      .patch(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: 'Updated Salad',
        description: 'Updated description',
        dateTime: '2026-01-02T12:00:00Z',
        isOnDiet: false,
      })
      .expect(200)
  })

  // Teste para verificar o comportamento ao tentar atualizar uma refeição inexistente
  test('if meal to update does not exist, should return 404', async () => {
    // Tenta atualizar uma refeição com um ID que não existe
    await request(app.server)
      .patch('/meals/00000000-0000-0000-0000-000000000000')
      .set('Cookie', cookies)
      .send({
        name: 'Non-existent Meal',
        description: 'This meal does not exist',
        dateTime: '2026-01-02T12:00:00Z',
        isOnDiet: false,
      })
      // Espera um status 404 Not Found
      .expect(404)
  })

  // Teste que faz a requisição para deletar uma refeição existente
  test('Delete a meal', async () => {
    const createResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Salad',
        description: 'Fresh vegetable salad',
        dateTime: '2026-01-01T12:00:00Z',
        isOnDiet: true,
      })

    // Pega o ID da refeição criada
    const mealId = createResponse.body.meal.id

    // Agora deleta a refeição criada
    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)
  })

  // Teste para verificar o comportamento ao tentar deletar uma refeição inexistente
  test('if meal to delete does not exist, should return 404', async () => {
    // Tenta deletar uma refeição com um ID que não existe
    await request(app.server)
      .delete('/meals/00000000-0000-0000-0000-000000000000')
      .set('Cookie', cookies)
      // Espera um status 404 Not Found
      .expect(404)
  })

  // Teste para trazer todas as refeições do usuário
  test('should return all meals for a user', async () => {
    // Primeiro cria uma refeição para depois buscar todas
    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Salad',
      description: 'Fresh vegetable salad',
      dateTime: '2026-01-01T12:00:00Z',
      isOnDiet: true,
    })

    // Agora busca todas as refeições do usuário
    await request(app.server)
      .get('/meals/all')
      .set('Cookie', cookies)
      .expect(200)
  })

  // Teste para verificar o comportamento ao buscar refeições quando nenhuma existe
  test('if no meals found for user, should return 404', async () => {
    // Tenta buscar todas as refeições do usuário sem ter criado nenhuma
    await request(app.server)
      .get('/meals/all')
      .set('Cookie', cookies)
      // Espera um status 404 Not Found
      .expect(404)
  })

  // Teste que faz a requisição para trazer uma refeição existente
  test('Get a meal by ID', async () => {
    // Primeiro cria uma refeição para depois busca a refeição criada
    const createResponse = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: 'Salad',
        description: 'Fresh vegetable salad',
        dateTime: '2026-01-01T12:00:00Z',
        isOnDiet: true,
      })

    // Pega o ID da refeição criada
    const mealId = createResponse.body.meal.id

    // Agora busca a refeição criada
    await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .expect(200)
  })

  // Teste para verificar o comportamento ao tentar buscar uma refeição inexistente
  test('if meal to search does not exist, should return 404', async () => {
    // Tenta buscar uma refeição com um ID que não existe
    await request(app.server)
      .get('/meals/00000000-0000-0000-0000-000000000000')
      .set('Cookie', cookies)
      // Espera um status 404 Not Found
      .expect(404)
  })

  test('Get meal metrics', async () => {
    // Cria algumas refeições para gerar métricas
    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Salad',
      description: 'Fresh vegetable salad',
      dateTime: '2026-01-01T12:00:00Z',
      isOnDiet: true,
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Burger',
      description: 'Cheeseburger with fries',
      dateTime: '2026-01-02T12:00:00Z',
      isOnDiet: false,
    })

    await request(app.server).post('/meals').set('Cookie', cookies).send({
      name: 'Grilled Chicken',
      description: 'Grilled chicken with veggies',
      dateTime: '2026-01-03T12:00:00Z',
      isOnDiet: true,
    })

    // Agora busca as métricas das refeições
    const response = await request(app.server)
      .get('/meals/metric')
      .set('Cookie', cookies)
      .expect(200)

    // Verifica se as métricas retornadas estão corretas
    const metrics = response.body
    expect(metrics.totalMeals).toBe(3)
    expect(metrics.mealsOnDiet).toBe(2)
    expect(metrics.mealsOffDiet).toBe(1)
    expect(metrics.bestSequence).toBe(1)
  })
})
