const { test, trait } = use('Test/Suite')('Authentication test')

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

trait('Test/ApiClient')
trait('DatabaseTransactions')

test('should return JWT token when session created', async ({
  assert,
  client
}) => {
  const payload = {
    email: 'ronefel@hotmail.com',
    password: '12345678'
  }

  await Factory.model('App/Models/User').create(payload)

  const response = await client
    .post('/authenticate')
    .send(payload)
    .end()

  response.assertStatus(200)
  assert.exists(response.body.token)
})
