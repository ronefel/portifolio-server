class AuthController {
  async authenticate({ request, auth }) {
    const { email, password } = request.only(['email', 'password'])
    const { token } = await auth.attempt(email, password)
    return { token }
  }
}

module.exports = AuthController
