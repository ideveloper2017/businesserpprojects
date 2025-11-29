import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from '@/components/ui/use-toast';
import { mediaApi } from '@/lib/api';
import {
  File,
  Folder,
  Grid,
  List,
  Loader2,
  MoreVertical,
  Search,
  Trash2,
  Upload,
  X,
  Image as ImageIcon,
  FileText,
  FileVideo,
  FileAudio,
  FileArchive,
  FileSpreadsheet,
  FileCode,
  Check,
  Copy,
  Link2,
  FolderPlus,
  ArrowLeft,
  ChevronRight,
  Info,
  Download
} from 'lucide-react';
import { cn} from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {MediaFile} from "@/types/media-library";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage
} from "@/components/ui/breadcrumb";
import {Label} from "@/components/ui/label.tsx";
import {formatFileSize} from "@/utils/formatters";


export function MediaLibrary() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [filteredFiles, setFilteredFiles] = useState<MediaFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<number[]>([]);
  const [selectedFile, setSelectedFile] = useState<MediaFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDirectory, setCurrentDirectory] = useState('');
  const [directories, setDirectories] = useState<string[]>([]);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newDirectoryName, setNewDirectoryName] = useState('');

  // Handle create directory
  const handleCreateDirectory = async () => {
    if (!newDirectoryName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a directory name',
        variant: 'destructive',
      });
      return;
    }
    console.log(newDirectoryName.trim()+" "+ currentDirectory)
    try {
      setLoading(true);
      await mediaApi.createDirectory(newDirectoryName.trim(), currentDirectory);
      setNewDirectoryName('');
      setShowNewFolderDialog(false);
      await fetchMedia(); // Refresh the file list
    } catch (error) {
      console.error('Error creating directory:', error);
      toast({
        title: 'Error',
        description: 'Failed to create directory',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch media files
const fetchMedia = useCallback(async () => {
  try {
    console.log('Starting to fetch media files...');
    setLoading(true);
    
    // Log before API call
    console.log('Calling mediaApi.getAll()...');
    
    const response = await mediaApi.getAll();
    console.log('Raw API response:', JSON.stringify(response, null, 2));

    // Handle different response formats
    const mediaData = Array.isArray(response)
      ? response
      : (response?.data || []);

    console.log('Processed media data:', {
      count: mediaData.length,
      firstItem: mediaData[0],
      allItems: mediaData
    });

    setFiles(mediaData);

    // Extract unique directories
    const dirs = new Set<string>();
    if (!Array.isArray(mediaData)) {
      console.error('mediaData is not an array:', mediaData);
      return;
    }

    mediaData.forEach((file: MediaFile, index: number) => {
      console.log(`Processing file ${index + 1}/${mediaData.length}:`, file);
      
      if (!file) {
        console.warn(`File at index ${index} is undefined or null`);
        return;
      }
      
      if (!file.filePath) {
        console.warn('File has no filePath:', file);
        return;
      }
      
      console.log(`File path: ${file.filePath}`);
      const pathParts = file.filePath.split('/').filter(Boolean);
      console.log('Path parts:', pathParts);
      
      if (pathParts.length > 1) {
        dirs.add(pathParts[0]);
      }
    });
    
    const uniqueDirs = Array.from(dirs);
    console.log('Extracted directories:', uniqueDirs);
    setDirectories(uniqueDirs);
  } catch (error) {
    console.error('Error fetching media:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch media files',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
}, []);

  // Filter files based on search query and current directory
  useEffect(() => {
    console.log('Filtering files...', {
      filesCount: files.length,
      currentDirectory,
      searchQuery,
      currentFilteredCount: filteredFiles.length
    });
    
    if (!Array.isArray(files)) {
      console.error('Files is not an array:', files);
      setFilteredFiles([]);
      return;
    }

    let result = [...files];
    console.log('Initial files count:', result.length);

    // Filter by directory
    if (currentDirectory) {
      console.log('Filtering by directory:', currentDirectory);
      result = result.filter(file => {
        if (!file || !file.filePath) {
          console.warn('Invalid file or missing filePath:', file);
          return false;
        }
        const matches = file.filePath.startsWith(`${currentDirectory}/`);
        console.log(`File ${file.fileName} matches directory:`, matches);
        return matches;
      });
      console.log('Files after directory filter:', result.length);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      console.log('Filtering by search query:', query);
      
      result = result.filter(file => {
        if (!file) return false;
        const nameMatch = file.originalName?.toLowerCase().includes(query) || false;
        const typeMatch = file.fileType?.toLowerCase().includes(query) || false;
        console.log(`File ${file.fileName} search matches - name: ${nameMatch}, type: ${typeMatch}`);
        return nameMatch || typeMatch;
      });
      console.log('Files after search filter:', result.length);
    }

    console.log('Final filtered files count:', result.length);
    setFilteredFiles(result);
  }, [files, searchQuery, currentDirectory]);

  // Initial fetch when component mounts
  useEffect(() => {
    console.log('Component mounted, fetching media...');
    fetchMedia();
  }, [fetchMedia]);

  // Handle file upload
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    
    try {
      setUploading(true);
      const results = [];
      let successCount = 0;

      for (const file of acceptedFiles) {
        try {
          const response = await mediaApi.upload(file, currentDirectory);
          results.push({ file, success: true, response });
          successCount++;
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          results.push({ 
            file, 
            success: false, 
            error: error instanceof Error ? error.message : 'Unknown error' 
          });
          
          toast({
            title: 'Upload Failed',
            description: `Failed to upload ${file.name}`,
            variant: 'destructive',
          });
        }
      }

      // Refresh the file list if any uploads were successful
      if (successCount > 0) {
        await fetchMedia();
        
        // Show success message
        if (successCount === acceptedFiles.length) {
          toast({
            title: 'Success',
            description: `Successfully uploaded ${successCount} file(s)`,
          });
        } else {
          toast({
            title: 'Partial Success',
            description: `Uploaded ${successCount} of ${acceptedFiles.length} file(s) successfully`,
          });
        }
      }
      
      // Clear selection
      setSelectedFiles([]);
      
    } catch (error) {
      console.error('Error in upload process:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  }, [currentDirectory, fetchMedia]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 20,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
      'application/pdf': ['.pdf'],
      'application/zip': ['.zip'],
      'application/x-rar-compressed': ['.rar'],
      'application/x-7z-compressed': ['.7z'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv'],
      'application/json': ['.json']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });
// Get file icon based on file type
const getFileIcon = (file: MediaFile, size: 'sm' | 'md' | 'lg' = 'md') => {
  const extension = file.fileName.split('.').pop()?.toLowerCase() || '';
  const isImage = file.fileType.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);

  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-8 w-8'
  };

  const iconClass = cn(sizeClasses[size], 'flex-shrink-0');

  if (isImage) {
    return <ImageIcon className={iconClass} />;
  } else if (file.fileType === 'application/pdf' || extension === 'pdf') {
    return <FileText className={iconClass} />;
  } else if (file.fileType.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(extension)) {
    return <FileVideo className={iconClass} />;
  } else if (file.fileType.startsWith('audio/') || ['mp3', 'wav', 'ogg'].includes(extension)) {
    return <FileAudio className={iconClass} />;
  } else if (
    file.fileType === 'application/zip' ||
    file.fileType === 'application/x-rar-compressed' ||
    file.fileType === 'application/x-7z-compressed' ||
    ['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)
  ) {
    return <FileArchive className={iconClass} />;
  } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
    return <FileSpreadsheet className={iconClass} />;
  } else if (['doc', 'docx', 'odt'].includes(extension)) {
    return <FileText className={iconClass} />;
  } else if (['html', 'css', 'js', 'jsx', 'ts', 'tsx', 'json', 'php'].includes(extension)) {
    return <FileCode className={iconClass} />;
  } else {
    return <File className={iconClass} />;
  }
};

// Get human-readable file type
const getFileType = (file: MediaFile) => {
  const extension = file.fileName.split('.').pop()?.toUpperCase() || '';
  const type = file.fileType.split('/')[0];

  switch (type) {
    case 'image':
      return `${extension} Image`;
    case 'application':
      if (file.fileType.includes('pdf')) return 'PDF Document';
      if (file.fileType.includes('zip') || file.fileType.includes('rar') || file.fileType.includes('7z'))
        return 'Archive';
      if (file.fileType.includes('msword') || file.fileType.includes('wordprocessingml'))
        return 'Word Document';
      if (file.fileType.includes('excel') || file.fileType.includes('spreadsheetml'))
        return 'Excel Spreadsheet';
      if (file.fileType.includes('powerpoint') || file.fileType.includes('presentationml'))
        return 'PowerPoint Presentation';
      return `${extension} File`;
    case 'video':
      return `${extension} Video`;
    case 'audio':
      return `${extension} Audio`;
    case 'text':
      return `${extension} Text File`;
    default:
      return file.fileType || 'Unknown';
  }
};
// Toggle file selection
const toggleFileSelection = (fileId: number) => {
  setSelectedFiles(prev =>
    prev.includes(fileId)
      ? prev.filter(id => id !== fileId)
      : [...prev, fileId]
  );
};

// Select all files
const selectAllFiles = () => {
  if (selectedFiles.length === filteredFiles.length) {
    setSelectedFiles([]);
  } else {
    setSelectedFiles(filteredFiles.map(file => file.id));
  }
};

// Handle file click
const handleFileClick = (file: MediaFile) => {
  setSelectedFile(file);
  setSidebarOpen(true);
};

// Close sidebar
const closeSidebar = () => {
  setSidebarOpen(false);
};

// Create new directory
const createDirectory = async () => {
  if (!newDirectoryName.trim()) {
    toast({
      title: 'Error',
      description: 'Please enter a directory name',
      variant: 'destructive',
    });
    return;
  }

  try {
    // Here you would typically make an API call to create a directory
    // For now, we'll just add it to the local state
    const newDir = currentDirectory
      ? `${currentDirectory}/${newDirectoryName}`
      : newDirectoryName;

    setDirectories(prev => [...prev, newDir]);
    setNewDirectoryName('');
    setShowNewFolderDialog(false);

    toast({
      title: 'Success',
      description: `Directory '${newDirectoryName}' created`,
    });
  } catch (error) {
    console.error('Error creating directory:', error);
    toast({
      title: 'Error',
      description: 'Failed to create directory',
      variant: 'destructive',
    });
  }
};

// Navigate to directory
const navigateToDirectory = (dir: string) => {
  setCurrentDirectory(dir);
  setSelectedFiles([]);
};

// Navigate up a directory
const navigateUp = () => {
  if (currentDirectory) {
    const pathParts = currentDirectory.split('/');
    pathParts.pop();
    setCurrentDirectory(pathParts.join('/'));
    setSelectedFiles([]);
  }
};

// Handle file deletion
const handleDelete = async (id: number) => {
  if (!window.confirm('Are you sure you want to delete this file?')) return;

  try {
    await mediaApi.delete(id);
    await fetchMedia();

    // Clear selection if the deleted file was selected
    setSelectedFiles(prev => prev.filter(fileId => fileId !== id));

    if (selectedFile?.id === id) {
      setSelectedFile(null);
      setSidebarOpen(false);
    }

    toast({
      title: 'Success',
      description: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete file';
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });
  }
};

// Handle bulk delete
const handleBulkDelete = async () => {
  if (selectedFiles.length === 0) return;

  if (!window.confirm(`Are you sure you want to delete ${selectedFiles.length} selected files?`)) {
    return;
  }

  try {
    const deletePromises = selectedFiles.map(id => mediaApi.delete(id));
    await Promise.all(deletePromises);

    // Clear selection after deletion
    setSelectedFiles([]);

    // Close sidebar if the selected file was deleted
    if (selectedFile && selectedFiles.includes(selectedFile.id)) {
      setSelectedFile(null);
      setSidebarOpen(false);
    }

    await fetchMedia();

    toast({
      title: 'Success',
      description: `Deleted ${selectedFiles.length} files successfully`,
    });
  } catch (error) {
    console.error('Error deleting files:', error);
    toast({
      title: 'Error',
      description: 'Failed to delete some files',
      variant: 'destructive',
    });
  }
};

// Handle download file
const handleDownload = (file: MediaFile) => {
  const link = document.createElement('a');
  link.href = mediaApi.getFileUrl(file.filePath);
  link.download = file.originalName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Handle bulk download
const handleBulkDownload = () => {
  if (selectedFiles.length === 0) return;

  // For multiple files, we can't trigger downloads programmatically due to browser security
  // So we'll open each file in a new tab and let the user download them manually
  selectedFiles.forEach(fileId => {
    const file = files.find(f => f.id === fileId);
    if (file) {
      window.open(mediaApi.getFileUrl(file.filePath), '_blank');
    }
  });
};

// Copy file URL to clipboard
const copyFileUrl = (file: MediaFile) => {
  const fileUrl = mediaApi.getFileUrl(file.filePath);
  navigator.clipboard.writeText(fileUrl);
  toast({
    title: 'Copied!',
    description: 'File URL copied to clipboard',
  });
};  // Rest of the component implementation...
  return (
  <div className="flex h-screen overflow-hidden">
    {/* Main Content */}
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-background border-b">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-semibold">Media Library</h1>
            {selectedFiles.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">
                  {selectedFiles.length} selected
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFiles([])}
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowNewFolderDialog(true)}
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => document.querySelector('input[type="file"]')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        <div className="border-t px-4 py-2 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentDirectory('');
                    }}
                  >
                    Home
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {currentDirectory && (
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentDirectory}</BreadcrumbPage>
                  </BreadcrumbItem>
                )}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search files..."
                className="pl-8 w-[200px] lg:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowNewFolderDialog(true)}
              className="h-8"
            >
              <FolderPlus className="h-4 w-4 mr-2" />
              New Folder
            </Button>

            <div className="flex items-center space-x-1 rounded-md border p-1">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* File List */}
      <div className="flex-1 overflow-auto p-4">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : files.length === 0 ? (
          <div
            {...getRootProps()}
            className="flex h-64 flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          >
            <input {...getInputProps()} />
            <Upload className="mb-4 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-1 text-lg font-medium">No files uploaded yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Drag & drop files here, or click to browse
            </p>
            <Button>Select Files</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Bulk Actions Bar */}
            {selectedFiles.length > 0 && (
              <div className="flex items-center justify-between rounded-md border bg-muted/50 p-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedFiles.length === filteredFiles.length}
                    onCheckedChange={selectAllFiles}
                  />
                  <span className="text-sm font-medium">
                    {selectedFiles.length} selected
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBulkDownload}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}

            {/* Files Grid/List View */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    className={cn(
                      'group relative rounded-md border p-2 hover:bg-muted/50 transition-colors',
                      selectedFiles.includes(file.id) && 'ring-2 ring-primary ring-offset-2'
                    )}
                    onClick={() => toggleFileSelection(file.id)}
                  >
                    <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
                      {file.fileType.startsWith('image/') ? (
                        <img
                          src={mediaApi.getFileUrl(file.filePath)}
                          alt={file.originalName}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWZpbGUtaW1hZ2UiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PGNpcmNsZSBjeD0iOC41IiBjeT0iOC41IiByPSIxLjUiPjwvY2lyY2xlPjxwb2x5bGluZSBwb2ludHM9IjIxIDE1IDE2IDEwIDUgMjEiPjwvcG9seWxpbmU+PC9zdmc+';
                          }}
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          {getFileIcon(file, 'lg')}
                        </div>
                      )}

                      {/* Selection Checkbox */}
                      <div className="absolute left-2 top-2">
                        <div className={cn(
                          'h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors',
                          selectedFiles.includes(file.id)
                            ? 'bg-primary border-primary'
                            : 'bg-background border-border group-hover:border-primary/50'
                        )}>
                          {selectedFiles.includes(file.id) && (
                            <Check className="h-3.5 w-3.5 text-primary-foreground" />
                          )}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="absolute right-2 top-2 flex space-x-1">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFileClick(file);
                          }}
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(file);
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-2">
                      <p className="text-xs font-medium text-foreground truncate">
                        {file.originalName}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(file.fileSize)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {file.fileType.split('/')[1]?.toUpperCase() || file.fileType}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border rounded-md">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="w-12 px-4 py-2">
                        <Checkbox
                          checked={selectedFiles.length > 0 && selectedFiles.length === filteredFiles.length}
                          onCheckedChange={selectAllFiles}
                        />
                      </th>
                      <th className="px-4 py-2 text-left">Name</th>
                      <th className="px-4 py-2 text-left hidden md:table-cell">Type</th>
                      <th className="px-4 py-2 text-left hidden lg:table-cell">Uploaded</th>
                      <th className="px-4 py-2 text-right">Size</th>
                      <th className="px-4 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredFiles.map((file) => (
                      <tr
                        key={file.id}
                        className={cn(
                          'hover:bg-muted/50',
                          selectedFiles.includes(file.id) && 'bg-muted/30'
                        )}
                      >
                        <td className="px-4 py-2">
                          <Checkbox
                            checked={selectedFiles.includes(file.id)}
                            onCheckedChange={() => toggleFileSelection(file.id)}
                          />
                        </td>
                        <td
                          className="px-4 py-2 font-medium cursor-pointer"
                          onClick={() => handleFileClick(file)}
                        >
                          <div className="flex items-center space-x-2">
                            <div className="flex-shrink-0">
                              {getFileIcon(file, 'sm')}
                            </div>
                            <span className="truncate max-w-[200px] inline-block">
                              {file.originalName}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2 hidden md:table-cell">
                          <span className="text-muted-foreground">
                            {getFileType(file)}
                          </span>
                        </td>
                        <td className="px-4 py-2 hidden lg:table-cell">
                          <span className="text-muted-foreground">
                            {new Date(file.createdAt).toLocaleString()}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className="text-muted-foreground">
                            {formatFileSize(file.fileSize)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <div className="flex justify-end space-x-1">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleDownload(file)}>
                                  <Download className="h-4 w-4 mr-2" />
                                  Download
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => copyFileUrl(file)}>
                                  <Link2 className="h-4 w-4 mr-2" />
                                  Copy URL
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-destructive"
                                  onClick={() => handleDelete(file.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {filteredFiles.length === 0 && (
              <div className="text-center py-16">
                <File className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-sm font-medium">
                  {searchQuery ? 'No files match your search' : 'No files in this location'}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {searchQuery
                    ? 'Try a different search term'
                    : 'Upload a file to get started'}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Sidebar */}
    {selectedFile && (
      <div className={cn(
        'fixed inset-y-0 right-0 w-full sm:w-96 bg-background border-l z-50 transition-transform duration-300 ease-in-out',
        sidebarOpen ? 'translate-x-0' : 'translate-x-full'
      )}>
        <div className="h-full flex flex-col">
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">File Details</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDownload(selectedFile)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyFileUrl(selectedFile)}
              >
                <Link2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={closeSidebar}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
              <div className="aspect-square bg-muted rounded-md overflow-hidden flex items-center justify-center">
                {selectedFile.fileType.startsWith('image/') ? (
                  <img
                    src={mediaApi.getFileUrl(selectedFile.fileName)}
                    alt={selectedFile.originalName}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="p-8">
                    {getFileIcon(selectedFile, 'lg')}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">File Information</h3>
                <div className="grid gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name</span>
                    <span className="text-right font-medium">{selectedFile.originalName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <span className="text-right">{getFileType(selectedFile)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Size</span>
                    <span className="text-right">{formatFileSize(selectedFile.fileSize)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uploaded</span>
                    <span className="text-right">
                      {new Date(selectedFile.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dimensions</span>
                    <span className="text-right">
                      {selectedFile.width && selectedFile.height
                        ? `${selectedFile.width} × ${selectedFile.height}`
                        : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-medium">File URL</h3>
                <div className="relative">
                  <div className="flex items-center space-x-2">
                    <Input
                      value={mediaApi.getFileUrl(selectedFile.filePath)}
                      readOnly
                      className="pr-10"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyFileUrl(selectedFile)}
                      className="absolute right-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => handleDelete(selectedFile.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete File
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* New Folder Dialog */}
    <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
          <DialogDescription>
            {currentDirectory 
              ? `Create a new folder in ${currentDirectory}`
              : 'Create a new folder in the root directory'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="folderName" className="text-right">
              Folder Name
            </Label>
            <Input
              id="folderName"
              value={newDirectoryName}
              onChange={(e) => setNewDirectoryName(e.target.value)}
              className="col-span-3"
              placeholder="Enter folder name"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateDirectory();
                }
              }}
              autoFocus
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setShowNewFolderDialog(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleCreateDirectory}
            disabled={!newDirectoryName.trim() || loading}
          >
            {loading ? 'Creating...' : 'Create Folder'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    {/* Dropzone Overlay */}
    {isDragActive && (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center border-2 border-dashed border-primary rounded-lg m-4">
        <div className="text-center p-8 max-w-md">
          <Upload className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h3 className="text-lg font-medium mb-2">Drop files to upload</h3>
          <p className="text-sm text-muted-foreground">
            Your files will be uploaded to the current directory
          </p>
        </div>
      </div>
    )}
  </div>
);
}