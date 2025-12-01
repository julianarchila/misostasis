type GradientBackgroundProps = {
  children: React.ReactNode
}

export function GradientBackground({ children }: GradientBackgroundProps) {
  return (
    <div className="relative h-full bg-gradient-to-br from-[#fd5564] via-[#fe6f5d] to-[#ff8a5b]">
      {/* Gradient background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 top-1/3 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 left-1/3 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative h-full">
        {children}
      </div>
    </div>
  )
}
