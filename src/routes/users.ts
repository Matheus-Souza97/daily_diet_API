import type { FastifyInstance } from "fastify";
import { knex } from "../database.js";
import { z } from "zod"
import crypto, { randomUUID } from "node:crypto"
import bcrypt from "bcrypt" // npm install bcrypt // npm install -D @types/bcrypt


export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async(request, reply) => {
    const bodySchema = z.object({
      name: z.string().trim().min(3, 'Informe seu nome.'),
      email: z.email(),
      password: z.string().min(6, 'A senha deve ter no minimo 6 caracteres')
    })

    
    const { name, email, password } = bodySchema.parse(request.body)

    const verifyEmailExists = await knex('users').where({email}).first()

    if (verifyEmailExists) {
      return reply.status(400).send('Email indisponivel')
    }
    
    const hash = await bcrypt.hash(password, 10)

    const user = await knex('users').insert({
      id: crypto.randomUUID(),
      name,
      email,
      password: hash
    })
    return reply.status(201).send(user)
  })

  app.post('/login', async (request, reply) => {
    const bodySchema = z.object({
      email: z.string().trim(),
      password: z.string()
    })

    const { email, password } = bodySchema.parse(request.body) 

    const user = await knex('users').where({email}).first()

    if (!user) {
      return reply.status(401).send('E-mail ou senha invalidos')
    }

    const passwordMatch = await bcrypt.compare(password, user.password)

    if (!passwordMatch) {
      return reply.status(401).send('E-mail ou senha invalidos')
    }

    const sessionId = randomUUID()

    reply.setCookie('sessionId', sessionId, {
      path: '/'
    })
    
    await knex('users').where({email}).update({session_id: sessionId})

    return reply.status(200).send('Login efetuado')
  })
}