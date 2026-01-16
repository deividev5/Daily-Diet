import fastify from 'fastify'
import cookie from '@fastify/cookie'
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'

import { createUserRoutes } from './routes/createUser.ts'
import { createMealsRoutes } from './routes/createMeals.ts'
import { updateMealsRoutes } from './routes/updateMeal.ts'
import { deleteMealsRoutes } from './routes/deleteMeal.ts'
import { allMealsRoutes } from './routes/AllMeals.ts'
import { getMealRoutes } from './routes/GetMeal.ts'
import { getMealMetricRoutes } from './routes/metricMeal.ts'

export const app = fastify()

// Configuração necessária para o Zod funcionar com Swagger
app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

// Configuração do Swagger para documentação da API
app.register(swagger, {
  openapi: {
    info: {
      title: 'Daily Diet API',
      description: 'API para controle de dieta diária',
      version: '1.0.0',
    },
  },
  transform: jsonSchemaTransform,
})

app.register(swaggerUI, {
  routePrefix: '/docs', // Onde a documentação estará disponível
})

// Registra o plugin de cookies para manipulação de cookies
app.register(cookie)

// Registra as rotas da aplicação
app.register(createUserRoutes)
app.register(createMealsRoutes)
app.register(updateMealsRoutes)
app.register(deleteMealsRoutes)
app.register(allMealsRoutes)
app.register(getMealRoutes)
app.register(getMealMetricRoutes)
