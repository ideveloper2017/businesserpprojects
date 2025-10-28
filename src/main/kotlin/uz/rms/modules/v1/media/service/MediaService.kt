package uz.rms.modules.v1.media.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import uz.rms.exception.FileStorageException
import uz.rms.modules.v1.media.model.Media
import uz.rms.modules.v1.media.model.dto.BreadcrumbDto
import uz.rms.modules.v1.media.model.dto.MediaDto
import uz.rms.modules.v1.media.model.dto.MediaListResponse
import uz.rms.modules.v1.media.model.mapper.MediaMapper
import uz.rms.modules.v1.media.repository.MediaRepository
import java.nio.file.Files
import java.nio.file.Files.isDirectory
import java.time.LocalDateTime

@Service
class MediaService(
    private val mediaRepository: MediaRepository,
    private val fileStorageService: FileStorageService
) {
    
    @Transactional
    fun uploadFile(file: MultipartFile, subDirectory: String = ""): Media {
        // Store file
        var filePathLocal = fileStorageService.storeFile(file, subDirectory)
        
        // Create media record
        val media = Media().apply {
            originalName = file.originalFilename ?: ""
            fileName = filePathLocal
            fileType = file.contentType ?: ""
            fileSize = file.size
            filePath = filePathLocal
            url = "/api/v1/media/download/$filePathLocal"
            isDeleted = false
            isDirectory = false
        }
        
        return mediaRepository.save(media)
    }
    
    @Transactional(readOnly = true)
    fun getMediaFile(filePath: String): Pair<ByteArray, String> {
        val file = fileStorageService.getFile(filePath)
        val contentType = Files.probeContentType(file) ?: "application/octet-stream"
        return Files.readAllBytes(file) to contentType
    }
    
    @Transactional
    fun deleteMedia(id: Long) {
        val media = mediaRepository.findByIdAndIsDeletedFalse(id)
            ?: throw NoSuchElementException("Media not found with id: $id")
            
        try {
            fileStorageService.deleteFile(media.filePath)
            media.isDeleted = true
            media.updatedAt = LocalDateTime.now()
            mediaRepository.save(media)
        } catch (e: Exception) {
            throw IllegalStateException("Failed to delete media with id: $id", e)
        }
    }
    
    @Transactional(readOnly = true)
    fun getMedia(id: Long): Media {
        return mediaRepository.findByIdAndIsDeletedFalse(id)
            ?: throw NoSuchElementException("Media not found with id: $id")
    }
    
    @Transactional(readOnly = true)
    fun getAllMedia(pageable: Pageable): List<MediaDto> {
        val page: Page<Media> = mediaRepository.findByIsDeletedFalse(pageable)
        val mediaDtos = page.content.map { MediaMapper.toDto(it) }

        return mediaDtos
    }
    
    @Transactional(readOnly = true)
    fun getMediaByType(fileType: String, pageable: Pageable): MediaListResponse {
        val page = mediaRepository.findByFileTypeContainingAndIsDeletedFalse(fileType, pageable)
        val mediaDtos = page.content.map { MediaMapper.toDto(it) }
        
        return MediaListResponse(
            data = mediaDtos,
            total = page.totalElements
        )
    }
    
    /**
     * Creates a new directory in the media library
     * @param directoryName Name of the directory to create
     * @param parentPath Optional parent directory path (can be empty for root)
     * @return The relative path of the created directory
     * @throws IllegalArgumentException if directory name is invalid
     * @throws IllegalStateException if directory creation fails
     */
    @Transactional
    fun createDirectory(directoryName: String, parentPath: String = ""): String {
        try {
            // Create the directory in the file system
            val directoryPath = fileStorageService.createDirectory(directoryName, parentPath)
            
            // Create a directory marker file to represent the directory in the database
            val directoryMarker = Media().apply {
                originalName = directoryName
                fileName = ""  // Empty for directories
                fileType = "directory"
                fileSize = 0L
                filePath = directoryPath
                url = "/api/v1/media/browse/$directoryPath"
                isDeleted = false
                isDirectory = true
            }
            
            mediaRepository.save(directoryMarker)
            
            return directoryPath
            
        } catch (ex: FileStorageException) {
            throw IllegalStateException("Failed to create directory: ${ex.message}", ex)
        } catch (ex: Exception) {
            throw IllegalStateException("Unexpected error while creating directory: ${ex.message}", ex)
        }
    }
    
    /**
     * List contents of a directory
     * @param path Relative path of the directory to list (empty for root)
     * @param pageable Pagination and sorting parameters
     * @return MediaListResponse containing the directory contents
     */
    @Transactional(readOnly = true)
    fun listDirectory(path: String, pageable: Pageable): MediaListResponse {
        try {
            // Get all files and directories in the specified path
            val page = if (path.isBlank()) {
                // For root directory, get all files with no parent directory
                mediaRepository.findByIsDeletedFalseAndFilePathNotContainingSlash(pageable)
            } else {
                // For subdirectories, get files where filePath starts with the given path
                mediaRepository.findByIsDeletedFalseAndFilePathStartsWith(path, pageable)
            }
            
            // Map to DTOs
            val items = page.content.map { MediaMapper.toDto(it) }
            
            return MediaListResponse(
                data = items,
                total = page.totalElements
            )
            
        } catch (ex: Exception) {
            throw IllegalStateException("Failed to list directory contents: ${ex.message}", ex)
        }
    }
    
    /**
     * Generate breadcrumb navigation for a given path
     * @param path The current path to generate breadcrumbs for
     * @return List of BreadcrumbDto objects representing the breadcrumb trail
     */
    fun getBreadcrumbs(path: String): List<BreadcrumbDto> {
        val breadcrumbs = mutableListOf<BreadcrumbDto>()
        
        // Add root breadcrumb
        breadcrumbs.add(BreadcrumbDto(
            name = "Root",
            path = "",
            fullPath = "",
            isLast = path.isBlank()
        ))
        
        if (path.isBlank()) {
            return breadcrumbs
        }
        
        // Split path into segments and build breadcrumbs
        val segments = path.split("/").filter { it.isNotBlank() }
        var currentPath = ""
        
        segments.forEachIndexed { index, segment ->
            currentPath = if (currentPath.isEmpty()) segment else "$currentPath/$segment"
            val isLast = index == segments.lastIndex
            
            breadcrumbs.add(BreadcrumbDto(
                name = segment,
                path = segment,
                fullPath = currentPath,
                isLast = isLast
            ))
        }
        
        return breadcrumbs
    }
}
