class Authentication {
  get rules() {
    return {
      emailForgot: 'required|email'
    }
  }
}

module.exports = Authentication
