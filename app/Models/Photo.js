/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use('Model')

/** @type {import('@adonisjs/framework/src/Env')} */
const Env = use('Env')

class Photo extends Model {
  static get hidden() {
    return ['name']
  }

  static get computed() {
    return ['image_url']
  }

  static get updatedAtColumn() {
    return null
  }

  getImageUrl({ name }) {
    return `${Env.get('IMAGES_URL')}/${name}`
  }
}

module.exports = Photo
