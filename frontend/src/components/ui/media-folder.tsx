import * as React from "react";
import { cn } from "@/lib/utils";
import { Folder, FolderPlus } from "lucide-react";

interface MediaFolderProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  isCreateFolder?: boolean;
  onFolderClick?: () => void;
}

const MediaFolder = React.forwardRef<HTMLDivElement, MediaFolderProps>(
  ({ className, name, isCreateFolder = false, onFolderClick, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group flex flex-col items-center justify-center p-4 rounded-md border cursor-pointer hover:bg-accent transition-colors",
          className
        )}
        onClick={onFolderClick}
        {...props}
      >
        {isCreateFolder ? (
          <FolderPlus className="h-12 w-12 text-muted-foreground group-hover:text-foreground" />
        ) : (
          <Folder className="h-12 w-12 text-muted-foreground group-hover:text-foreground" />
        )}
        <span className="mt-2 text-sm font-medium truncate max-w-full">{name}</span>
      </div>
    );
  }
);

MediaFolder.displayName = "MediaFolder";

export { MediaFolder };
