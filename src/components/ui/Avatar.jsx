import { cn } from "../../lib/utils"

function Avatar({ src, alt, className, fallback }) {
  return (
    <div className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted", className)}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="aspect-square h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-muted text-muted-foreground font-medium uppercase">
          {fallback || alt?.charAt(0) || "U"}
        </div>
      )}
    </div>
  )
}

export { Avatar }
