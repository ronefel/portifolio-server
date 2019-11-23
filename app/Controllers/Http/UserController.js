/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('App/Models/User')

/** @type {typeof import('../../Libs/ImageLib')} */
const ImageLib = use('App/Libs/ImageLib')

/** @type {typeof import('@adonisjs/')} */
const Helpers = use('Helpers')

const TMP_USER = Helpers.tmpPath('user')

class UserController {
  async index({ auth, response }) {
    const user = await auth.getUser()
    if (!user.is_admin) {
      return response.status(401).json()
    }
    const models = await Model.all()
    return models
  }

  async store({ auth, request, response }) {
    let image = null

    const user = await auth.getUser()
    if (!user.is_admin) {
      return response.status(401).json()
    }

    const data = this.getRequestData(request)

    const { avatarImage } = data

    delete data.avatarImage

    const model = await Model.create(data)

    if (avatarImage) {
      // lê a imagem
      try {
        image = await ImageLib.readImage(avatarImage.tmpPath)
      } catch (err) {
        return response.status(400).json({
          message: `Error to read avatar image: ${err}`,
          name: 'error',
          status: 400
        })
      }
      // salva a imagem em um diretório
      try {
        await this.saveAvatar(image, data.avatar)
      } catch (err) {
        return response.status(500).json({
          message: `Error to store avatar on server: ${err}`,
          name: 'error',
          status: 500
        })
      }
    }

    return model
  }

  async register({ request, response }) {
    let image = null

    const data = this.getRequestData(request)
    data.is_admin = 'false'

    const { avatarImage } = data

    delete data.avatarImage

    const model = await Model.create(data)

    if (avatarImage) {
      // lê a imagem
      try {
        image = await ImageLib.readImage(avatarImage.tmpPath)
      } catch (err) {
        return response.status(400).json({
          message: `Error to read avatar image: ${err}`,
          name: 'error',
          status: 400
        })
      }
      // salva a imagem em um diretório
      try {
        await this.saveAvatar(image, data.avatar)
      } catch (err) {
        return response.status(500).json({
          message: `Error to store avatar on server: ${err}`,
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
    return response.download(ImageLib.getImagePath(params.avatar, TMP_USER))
  }

  async update({ auth, params, request, response }) {
    let image = null

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

    const model = await Model.findOrFail(params.id)

    const { avatarImage } = data
    delete data.avatarImage

    // se não enviou um novo avatar
    if (!avatarImage) {
      delete data.avatar
    } else {
      // lê a imagem
      try {
        image = await ImageLib.readImage(avatarImage.tmpPath)
      } catch (err) {
        return response.status(400).json({
          message: `Error to read avatar image: ${err}`,
          name: 'error',
          status: 400
        })
      }
      // salva a imagem em um diretório
      try {
        await this.saveAvatar(image, data.avatar)
      } catch (err) {
        return response.status(500).json({
          message: `Error to store avatar on server: ${err}`,
          name: 'error',
          status: 500
        })
      }
      // remove o avatar antigo do servidor
      await ImageLib.destroyImage(model.avatar, TMP_USER)
    }

    model.merge(data)
    await model.save()

    return model
  }

  async destroy({ auth, params, response }) {
    const user = await auth.getUser()
    if (!user.is_admin) {
      return response.status(401).json()
    }

    const model = await Model.findOrFail(params.id)
    await ImageLib.destroyImage(model.avatar, TMP_USER)
    await model.delete()
  }

  async saveAvatar(image, name) {
    // redimenciona e otimiza a imagem
    const imageProcessed = await ImageLib.processImage(image)

    // salva a imagem no servidor
    await ImageLib.storeImage(imageProcessed, name, TMP_USER)
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
    data.avatar = avatarName
    data.avatarImage = avatar
    return data
  }
}

module.exports = UserController
