class PageValidator {
  get validateAll() {
    return true
  }

  get rules() {
    const { id } = this.ctx.request.only(['id'])
    return {
      name: `required|min:3|max:191|unique:pages,name,id,${id}`
    }
  }
}

module.exports = PageValidator
