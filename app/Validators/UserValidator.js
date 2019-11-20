class UserValidator {
  get rules() {
    return {
      name: 'required',
      email: 'required|email|unique:users:email',
      password: 'required|min:6',
      is_admin: 'boolean',
      avatar: 'file|file_ext:png,jpg,jpeg|file_size:10mb|file_types:image'
    }
  }
}

module.exports = UserValidator
