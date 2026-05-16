import { BaseSeeder } from '@adonisjs/lucid/seeders'
import UserSeeder from './user_seeder.js'
import TagSeeder from './tag_seeder.js'
import PostSeeder from './post_seeder.js'
import CommentSeeder from './comment_seeder.js'
import LikeSeeder from './like_seeder.js'

export default class MainSeeder extends BaseSeeder {
  async run() {
    await new UserSeeder(this.client).run()
    await new TagSeeder(this.client).run()
    await new PostSeeder(this.client).run()
    await new CommentSeeder(this.client).run()
    await new LikeSeeder(this.client).run()
  }
}
