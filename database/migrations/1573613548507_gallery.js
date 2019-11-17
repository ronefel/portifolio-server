/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class GallerySchema extends Schema {
  up() {
    this.create('galleries', table => {
      table.increments()
      table.string('name', 100).notNullable()
      table.timestamps()
    })
  }

  down() {
    this.drop('galleries')
  }
}

module.exports = GallerySchema
