/** @type {typeof import('../../Libs/ImageLib')} */
const ImageLib = use('App/Libs/ImageLib')

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('App/Models/Photo')

class PhotoController {
  async index() {
    const models = await Model.all()
    return models
  }

  async store({ request, response }) {
    const data = request.only(['gallery_id'])

    // pega a imagem da request
    const file = request.file('file', {
      types: ['image'],
      size: '10mb'
    })

    // redimenciona e otimiza a imagem
    const jimpImage = await ImageLib.processImage(file.tmpPath)
    if (!jimpImage) {
      return response.status(500).json({
        message: 'Error to process image.',
        name: 'error',
        status: 500
      })
    }

    // gera um nome para a imagem
    const name = `${new Date().getTime()}.jpg`
    data.name = name
    // Salva os dados no banco
    const model = await Model.create(data)

    // salva a imagem no servidor
    const nameImageStored = await ImageLib.storeImage(jimpImage, name)
    if (!nameImageStored) {
      // remove os dados do banco
      await model.delete()
      return response.status(500).json({
        message: 'Error to store image on server.',
        name: 'error',
        status: 500
      })
    }
    return model
  }

  async show({ params, response }) {
    return response.download(ImageLib.getPath(params.name))
  }

  async destroy({ params }) {
    const model = await Model.findOrFail(params.id)
    await model.delete()
  }
}

module.exports = PhotoController
