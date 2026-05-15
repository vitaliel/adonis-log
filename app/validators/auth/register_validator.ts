import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    username: vine.string().minLength(3).maxLength(50).unique({
      table: 'users',
      column: 'username',
    }),
    email: vine.string().email().normalizeEmail().unique({
      table: 'users',
      column: 'email',
    }),
    password: vine.string().minLength(8).maxLength(255),
  })
)
