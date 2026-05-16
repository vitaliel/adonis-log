import { useForm } from '@inertiajs/react'

interface LikeButtonProps {
  likeCount: number
  userHasLiked: boolean
  likeUrl: string
  isAuthenticated: boolean
}

export function LikeButton({ likeCount, userHasLiked, likeUrl, isAuthenticated }: LikeButtonProps) {
  const form = useForm({})

  function handleClick() {
    if (userHasLiked) {
      form.delete(likeUrl, { preserveScroll: true } as any)
    } else {
      form.post(likeUrl, { preserveScroll: true } as any)
    }
  }

  if (!isAuthenticated) {
    return <span className="text-muted small">♥ {likeCount}</span>
  }

  return (
    <button
      type="button"
      className={`btn btn-sm ${userHasLiked ? 'btn-danger' : 'btn-outline-secondary'}`}
      onClick={handleClick}
      disabled={form.processing}
    >
      {userHasLiked ? '♥' : '♡'} {likeCount}
    </button>
  )
}
