/** @type {import('@adonisjs/lucid/src/Schema')} */
const Schema = use('Schema')

class PagesSchema extends Schema {
  up() {
    this.create('pages', table => {
      table.increments()
      table
        .string('name', 191)
        .notNullable()
        .unique()
      table.text('value')
      table.timestamps()
    })
  }

  down() {
    this.drop('pages')
  }
}

module.exports = PagesSchema
