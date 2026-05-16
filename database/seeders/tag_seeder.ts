import { BaseSeeder } from '@adonisjs/lucid/seeders'
import Tag from '#models/tag'

export default class TagSeeder extends BaseSeeder {
  async run() {
    await Tag.firstOrCreate({ slug: 'typescript' }, { name: 'TypeScript' })
    await Tag.firstOrCreate({ slug: 'javascript' }, { name: 'JavaScript' })
    await Tag.firstOrCreate({ slug: 'web-development' }, { name: 'Web Development' })
    await Tag.firstOrCreate({ slug: 'tutorial' }, { name: 'Tutorial' })
    await Tag.firstOrCreate({ slug: 'open-source' }, { name: 'Open Source' })
    await Tag.firstOrCreate({ slug: 'backend' }, { name: 'Backend' })
  }
}
