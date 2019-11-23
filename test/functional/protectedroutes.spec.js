const { test, trait } = use('Test/Suite')('Protected Routes')

trait('Test/ApiClient')

test('protected routes must return status code 401 in response', async ({
  client
}) => {
  const usersIndex = await client.get(`/users`).end()
  usersIndex.assertStatus(401, 'users index')
  const usersStore = await client.post(`/users`).end()
  usersStore.assertStatus(401, 'users store')
  const usersShow = await client.get(`/users/1`).end()
  usersShow.assertStatus(401, 'users show')
  const usersUpdate = await client.put(`/users/1`).end()
  usersUpdate.assertStatus(401, 'users update')
  const usersDestroy = await client.delete(`/users/1`).end()
  usersDestroy.assertStatus(401, 'users destroy')

  const galleriesStore = await client.post(`/galleries`).end()
  galleriesStore.assertStatus(401, 'galleries store')
  const galleriesUpdate = await client.put(`/galleries/1`).end()
  galleriesUpdate.assertStatus(401, 'galleries update')
  const galleriesDestroy = await client.delete(`/galleries/1`).end()
  galleriesDestroy.assertStatus(401, 'galleries destroy')

  const photosIndex = await client.get(`/photos`).end()
  photosIndex.assertStatus(401, 'photos index')
  const photosStore = await client.post(`/photos`).end()
  photosStore.assertStatus(401, 'photos store')
  const photosDestroy = await client.delete(`/photos/1`).end()
  photosDestroy.assertStatus(401, 'photos destroy')
})
