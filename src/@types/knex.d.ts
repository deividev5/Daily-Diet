// Serve para adicionar tipos personalizados ao Knex
declare module 'knex/types/tables' {
  export interface tables {
    meals: {
      id: string
      name: string
      description: string
      is_on_diet: boolean
      created_at: Date
      user_id: string
    }
  }
}
