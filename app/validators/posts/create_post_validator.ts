import vine from '@vinejs/vine'

export const createPostValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
    body: vine.string().trim().minLength(1),
    tags: vine
      .array(
        vine
          .string()
          .trim()
          .minLength(1)
          .regex(/[a-z0-9]/i)
      )
      .optional(),
  })
)
