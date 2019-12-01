const Token = use('App/Models/Token')
const Encryption = use('Encryption')

class AuthController {
  async authenticate({ request, auth }) {
    const { email, password } = request.only(['email', 'password'])

    const { token, refreshToken } = await auth
      .withRefreshToken()
      .attempt(email, password, true)

    await this.destroyOthersTokens(refreshToken)

    return { token, refreshToken }
  }

  async logout({ auth }) {
    // for currently loggedin user
    const apiToken = auth.getAuthHeader()

    await auth.authenticator('jwt').revokeTokens([apiToken], true)
  }

  async refreshToken({ auth, request }) {
    const refreshToken = request.input('refresh_token')

    await this.destroyOthersTokens(refreshToken)

    return auth.newRefreshToken().generateForRefreshToken(refreshToken, true)
  }

  async destroyOthersTokens(token) {
    const decrypted = Encryption.decrypt(token)

    const refreshTokenDB = await Token.findBy('token', decrypted)

    await Token.query()
      .whereNot({ token: decrypted })
      .andWhere({ user_id: refreshTokenDB.user_id })
      .andWhere({ type: 'jwt_refresh_token' })
      .delete()
  }
}

module.exports = AuthController
