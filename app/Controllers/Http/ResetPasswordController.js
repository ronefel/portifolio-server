const { isBefore, parseISO, subMinutes } = require('date-fns')

const Token = use('App/Models/Token')

class ResetPasswordController {
  async store({ request, response }) {
    const { token, password } = request.only(['token', 'password'])

    const userToken = await Token.findByOrFail('token', token)

    if (this.tokenTimeIsInvalid(userToken.created_at)) {
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

  async validateResetPasswordToken({ request, response }) {
    const { token } = request.only(['token'])

    const userToken = await Token.findBy('token', token)

    if (!userToken || this.tokenTimeIsInvalid(userToken.created_at)) {
      return response.status(200).json({
        message: 'token_expired',
        name: 'success',
        status: 200
      })
    }
  }

  tokenTimeIsInvalid(tokenTime) {
    return isBefore(parseISO(tokenTime), subMinutes(new Date(), 15))
  }
}

module.exports = ResetPasswordController
