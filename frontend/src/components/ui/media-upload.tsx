import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";

interface MediaUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  onUpload?: (files: FileList) => void;
  acceptTypes?: string;
}

const MediaUpload = React.forwardRef<HTMLDivElement, MediaUploadProps>(
  ({ className, onUpload, acceptTypes = "image/*", ...props }, ref) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleClick = () => {
      fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0 && onUpload) {
        onUpload(files);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "group flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-accent/50 transition-colors",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={acceptTypes}
          multiple
          onChange={handleFileChange}
        />
        <Upload className="h-10 w-10 text-muted-foreground group-hover:text-foreground mb-2" />
        <p className="text-sm font-medium">Нажмите для загрузки</p>
        <p className="text-xs text-muted-foreground mt-1">или перетащите файлы сюда</p>
      </div>
    );
  }
);

MediaUpload.displayName = "MediaUpload";

export { MediaUpload };
