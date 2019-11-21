const { test, trait } = use('Test/Suite')('User')

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

const Helpers = use('Helpers')
const Hash = use('Hash')
const User = use('App/Models/User')

/** @type {typeof import('../../app/Libs/ImageLib')} */
const ImageLib = use('App/Libs/ImageLib')

trait('Test/ApiClient')
trait('DatabaseTransactions')
trait('Auth/Client')

test('admin should be able to store user', async ({ assert, client }) => {
  const userAdmin = await Factory.model('App/Models/User').create({
    name: 'Rone',
    email: 'test@test.com',
    password: '123456',
    is_admin: true
  })

  const response = await client
    .post(`/users/`)
    .loginVia(userAdmin, 'jwt')
    .field('name', 'Santos')
    .field('email', 'santos@hotmail.com')
    .field('password', '12345678')
    .field('is_admin', true)
    .attach('avatar', Helpers.tmpPath('test/avatar.jpg'))
    .end()
  response.assertStatus(200)

  const newUser = await User.find(response.body.id)

  assert.equal(response.body.name, newUser.name)
  assert.equal(response.body.email, newUser.email)
  assert.isTrue(await Hash.verify('12345678', newUser.password))
  assert.equal(response.body.is_admin, 'true')
  assert.equal(newUser.is_admin, 'true')
  assert.exists(response.body.avatar)

  const getAvatar = await client.get(`/avatar/${newUser.avatar}`).end()
  getAvatar.assertStatus(200)
  await ImageLib.destroyImage(Helpers.tmpPath('user'), newUser.avatar)
})

test('user should be able to register without login', async ({
  assert,
  client
}) => {
  const response = await client
    .post(`/register`)
    .field('name', 'Santos')
    .field('email', 'santos@hotmail.com')
    .field('password', '12345678')
    .field('is_admin', true)
    .attach('avatar', Helpers.tmpPath('test/avatar.jpg'))
    .end()
  response.assertStatus(200)

  const newUser = await User.find(response.body.id)

  assert.equal(response.body.name, newUser.name)
  assert.equal(response.body.email, newUser.email)
  assert.isTrue(await Hash.verify('12345678', newUser.password))
  // tem que salvar is_admin como false
  assert.equal(response.body.is_admin, 'false')
  assert.equal(newUser.is_admin, 'false')
  assert.exists(response.body.avatar)

  const getAvatar = await client.get(`/avatar/${newUser.avatar}`).end()
  getAvatar.assertStatus(200)
  await ImageLib.destroyImage(Helpers.tmpPath('user'), newUser.avatar)
})

test('admin should be able to update normal user', async ({
  assert,
  client
}) => {
  const userAdmin = await Factory.model('App/Models/User').create({
    name: 'Rone',
    email: 'test@test.com',
    password: '123456',
    is_admin: true
  })

  const user = await Factory.model('App/Models/User').create({
    name: 'Rone user',
    email: 'user@test.com',
    password: '123456',
    is_admin: false
  })

  const response = await client
    .put(`/users/${user.id}`)
    .loginVia(userAdmin, 'jwt')
    .field('name', 'Santos')
    .field('email', 'santos@hotmail.com')
    .field('password', '12345678')
    .field('is_admin', true)
    .attach('avatar', Helpers.tmpPath('test/avatar.jpg'))
    .end()
  response.assertStatus(200)

  await user.reload()

  assert.equal(user.name, 'Santos')
  assert.equal(user.email, 'santos@hotmail.com')
  assert.isTrue(await Hash.verify('12345678', user.password))
  // tem que salvar is_admin como true
  assert.equal(user.is_admin, 'true')
  assert.exists(user.avatar)

  const getAvatar = await client.get(`/avatar/${user.avatar}`).end()
  getAvatar.assertStatus(200)
  await ImageLib.destroyImage(Helpers.tmpPath('user'), user.avatar)
})

