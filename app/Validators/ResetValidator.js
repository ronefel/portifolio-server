class UserValidator {
  get validateAll() {
    return true
  }

  get rules() {
    return {
      password: 'required|min:6'
    }
  }
}

module.exports = UserValidator
