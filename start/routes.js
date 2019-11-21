/** @type {import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.post('authenticate', 'AuthController.authenticate')
Route.post('/forgot', 'ForgotPasswordController.store')
Route.post('/reset', 'ResetPasswordController.store')

Route.get('/avatar/:avatar', 'UserController.avatar')
Route.get('/galleries/:id', 'GalleryController.show')
Route.get('/images/:name', 'PhotoController.show')
Route.post('/register', 'UserController.register').validator('UserValidator')

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

  Route.resource('galleries', 'GalleryController')
    .apiOnly()
    .except('show')

  Route.resource('photos', 'PhotoController')
    .apiOnly()
    .except(['show', 'update'])
    .validator(new Map([[['photos.store'], ['PhotoValidator']]]))
}).middleware(['auth'])
