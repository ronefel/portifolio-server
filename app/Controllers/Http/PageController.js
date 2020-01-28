/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Page = use('App/Models/Page')

/**
 * Resourceful controller for interacting with Pages
 */
class PageController {
  /**
   * Create/save a new Page.
   * POST Pages
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request }) {
    const data = request.only(['id', 'name', 'value'])
    if (!data.id) {
      const page = await Page.create(data)
      return page
    }
    const page = await Page.findOrFail(data.id)
    page.merge(data)
    await page.save()
    return page
  }

  /**
   * Display a single Page.
   * GET Pages/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async show({ params }) {
    const page = await Page.findBy('name', params.name)
    return page
  }

  /**
   * Update Page details.
   * PUT or PATCH Pages/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request }) {
    const data = request.only(['name', 'value'])
    const page = await Page.findOrFail(params.id)
    page.merge(data)
    await page.save()
    return page
  }

  /**
   * Delete a Page with id.
   * DELETE Pages/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params }) {
    const page = await Page.findOrFail(params.id)
    await page.delete()
  }
}

module.exports = PageController
