import type { FastifyInstance } from "fastify/types/instance.js";
import crypto from "node:crypto"
import { knex } from "../database.js";
import { z } from "zod"
import { id } from "zod/locales";

export async function foodRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const sessionId = request.cookies.sessionId

    const userId = await knex('users').where({session_id: sessionId}).first('id')

    const bodySchema = z.object({
      name: z.string().trim().min(4),
      description: z.string().trim().min(5),
      diet: z.enum(['s', 'n'], 'Informacao invalida')
    }) 
  
    const { name, description, diet } = bodySchema.parse(request.body)

    const dietRegister = await knex('food').insert({
      id: crypto.randomUUID(),
      user_id: userId.id,
      name,
      description,
      diet
    })

    return reply.status(201).send({dietRegister})

  })

  app.put('/:foodId', async (request, reply) => {
    const paramsSchema = z.object({
      foodId: z.uuid()
    })

    const { foodId } = paramsSchema.parse(request.params)

    const sessionId = request.cookies.sessionId

    if (!sessionId) {
      return reply.status(401).send('Unauthorized')
    }

    const user = await knex('users').where({session_id:sessionId}).first('id')

    if (!user) {
      return reply.status(401).send('Unauthorized')
    }

    console.log(user.id)

    const bodySchema = z.object({
      name: z.string().trim().min(4).optional(),
      description: z.string().trim().min(5).optional(),
      diet: z.enum(['s', 'n'], 'Informacao invalida').optional()
    }) 

    const { name, description, diet } = bodySchema.parse(request.body)

    const editMeal = await knex('food').where({id: foodId, user_id: user.id}).update({
    ...(name !== undefined && { name }),
    ...(description !== undefined && { description }),
    ...(diet !== undefined && { diet })
    })

    return reply.status(200).send({editMeal})


  })

  app.delete('/:foodId', async (request, reply) => {
    const paramsSchema = z.object({
      foodId: z.uuid()
    })

    const { foodId } = paramsSchema.parse(request.params)

    const sessionId = request.cookies.sessionId

    if (!sessionId) {
      return reply.status(401).send('Unauthorized')
    }

    const user = await knex('users').where({session_Id: sessionId}).first('id')

    if (!user) {
      return reply.status(401).send('Unauthorized')
    }

    const deleteMeal = await knex('food').delete().where({id: foodId, user_id: user.id})

    if (!deleteMeal) {
      return reply.status(400).send('Bad request')
    }

    return reply.status(200).send({deleteMeal})
  })

  app.get('/', async (request, reply) => {
    const sessionId = request.cookies.sessionId

    if ( !sessionId) {
      return reply.status(401).send('Unauthorized')
    }

    const user = await knex('users').where({session_id: sessionId}).first('id')

    if (!user) {
      return reply.status(401).send('Unauthorized')
    }
    
    const meal = await knex('food').where({user_id:user.id}).select()

    return reply.status(200).send({meal})

  })

  app.get('/:foodId', async (request, reply) => {
    const paramsSchema = z.object({
      foodId: z.uuid('Bad request')
    })

    const { foodId } = paramsSchema.parse(request.params)


    const sessionId = request.cookies.sessionId

    if ( !sessionId) {
      return reply.status(401).send('Unauthorized')
    }

    const user = await knex('users').where({session_id: sessionId}).first('id')

    if (!user) {
      return reply.status(401).send('Unauthorized')
    }
    
    const meal = await knex('food').where({id: foodId, user_id:user.id}).first()

    if (!meal) {
      return reply.status(404).send('Not found')
    }

    return reply.status(200).send({meal})

  })
}