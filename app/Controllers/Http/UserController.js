/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('App/Models/User')

/** @type {typeof import('../../Libs/ImageLib')} */
const ImageLib = use('App/Libs/ImageLib')

/** @type {typeof import('@adonisjs/')} */
const Helpers = use('Helpers')

const TMP_USER = Helpers.tmpPath('user')

class UserController {
  async index() {
    const models = await Model.all()
    return models
  }

  async store({ request, response }) {
    const data = this.getRequestData(request)

    const { avatarImage } = data

    delete data.avatarImage

    const model = await Model.create(data)

    if (avatarImage) {
      // lê a imagem
      const image = await ImageLib.readImage(avatarImage.tmpPath)
      if (!image) {
        return response.status(400).json({
          message: 'Error to read avatar image.',
          name: 'error',
          status: 400
        })
      }
      // salva a imagem em um diretório
      if (!(await this.saveAvatar(image, data.avatar))) {
        return response.status(500).json({
          message: 'Error to store avatar on server.',
          name: 'error',
          status: 500
        })
      }
    }

    return model
  }

  async register({ request, response }) {
    const data = this.getRequestData(request)
    data.is_admin = 'false'

    const { avatarImage } = data

    delete data.avatarImage

    const model = await Model.create(data)

    if (avatarImage) {
      // lê a imagem
      const image = await ImageLib.readImage(avatarImage.tmpPath)
      if (!image) {
        return response.status(400).json({
          message: 'Error to read avatar image.',
          name: 'error',
          status: 400
        })
      }
      // salva a imagem em um diretório
      if (!(await this.saveAvatar(image, data.avatar))) {
        return response.status(500).json({
          message: 'Error to store avatar on server.',
          name: 'error',
          status: 500
        })
      }
    }

    return model
  }

  async show({ auth, params, response }) {
    const user = await auth.getUser()
    if (!user.is_admin && user.id !== Number(params.id)) {
      return response.status(401).json({
        message: "You cannot see someone else's profile.",
        name: 'error',
        status: 401
      })
    }
    const model = await Model.findOrFail(params.id)
    return model
  }

  async avatar({ params, response }) {
    return response.download(`${TMP_USER}/${params.avatar}`)
  }

  async update({ auth, params, request, response }) {
    const user = await auth.getUser()
    if (!user.is_admin && user.id !== Number(params.id)) {
      return response.status(401).json({
        message: "You cannot update someone else's profile.",
        name: 'error',
        status: 401
      })
    }
    const data = this.getRequestData(request)

    if (!user.is_admin) {
      data.is_admin = 'false'
    }
    const { avatarImage } = data
    delete data.avatarImage

    const model = await Model.findOrFail(params.id)

    // remove o avatar antigo do servidor
    await ImageLib.destroyImage(TMP_USER, model.avatar)

    model.merge(data)
    await model.save()

    if (avatarImage) {
      // lê a imagem
      const image = await ImageLib.readImage(avatarImage.tmpPath)
      if (!image) {
        return response.status(400).json({
          message: 'Error to read avatar image.',
          name: 'error',
          status: 400
        })
      }
      // salva a imagem em um diretório
      if (!(await this.saveAvatar(image, data.avatar))) {
        return response.status(500).json({
          message: 'Error to store avatar on server.',
          name: 'error',
          status: 500
        })
      }
    }

    return model
  }

  async destroy({ auth, params, response }) {
    const user = await auth.getUser()
    if (!user.is_admin) {
      return response.status(401)
    }

    const model = await Model.findOrFail(params.id)
    await ImageLib.destroyImage(TMP_USER, model.avatar)
    await model.delete()
  }

  async saveAvatar(image, name) {
    // redimenciona e otimiza a imagem
    const imageProcessed = await ImageLib.processImage(image)
    if (!imageProcessed) {
      return false
    }
    // salva a imagem no servidor
    const ImageStored = await ImageLib.storeImage(
      imageProcessed,
      TMP_USER,
      name
    )
    if (!ImageStored) {
      return false
    }
    return true
  }

  getRequestData(request) {
    const data = {}
    if (request.input('name')) {
      data.name = request.input('name')
    }
    if (request.input('email')) {
      data.email = request.input('email')
    }
    if (request.input('password')) {
      data.password = request.input('password')
    }
    if (request.input('is_admin')) {
      data.is_admin = request.input('is_admin')
    }

    const avatar = request.file('avatar', {
      types: ['image'],
      size: '10mb'
    })
    // gera um nome para a imagem do avatar
    const avatarName = `${new Date().getTime()}.jpg`
    if (avatar) {
      data.avatar = avatarName
      data.avatarImage = avatar
    }
    return data
  }
}

module.exports = UserController
