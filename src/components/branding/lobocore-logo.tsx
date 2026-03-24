import logoLarge from '@/assets/lobocore_logo_horizontal_large.png'
import logoCompact from '@/assets/lobocore_logo_horizontal_compact.png'
import wolfIcon from '@/assets/lobocore_wolf_icon.png'
import { cn } from '@/lib/utils'

type LogoVariant = 'large' | 'compact' | 'icon'

interface LoboCoreLogoProps {
  variant?: LogoVariant
  className?: string
  alt?: string
}

const logoMap = {
  large: logoLarge,
  compact: logoCompact,
  icon: wolfIcon,
} as const

export function LoboCoreLogo({ variant = 'compact', className, alt = 'LoboCore' }: LoboCoreLogoProps) {
  return <img src={logoMap[variant]} alt={alt} className={cn('object-contain', className)} />
}
