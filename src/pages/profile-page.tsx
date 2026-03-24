import { useAuthStore } from '@/store/auth-store'
import { ProfileSummary } from '@/features/profile/profile-summary'

export function ProfilePage() {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return null
  }

  return <ProfileSummary user={user} />
}
