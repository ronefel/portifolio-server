/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PhotoSchema extends Schema {
  up() {
    this.create('photos', table => {
      table.increments()
      table
        .integer('gallery_id')
        .unsigned()
        .notNullable()
      table.foreign('gallery_id').references('galleries.id')
      table.string('name', 100).notNullable()
      table.timestamp('created_at')
    })
  }

  down() {
    this.drop('photos')
  }
}

module.exports = PhotoSchema
