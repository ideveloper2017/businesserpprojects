import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Image } from "lucide-react";

interface MediaItemProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt?: string;
  isSelected?: boolean;
  onSelect?: () => void;
}

const MediaItem = React.forwardRef<HTMLDivElement, MediaItemProps>(
  ({ className, src, alt = "", isSelected = false, onSelect, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative overflow-hidden rounded-md border",
          isSelected && "ring-2 ring-primary",
          className
        )}
        onClick={onSelect}
        {...props}
      >
        <div className="relative aspect-square">
          {src ? (
            <img
              src={src}
              alt={alt}
              className="h-full w-full object-cover transition-all group-hover:opacity-90"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Image className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
        </div>
        {isSelected && (
          <div className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Check className="h-3 w-3" />
          </div>
        )}
      </div>
    );
  }
);

MediaItem.displayName = "MediaItem";

export { MediaItem };
