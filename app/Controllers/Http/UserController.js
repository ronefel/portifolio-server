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
    const data = request.only(['name', 'email', 'password', 'is_admin'])
    const avatar = request.file('avatar', {
      types: ['image'],
      size: '10mb'
    })

    // gera um nome para a imagem do avatar
    const avatarName = `${new Date().getTime()}.jpg`
    if (avatar) {
      data.avatar = avatarName
    }

    const model = await Model.create(data)

    if (avatar) {
      // lê a imagem
      const image = await ImageLib.readImage(avatar.tmpPath)
      if (!image) {
        return response.status(400).json({
          message: 'Error to read avatar image.',
          name: 'error',
          status: 400
        })
      }
      // salva a imagem em um diretório
      if (!(await this.saveAvatar(image, avatarName))) {
        return response.status(500).json({
          message: 'Error to store avatar on server.',
          name: 'error',
          status: 500
        })
      }
    }

    return model
  }

  async show({ params }) {
    const model = await Model.findOrFail(params.id)
    return model
  }

  async update({ params, request, response }) {
    const data = request.only(['name', 'email'])
    const avatar = request.file('avatar', {
      types: ['image'],
      size: '10mb'
    })

    // gera um nome para a imagem do avatar
    const avatarName = `${new Date().getTime()}.jpg`
    if (avatar) {
      data.avatar = avatarName
    }

    const model = await Model.findOrFail(params.id)

    // remove o avatar antigo do servidor
    await ImageLib.destroyImage(TMP_USER, model.avatar)

    if (request.input('password')) {
      data.password = request.input('password')
    }
    if (request.input('is_admin')) {
      data.is_admin = request.input('is_admin')
    }

    model.merge(data)
    await model.save()

    if (avatar) {
      // lê a imagem
      const image = await ImageLib.readImage(avatar.tmpPath)
      if (!image) {
        return response.status(400).json({
          message: 'Error to read avatar image.',
          name: 'error',
          status: 400
        })
      }
      // salva a imagem em um diretório
      if (!(await this.saveAvatar(image, avatarName))) {
        return response.status(500).json({
          message: 'Error to store avatar on server.',
          name: 'error',
          status: 500
        })
      }
    }

    return model
  }

  async destroy({ params }) {
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
}

module.exports = UserController
