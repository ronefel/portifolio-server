class PhotoValidator {
  get validateAll() {
    return true
  }

  get rules() {
    return {
      gallery_id: 'required|exists:galleries,id',
      image: 'required|file_ext:png,jpg,jpeg|file_size:10mb|file_types:image'
    }
  }

  // get messages() {
  //   return Antl.list('validation')
  // }
}

module.exports = PhotoValidator
