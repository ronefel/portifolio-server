const { test, trait } = use('Test/Suite')('Page')
const Factory = use('Factory')
const Page = use('App/Models/Page')

trait('Test/ApiClient')
trait('DatabaseTransactions')
trait('Auth/Client')

test('should be able to store page', async ({ assert, client }) => {
  const user = await Factory.model('App/Models/User').create({
    name: 'Rone',
    email: 'test@test.com',
    password: '123456',
    is_admin: true
  })

  const response = await client
    .post(`/pages/`)
    .loginVia(user, 'jwt')
    .field('name', 'information')
    .field('value', '<p>oi</p>')
    .end()
  response.assertStatus(200)

  const newPage = await Page.find(response.body.id)

  assert.equal(response.body.name, newPage.name)
  assert.equal(response.body.value, newPage.value)
})

test('should be able to update page', async ({ assert, client }) => {
  const user = await Factory.model('App/Models/User').create({
    name: 'Rone',
    email: 'test@test.com',
    password: '123456',
    is_admin: true
  })

  const page = await Page.create({
    name: 'information',
    value: '<p>oi</p>'
  })

  const response = await client
    .put(`/pages/${page.id}`)
    .loginVia(user, 'jwt')
    .field('name', 'informação')
    .field('value', '<p>olá</p>')
    .end()
  response.assertStatus(200)

  await page.reload()

  assert.equal(page.name, 'informação')
  assert.equal(page.value, '<p>olá</p>')
})

test('should be able to show the page without logged in', async ({
  assert,
  client
}) => {
  const page = await Page.create({
    name: 'information',
    value: '<p>oi</p>'
  })

  const response = await client.get(`/pages/${page.name}`).end()

  response.assertStatus(200)
  assert.equal(response.body.value, '<p>oi</p>')
})

test('should be able to delete page', async ({ assert, client }) => {
  const user = await Factory.model('App/Models/User').create({
    name: 'Rone',
    email: 'test@test.com',
    password: '123456',
    is_admin: true
  })

  const page = await Page.create({ name: 'Page', value: '<p>oi</p>' })

  const response = await client
    .delete(`/pages/${page.id}`)
    .loginVia(user, 'jwt')
    .end()
  response.assertStatus(204)

  const deletedPage = await Page.find(page.id)
  assert.isNull(deletedPage)
})
