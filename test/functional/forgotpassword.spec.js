const { test, trait } = use('Test/Suite')('Forgot Password')
const { format, subMinutes } = require('date-fns')

/** @type {import('@adonisjs/framework/src/Hash')} */
const Hash = use('Hash')

const Mail = use('Mail')
const Database = use('Database')

/** @type {import('@adonisjs/lucid/src/Factory')} */
const Factory = use('Factory')

trait('Test/ApiClient')
trait('DatabaseTransactions')

test('should send an email with reset password instructions', async ({
  assert,
  client
}) => {
  Mail.fake()
  const email = 'ronefel@hotmail.com'

  const user = await Factory.model('App/Models/User').create({ email })

  const response = await client
    .post('/forgot')
    .send({ email })
    .end()
  response.assertStatus(204)

  const token = await user.tokens().first()

  const recentEmail = Mail.pullRecent()

  assert.equal(recentEmail.message.to[0].address, email)

  assert.include(token.toJSON(), {
    type: 'forgotpassword'
  })
  Mail.restore()
})

test('should be able to reset password', async ({ assert, client }) => {
  const email = 'ronefel@hotmail.com'

  const user = await Factory.model('App/Models/User').create({ email })
  const userToken = await Factory.model('App/Models/Token').make()

  await user.tokens().save(userToken)

  const response = await client
    .post('/reset')
    .send({
      token: userToken.token,
      password: '123456'
    })
    .end()
  response.assertStatus(204)

  await user.reload()
  const checkPassword = await Hash.verify('123456', user.password)

  assert.isTrue(checkPassword)
})

test('cannot reset password after 15m of forgot password request', async ({
  client
}) => {
  const email = 'ronefel@hotmail.com'

  const user = await Factory.model('App/Models/User').create({ email })
  const userToken = await Factory.model('App/Models/Token').make()

  await user.tokens().save(userToken)

  const dateWithSub = format(subMinutes(new Date(), 16), 'yyyy-MM-dd HH:mm:ss')

  await Database.table('tokens')
    .where('token', userToken.token)
    .update('created_at', dateWithSub)

  await userToken.reload()

  const response = await client
    .post('/reset')
    .send({
      token: userToken.token,
      password: '123456'
    })
    .end()
  response.assertStatus(400)
})
