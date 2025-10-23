import { Star } from "lucide-react"
import { cn } from "./ui/utils"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  onRatingChange?: (rating: number) => void
}

export function StarRating({ 
  rating, 
  maxRating = 5, 
  size = "md", 
  interactive = false,
  onRatingChange 
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4", 
    lg: "h-5 w-5"
  }

  const handleStarClick = (starRating: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starRating)
    }
  }

  return (
    <div className="flex items-center space-x-1">
      {Array.from({ length: maxRating }, (_, index) => {
        const starRating = index + 1
        const isFilled = starRating <= rating
        const isHalfFilled = starRating - 0.5 <= rating && starRating > rating

        return (
          <button
            key={index}
            onClick={() => handleStarClick(starRating)}
            disabled={!interactive}
            className={cn(
              "relative transition-colors duration-200",
              interactive && "hover:scale-110 cursor-pointer",
              !interactive && "cursor-default"
            )}
          >
            <Star
              className={cn(
                sizeClasses[size],
                isFilled 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "fill-none text-muted-foreground"
              )}
            />
            {isHalfFilled && (
              <Star
                className={cn(
                  sizeClasses[size],
                  "absolute top-0 left-0 fill-yellow-400 text-yellow-400"
                )}
                style={{
                  clipPath: "inset(0 50% 0 0)"
                }}
              />
            )}
          </button>
        )
      })}
    </div>
  )
}