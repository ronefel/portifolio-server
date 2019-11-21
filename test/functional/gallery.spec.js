const { test, trait } = use('Test/Suite')('Gallery')
const Factory = use('Factory')
const Gallery = use('App/Models/Gallery')

trait('Test/ApiClient')
trait('DatabaseTransactions')
trait('Auth/Client')

test('should be able to store gallery', async ({ assert, client }) => {
  const user = await Factory.model('App/Models/User').create({
    name: 'Rone',
    email: 'test@test.com',
    password: '123456',
    is_admin: true
  })

  const response = await client
    .post(`/galleries/`)
    .loginVia(user, 'jwt')
    .field('name', 'Gallery')
    .end()
  response.assertStatus(200)

  const newGallery = await Gallery.find(response.body.id)

  assert.equal(response.body.name, newGallery.name)
})

test('should be able to update gallery', async ({ assert, client }) => {
  const user = await Factory.model('App/Models/User').create({
    name: 'Rone',
    email: 'test@test.com',
    password: '123456',
    is_admin: true
  })

  const gallery = await Gallery.create({ name: 'Gallery' })

  const response = await client
    .put(`/galleries/${gallery.id}`)
    .loginVia(user, 'jwt')
    .field('name', 'Updated')
    .end()
  response.assertStatus(200)

  await gallery.reload()

  assert.equal(gallery.name, 'Updated')
})

test('should be able to delete gallery', async ({ assert, client }) => {
  const user = await Factory.model('App/Models/User').create({
    name: 'Rone',
    email: 'test@test.com',
    password: '123456',
    is_admin: true
  })

  const gallery = await Gallery.create({ name: 'Gallery' })

  const response = await client
    .delete(`/galleries/${gallery.id}`)
    .loginVia(user, 'jwt')
    .end()
  response.assertStatus(204)

  const deletedGallery = await Gallery.find(gallery.id)
  assert.isNull(deletedGallery)
})

test('should be able to show the gallery without logged in', async ({
  assert,
  client
}) => {
  const gallery = await Gallery.create({ name: 'Gallery' })

  const response = await client.get(`/galleries/${gallery.id}`).end()

  response.assertStatus(200)
  assert.equal(response.body.name, 'Gallery')
})
