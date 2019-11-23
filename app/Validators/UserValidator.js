class UserValidator {
  get validateAll() {
    return true
  }

  get rules() {
    const { id } = this.ctx.params
    return {
      name: 'required',
      email: `required|email|unique:users,email,id,${id}`,
      password: `${id ? '' : 'required|'}min:6`,
      is_admin: 'boolean',
      avatar: 'file_ext:png,jpg,jpeg|file_size:10mb|file_types:image'
    }
  }
}

module.exports = UserValidator