test('normal user should be able to update only your profile', async ({
  assert,
  client
}) => {
  const userAdmin = await Factory.model('App/Models/User').create({
    name: 'Rone',
    email: 'test@test.com',
    password: '123456',
    is_admin: true
  })

  const user = await Factory.model('App/Models/User').create({
    name: 'Rone user',
    email: 'user@test.com',
    password: '123456',
    is_admin: false
  })

  // tentando atualizar peril de outro usuário
  const response401 = await client
    .put(`/users/${userAdmin.id}`)
    .loginVia(user, 'jwt')
    .field('name', 'Santos')
    .field('email', 'santos@hotmail.com')
    .field('password', '12345678')
    .field('is_admin', false)
    .attach('avatar', Helpers.tmpPath('test/avatar.jpg'))
    .end()
  response401.assertStatus(401)

  const response200 = await client
    .put(`/users/${user.id}`)
    .loginVia(user, 'jwt')
    .field('name', 'Santos')
    .field('email', 'santos@hotmail.com')
    .field('password', '12345678')
    .field('is_admin', true)
    .attach('avatar', Helpers.tmpPath('test/avatar.jpg'))
    .end()
  response200.assertStatus(200)

  await user.reload()

  assert.equal(user.name, 'Santos')
  assert.equal(user.email, 'santos@hotmail.com')
  assert.isTrue(await Hash.verify('12345678', user.password))
  assert.equal(user.is_admin, 'false', 'tem que salvar is_admin como false')
  assert.exists(user.avatar)

  const getAvatar = await client.get(`/avatar/${user.avatar}`).end()
  getAvatar.assertStatus(200)
  await ImageLib.destroyImage(Helpers.tmpPath('user'), user.avatar)
})

test('admin should be able to see other user profile', async ({
  assert,
  client
}) => {
  const userAdmin = await Factory.model('App/Models/User').create({
    name: 'Rone',
    email: 'test@test.com',
    password: '123456',
    is_admin: true
  })

  const user = await Factory.model('App/Models/User').create({
    name: 'Rone user',
    email: 'user@test.com',
    password: '123456',
    is_admin: false
  })

  const response200 = await client
    .get(`/users/${user.id}`)
    .loginVia(userAdmin, 'jwt')
    .end()
  response200.assertStatus(200)

  assert.equal(user.id, response200.body.id)
  assert.equal(user.name, response200.body.name)
  assert.equal(user.email, response200.body.email)
  assert.equal(user.is_admin, response200.body.is_admin)
})

test('normal user should be able to see only your profile', async ({
  assert,
  client
}) => {
  const userAdmin = await Factory.model('App/Models/User').create({
    name: 'Rone',
    email: 'test@test.com',
    password: '123456',
    is_admin: true
  })

  const user = await Factory.model('App/Models/User').create({
    name: 'Rone user',
    email: 'user@test.com',
    password: '123456',
    is_admin: false
  })

  // tentando atualizar peril de outro usuário
  const response401 = await client
    .get(`/users/${userAdmin.id}`)
    .loginVia(user, 'jwt')
    .end()
  response401.assertStatus(401)

  const response200 = await client
    .get(`/users/${user.id}`)
    .loginVia(user, 'jwt')
    .end()
  response200.assertStatus(200)

  assert.equal(user.id, response200.body.id)
  assert.equal(user.name, response200.body.name)
  assert.equal(user.email, response200.body.email)
  assert.equal(user.is_admin, response200.body.is_admin)
})

test('admin should be able to delete user', async ({ assert, client }) => {
  const userAdmin = await Factory.model('App/Models/User').create({
    name: 'Rone',
    email: 'test@test.com',
    password: '123456',
    is_admin: true
  })

  const user = await Factory.model('App/Models/User').create({
    name: 'Rone user',
    email: 'user@test.com',
    password: '123456',
    is_admin: false
  })

  const response = await client
    .delete(`/users/${user.id}`)
    .loginVia(userAdmin, 'jwt')
    .end()
  response.assertStatus(204)

  const deletedUser = await User.find(user.id)
  assert.isNull(deletedUser)
})
