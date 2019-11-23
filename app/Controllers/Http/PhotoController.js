/** @type {typeof import('../../Libs/ImageLib')} */
const ImageLib = use('App/Libs/ImageLib')

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('App/Models/Photo')

const Helpers = use('Helpers')

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

const IMAGES_PATH = Helpers.appRoot(`${Env.get('IMAGES_PATH')}`)

class PhotoController {
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
    let imageProcessed = null

    const user = await auth.getUser()
    if (!user.is_admin) {
      return response.status(401).json()
    }

    const data = request.only(['gallery_id'])

    // gera um nome para a imagem
    data.name = `${new Date().getTime()}.jpg`
    // Salva os dados no banco
    const model = await Model.create(data)

    // pega a imagem da request
    const photo = request.file('photo', {
      types: ['image'],
      size: '10mb'
    })

    if (photo) {
      // lê a imagem
      try {
        image = await ImageLib.readImage(photo.tmpPath)
      } catch (err) {
        return response.status(400).json({
          message: `Error to read image: ${err}`,
          name: 'error',
          status: 400
        })
      }

      try {
        // redimenciona e otimiza a imagem
        imageProcessed = await ImageLib.processImage(image)

        // salva a imagem no servidor
        await ImageLib.storeImage(imageProcessed, IMAGES_PATH, data.name)
      } catch (err) {
        // remove os dados do banco
        await model.delete()
        return response.status(500).json({
          message: `Error to store image on server: ${err}`,
          name: 'error',
          status: 500
        })
      }
    }
    return model
  }

  async show({ params, response }) {
    return response.download(`${IMAGES_PATH}/${params.name}`)
  }

  async destroy({ auth, params, response }) {
    const user = await auth.getUser()
    if (!user.is_admin) {
      return response.status(401).json()
    }
    const model = await Model.findOrFail(params.id)
    await model.deletePhoto()
    await model.delete()
  }
}

module.exports = PhotoController
