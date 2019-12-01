class Authentication {
  get rules() {
    return {
      email: 'required|email',
      password: 'required'
    }
  }
}

module.exports = Authentication
