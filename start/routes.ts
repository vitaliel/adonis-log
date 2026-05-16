/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'

const AuthController = () => import('#controllers/auth_controller')
const PostsController = () => import('#controllers/posts_controller')
const TagsController = () => import('#controllers/tags_controller')
const UsersController = () => import('#controllers/users_controller')

router.on('/').renderInertia('home', {}).as('home')

router
  .group(() => {
    router.get('/register', [AuthController, 'showRegister']).as('auth.register.show')
    router.post('/register', [AuthController, 'register']).as('auth.register')
    router.get('/login', [AuthController, 'showLogin']).as('auth.login.show')
    router.post('/login', [AuthController, 'login']).as('auth.login')
  })
  .use(middleware.guest())

router
  .group(() => {
    router.post('/logout', [AuthController, 'logout']).as('auth.logout')
  })
  .use(middleware.auth())

router.get('/posts', [PostsController, 'index']).as('posts.index')

router.get('/posts/create', [PostsController, 'create']).as('posts.create').use(middleware.auth())

router.get('/posts/:id/edit', [PostsController, 'edit']).as('posts.edit').use(middleware.auth())

router.get('/posts/:id', [PostsController, 'show']).as('posts.show')

router.post('/posts', [PostsController, 'store']).as('posts.store').use(middleware.auth())

router.put('/posts/:id', [PostsController, 'update']).as('posts.update').use(middleware.auth())

router.delete('/posts/:id', [PostsController, 'destroy']).as('posts.destroy').use(middleware.auth())

router.get('/tags/:slug', [TagsController, 'show']).as('tags.show')

router.get('/users/:username', [UsersController, 'show']).as('users.show')
