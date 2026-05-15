import User from '#models/user'
import { registerValidator } from '#validators/auth/register_validator'
import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async showRegister({ inertia }: HttpContext) {
    return inertia.render('auth/Register', {})
  }

  async register({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(registerValidator)
    const user = await User.create(payload)
    await auth.use('web').login(user)
    // TODO story 2.1: change to response.redirect('/posts') once posts route exists
    return response.redirect('/')
  }
}
