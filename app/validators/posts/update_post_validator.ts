import vine from '@vinejs/vine'

export const updatePostValidator = vine.compile(
  vine.object({
    title: vine.string().trim().minLength(1).maxLength(255),
    body: vine.string().trim().minLength(1),
    tags: vine.array(vine.string().trim().minLength(1)).optional(),
  })
)
