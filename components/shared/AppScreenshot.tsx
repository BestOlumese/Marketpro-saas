import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AppScreenshotProps {
  src: string
  alt: string
  url?: string
  width?: number
  height?: number
  priority?: boolean
  className?: string
}

export function AppScreenshot({
  src,
  alt,
  url = 'app.marketpro.ng',
  width = 1280,
  height = 800,
  priority = false,
  className,
}: AppScreenshotProps) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-zinc-200/80 shadow-2xl ring-1 ring-black/5',
        className
      )}
    >
      {/* Browser chrome bar */}
      <div className="flex items-center gap-3 border-b border-zinc-200 bg-zinc-100 px-4 py-2.5">
        {/* Traffic light dots */}
        <div className="flex shrink-0 gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-400" />
          <span className="h-3 w-3 rounded-full bg-amber-400" />
          <span className="h-3 w-3 rounded-full bg-green-400" />
        </div>
        {/* URL bar */}
        <div className="mx-auto max-w-[260px] flex-1 truncate rounded-md border border-zinc-200 bg-white px-3 py-0.5 text-center text-xs text-zinc-400">
          {url}
        </div>
        {/* Right spacer to balance the dots */}
        <div className="w-12 shrink-0" />
      </div>

      {/* Screenshot */}
      <div className="bg-zinc-100">
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className="w-full"
          priority={priority}
        />
      </div>
    </div>
  )
}
