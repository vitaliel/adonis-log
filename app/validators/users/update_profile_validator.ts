import vine from '@vinejs/vine'

export const updateProfileValidator = vine.compile(
  vine.object({
    bio: vine.string().trim().maxLength(500).nullable().optional(),
    social_links: vine
      .array(
        vine.object({
          type: vine.string().trim().minLength(1).maxLength(50),
          url: vine.string().trim().url().maxLength(500),
        })
      )
      .optional(),
  })
)
