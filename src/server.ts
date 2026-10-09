import { app } from "./app.js";

app.get('/', async (request, replay) => {
  return replay.status(200).send('Deu certo')
})

app.listen({port:3333}).then(() => {console.log('HTTP Server Running!')})