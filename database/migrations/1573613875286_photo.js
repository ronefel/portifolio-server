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
        .references('id')
        .inTable('galleries')
        .onDelete('NO ACTION')
        .onUpdate('CASCADE')
      table
        .string('name', 100)
        .notNullable()
        .unique()
      table.timestamp('created_at')
    })
  }

  down() {
    this.drop('photos')
  }
}

module.exports = PhotoSchema
