export interface MediaFile {
    id: number;
    originalName: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    fileType: string;
    width?: number;
    height?: number;
    createdAt: string;
    updatedAt: string;
}

export interface UploadResponse {
    id: number;
    fileName: string;
    url: string;
}