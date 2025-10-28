package uz.rms.modules.v1.media.model.dto

import io.swagger.v3.oas.annotations.media.Schema
import java.time.LocalDateTime

@Schema(description = "Media file data transfer object")
data class MediaDto(
    @field:Schema(description = "Unique identifier of the media file", example = "1")
    val id: Long,
    
    @field:Schema(description = "Original name of the uploaded file", example = "example.jpg")
    val originalName: String,
    
    @field:Schema(description = "Generated unique file name in storage", example = "a1b2c3d4-example.jpg")
    val fileName: String,
    
    @field:Schema(description = "MIME type of the file", example = "image/jpeg")
    val fileType: String,
    
    @field:Schema(description = "Size of the file in bytes", example = "1024")
    val fileSize: Long,
    
    @field:Schema(description = "Public URL to access the file", example = "http://localhost:8080/api/v1/media/download/a1b2c3d4-example.jpg")
    val url: String,
    
    @field:Schema(description = "Timestamp when the file was uploaded", example = "2023-01-01T12:00:00")
    val createdAt: LocalDateTime,
    
    @field:Schema(description = "Timestamp when the file was last updated", example = "2023-01-01T12:00:00")
    val updatedAt: LocalDateTime,
    
    @field:Schema(description = "Whether this is a directory", example = "false")
    val isDirectory: Boolean = false
)

@Schema(description = "Response object returned after a successful file upload")
data class MediaUploadResponse(
    @field:Schema(description = "Unique identifier of the uploaded media file", example = "1")
    val id: Long,
    
    @field:Schema(description = "Generated unique file name in storage", example = "a1b2c3d4-example.jpg")
    val fileName: String,
    
    @field:Schema(description = "MIME type of the file", example = "image/jpeg")
    val fileType: String,
    
    @field:Schema(description = "Public URL to access the file", example = "http://localhost:8080/api/v1/media/download/a1b2c3d4-example.jpg")
    val url: String,
    
    @field:Schema(description = "Size of the file in bytes", example = "1024")
    val size: Long
)

@Schema(description = "Paginated response containing a list of media files")
data class MediaListResponse(
    @field:Schema(description = "List of media files in the current page")
    val data: List<MediaDto>,
    
    @field:Schema(description = "Total number of media files across all pages", example = "100")
    val total: Long
)
