const Model = use('App/Models/Gallery')

class GalleryController {
  async index() {
    const models = await Model.all()
    return models
  }

  async store({ request }) {
    const data = request.only(['name'])
    const model = await Model.create(data)
    return model
  }

  async show({ params }) {
    const model = await Model.findOrFail(params.id)
    return model
  }

  async update({ params, request }) {
    const data = request.only(['name'])
    const model = await Model.findOrFail(params.id)
    model.merge(data)
    await model.save()
    return model
  }

  async destroy({ params }) {
    const model = await Model.findOrFail(params.id)
    await model.delete()
  }
}

module.exports = GalleryController
