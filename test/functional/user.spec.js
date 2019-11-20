const { test, trait } = use('Test/Suite')('User')

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const Helpers = use('Helpers')
const Hash = use('Hash')
const User = use('App/Models/User')

trait('Test/ApiClient')
trait('DatabaseTransactions')
trait('Auth/Client')

test('should be able to store user', async ({ assert, client }) => {
  const user = await Factory.model('App/Models/User').create({
    name: 'Rone',
    email: 'test@test.com',
    password: '123456',
    is_admin: true
  })

  const response = await client
    .post(`/users/`)
    .loginVia(user, 'jwt')
    .field('name', 'Santos')
    .field('email', 'santos@hotmail.com')
    .field('password', '12345678')
    .field('is_admin', false)
    .attach('avatar', Helpers.tmpPath('test/avatar.jpg'))
    .end()

  const newUser = await User.find(response.body.id)

  response.assertStatus(200)
  assert.equal(response.body.name, newUser.name)
  assert.equal(response.body.email, newUser.email)
  assert.isTrue(await Hash.verify('12345678', newUser.password))
  assert.equal(response.body.is_admin, 'false')
  assert.exists(response.body.avatar)
})

test('should be able to update user', async ({ assert, client }) => {
  const user = await Factory.model('App/Models/User').create({
    name: 'Rone',
    email: 'test@test.com',
    password: '123456',
    is_admin: true
  })

  const response = await client
    .put(`/users/${user.id}`)
    .loginVia(user, 'jwt')
    .field('name', 'Santos')
    .field('email', 'santos@hotmail.com')
    .field('password', '12345678')
    .field('is_admin', false)
    .attach('avatar', Helpers.tmpPath('test/avatar.jpg'))
    .end()

  await user.reload()

  response.assertStatus(200)
  assert.equal(user.name, 'Santos')
  assert.equal(user.email, 'santos@hotmail.com')
  assert.isTrue(await Hash.verify('12345678', user.password))
  assert.equal(user.is_admin, 'false')
  assert.exists(user.avatar)
})
