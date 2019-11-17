const { isBefore, parseISO, subMinutes } = require('date-fns')

const Token = use('App/Models/Token')

class ResetPasswordController {
  async store({ request, response }) {
    const { token, password } = request.only(['token', 'password'])

    const userToken = await Token.findByOrFail('token', token)

    if (isBefore(parseISO(userToken.created_at), subMinutes(new Date(), 15))) {
      return response.status(400).json({
        message: 'Token expired.',
        name: 'error',
        status: 400
      })
    }

    const user = await userToken.user().fetch()

    user.password = password

    await user.save()
  }
}

module.exports = ResetPasswordController
