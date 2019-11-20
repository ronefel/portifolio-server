/** @type {import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.post('authenticate', 'AuthController.authenticate')
Route.post('/forgot', 'ForgotPasswordController.store')
Route.post('/reset', 'ResetPasswordController.store')

Route.resource('galleries', 'GalleryController').apiOnly()

Route.resource('photos', 'PhotoController')
  .apiOnly()
  .except(['show', 'update'])
  .validator(new Map([[['photos.store'], ['PhotoValidator']]]))
Route.get('/images/:name', 'PhotoController.show')

// rota protegida exemplo
Route.get('/app', 'AppController.index').middleware(['auth'])

// grupo de rotas protegidas
Route.group(() => {
  Route.resource('users', 'UserController')
    .apiOnly()
    .validator(
      new Map([
        [['users.store'], ['UserValidator']],
        [['users.update'], ['UpdateUserValidator']]
      ])
    )
}).middleware(['auth'])
