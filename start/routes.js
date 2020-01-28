/** @type {import('@adonisjs/framework/src/Route/Manager')} */
const Route = use('Route')

Route.post('authenticate', 'AuthController.authenticate').validator(
  'Authentication'
)
Route.post('refreshToken', 'AuthController.refreshToken')
Route.post('forgot', 'ForgotPasswordController.store').validator(
  'ForgotPassword'
)
Route.post('resetPassword', 'ResetPasswordController.store').validator(
  'ResetValidator'
)
Route.post(
  'validateResetPasswordToken',
  'ResetPasswordController.validateResetPasswordToken'
)

Route.get('avatar/:avatar', 'UserController.avatar')
Route.get('galleries/:id', 'GalleryController.show')
Route.get('galleries', 'GalleryController.index')
Route.get('images/:name', 'PhotoController.show')
Route.post('register', 'UserController.register').validator('UserValidator')
Route.get('pages/:name', 'PageController.show')

// grupo de rotas protegidas
Route.group(() => {
  Route.resource('users', 'UserController')
    .apiOnly()
    .validator(
      new Map([
        [['users.store'], ['UserValidator']],
        [['users.update'], ['UserValidator']]
      ])
    )

  Route.resource('galleries', 'GalleryController')
    .apiOnly()
    .except(['index', 'show'])

  Route.resource('photos', 'PhotoController')
    .apiOnly()
    .except(['show', 'update'])
    .validator(new Map([[['photos.store'], ['PhotoValidator']]]))

  Route.resource('pages', 'PageController')
    .apiOnly()
    .except(['index', 'show'])
    .validator(
      new Map([
        [['pages.store'], ['PageValidator']],
        [['pages.update'], ['PageValidator']]
      ])
    )

  Route.post('logout', 'AuthController.logout')
}).middleware(['auth'])
