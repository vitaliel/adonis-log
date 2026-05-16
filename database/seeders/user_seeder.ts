import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'
import UserSocialLink from '#models/user_social_link'

export default class UserSeeder extends BaseSeeder {
  async run() {
    const alice = await User.firstOrCreate(
      { email: 'alice@example.com' },
      {
        username: 'alice',
        password: 'password123',
        bio: 'Full-stack developer passionate about TypeScript and open source.',
      }
    )

    const bob = await User.firstOrCreate(
      { email: 'bob@example.com' },
      {
        username: 'bob',
        password: 'password123',
        bio: 'Backend engineer who loves databases, performance, and clean architecture.',
      }
    )

    await UserSocialLink.firstOrCreate(
      { userId: alice.id, type: 'github' },
      { url: 'https://github.com/alice' }
    )
    await UserSocialLink.firstOrCreate(
      { userId: alice.id, type: 'twitter' },
      { url: 'https://twitter.com/alice' }
    )

    await UserSocialLink.firstOrCreate(
      { userId: bob.id, type: 'github' },
      { url: 'https://github.com/bob' }
    )
    await UserSocialLink.firstOrCreate(
      { userId: bob.id, type: 'website' },
      { url: 'https://bob.dev' }
    )
  }
}
