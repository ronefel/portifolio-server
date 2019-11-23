const { test, trait } = use('Test/Suite')('Photo')
const Factory = use('Factory')
const Helpers = use('Helpers')

const Gallery = use('App/Models/Gallery')
const Photo = use('App/Models/Photo')

trait('Test/ApiClient')
trait('DatabaseTransactions')
trait('Auth/Client')

test('only admin should be able to store photo', async ({ assert, client }) => {
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

  const gallery = await Gallery.create({ name: 'galleria' })

  const response401 = await client
    .post('/photos')
    .loginVia(user, 'jwt')
    .field('gallery_id', gallery.id)
    .attach('image', Helpers.tmpPath('test/avatar.jpg'))
    .end()
  response401.assertStatus(401)

  const response = await client
    .post('/photos')
    .loginVia(userAdmin, 'jwt')
    .field('gallery_id', gallery.id)
    .attach('image', Helpers.tmpPath('test/avatar.jpg'))
    .end()
  response.assertStatus(200)

  const newPhoto = await Photo.find(response.body.id)

  assert.equal(response.body.id, newPhoto.id, 'not equal id')
  assert.equal(
    response.body.gallery_id,
    newPhoto.gallery_id,
    'not equal gallery_id'
  )
  assert.equal(response.body.name, newPhoto.name, 'not equal image_url')
})

test('only admin should be able to list photo', async ({ assert, client }) => {
  const userAdmin = await Factory.model('App/Models/User').create({
    name: 'Rone',
    email: 'test@test.com',
    password: '123456',
    is_admin: true
  })

  const gallery = await Gallery.create({ name: 'galleria' })

  const response = await client
    .post('/photos')
    .loginVia(userAdmin, 'jwt')
    .field('gallery_id', gallery.id)
    .attach('image', Helpers.tmpPath('test/avatar.jpg'))
    .end()
  response.assertStatus(200)

  const listPhoto = await client
    .get('/photos')
    .loginVia(userAdmin, 'jwt')
    .end()
  listPhoto.assertStatus(200)

  assert.equal(response.body.id, listPhoto.body[0].id, 'not equal id')
  assert.equal(
    response.body.gallery_id,
    listPhoto.body[0].gallery_id,
    'not equal gallery_id'
  )
  assert.equal(
    response.body.image_url,
    listPhoto.body[0].image_url,
    'not equal image_url'
  )
})

test('normal user should be able to show photos', async ({ client }) => {
  const userAdmin = await Factory.model('App/Models/User').create({
    name: 'Rone',
    email: 'test@test.com',
    password: '123456',
    is_admin: true
  })

  const gallery = await Gallery.create({ name: 'galleria' })

  const response = await client
    .post('/photos')
    .loginVia(userAdmin, 'jwt')
    .field('gallery_id', gallery.id)
    .attach('image', Helpers.tmpPath('test/avatar.jpg'))
    .end()
  response.assertStatus(200)

  const newPhoto = await Photo.find(response.body.id)

  const getPhoto = await client.get(`/images/${newPhoto.name}`).end()
  getPhoto.assertStatus(200)
})

test('only admin should be able to destroy photo', async ({ client }) => {
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

  const gallery = await Gallery.create({ name: 'galleria' })

  const response = await client
    .post('/photos')
    .loginVia(userAdmin, 'jwt')
    .field('gallery_id', gallery.id)
    .attach('image', Helpers.tmpPath('test/avatar.jpg'))
    .end()
  response.assertStatus(200)

  const newPhoto = await Photo.find(response.body.id)

  const response401 = await client
    .delete(`/photos/${newPhoto.id}`)
    .loginVia(user, 'jwt')
    .end()
  response401.assertStatus(401)

  const deletePhoto = await client
    .delete(`/photos/${newPhoto.id}`)
    .loginVia(userAdmin, 'jwt')
    .end()
  deletePhoto.assertStatus(204)
})
