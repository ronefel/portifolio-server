const Env = use('Env')

const Mail = use('Mail')
const User = use('App/Models/User')
const { promisify } = require('util')
const { randomBytes } = require('crypto')

class ForgotPasswordController {
  async store({ request }) {
    const email = request.input('email')

    const user = await User.findByOrFail('email', email)

    const random = await promisify(randomBytes)(24)
    const token = random.toString('hex')

    await user.tokens().create({
      token,
      type: 'forgotpassword'
    })

    const resetUrl = `${Env.get('FRONT_URL')}/reset?token=${token}`

    await Mail.send(
      'emails.forgotpassword',
      { name: user.name, resetUrl },
      message => {
        message
          .to(user.email)
          .from('no-reply@kryscardoso.com')
          .subject('[nome do site] - Recuperação de senha')
      }
    )
  }
}

module.exports = ForgotPasswordController
