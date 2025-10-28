package uz.rms.modules.v1.media.service

import org.springframework.stereotype.Service
import org.springframework.util.StringUtils
import org.springframework.web.multipart.MultipartFile
import uz.rms.config.FileStorageProperties
import uz.rms.exception.FileStorageException

import java.io.IOException
import java.nio.file.Files
import java.nio.file.InvalidPathException
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.util.*

@Service
class FileStorageService(
    private val fileStorageProperties: FileStorageProperties
) {
    private val fileStorageLocation: Path = Paths.get(fileStorageProperties.uploadDir).toAbsolutePath().normalize()

    init {
        try {
            println("Initializing file storage at: ${fileStorageLocation.toAbsolutePath()}")
            println("Parent directory: ${fileStorageLocation.parent}")
            println("Parent exists: ${fileStorageLocation.parent?.let { Files.exists(it) }}")
            println("Parent is writable: ${fileStorageLocation.parent?.let { Files.isWritable(it) }}")
            
            Files.createDirectories(fileStorageLocation)
            
            println("File storage initialized at: ${fileStorageLocation.toAbsolutePath()}")
            println("Directory exists: ${Files.exists(fileStorageLocation)}")
            println("Directory is writable: ${Files.isWritable(fileStorageLocation)}")
            
            // Try to create a test file
            val testFile = fileStorageLocation.resolve("test.txt")
            Files.writeString(testFile, "test")
            println("Test file created: ${testFile.toAbsolutePath()}")
            Files.deleteIfExists(testFile)
            
        } catch (ex: Exception) {
            System.err.println("Failed to initialize file storage: ${ex.message}")
            ex.printStackTrace()
            throw FileStorageException("Could not create the directory where the uploaded files will be stored: ${ex.message}", ex)
        }
    }

    fun storeFile(file: MultipartFile, subDirectory: String = ""): String {
        // Validate file
        if (file.isEmpty) {
            throw FileStorageException("Failed to store empty file.")
        }

        // Check file size
        if (file.size > fileStorageProperties.maxFileSize.toBytes()) {
            throw FileStorageException("File size exceeds the maximum limit of ${fileStorageProperties.maxFileSize}")
        }

        // Get original filename and extension
        val originalFilename = file.originalFilename ?: "file_${System.currentTimeMillis()}"
        var fileExtension = StringUtils.getFilenameExtension(originalFilename)?.lowercase()
        
        // If no extension in filename, try to determine from content type
        if (fileExtension.isNullOrEmpty()) {
            fileExtension = file.contentType?.split("/")?.lastOrNull()?.lowercase()
            // If still no extension, use a default
            if (fileExtension.isNullOrEmpty()) {
                fileExtension = "bin"
            }
        }
        
        // Validate file extension against allowed types
        if (!fileStorageProperties.allowedExtensions.any { it.equals(fileExtension, ignoreCase = true) }) {
            throw FileStorageException("File type '$fileExtension' not allowed. Allowed types: ${fileStorageProperties.allowedExtensions}")
        }

        // Generate unique file name with the determined extension
        val fileName = "${UUID.randomUUID()}.${fileExtension}"
        
        // Create target directory if it doesn't exist
        val targetLocation = if (subDirectory.isNotEmpty()) {
            val dir = fileStorageLocation.resolve(subDirectory).normalize()
            Files.createDirectories(dir)
            dir
        } else {
            fileStorageLocation
        }

        // Copy file to the target location
        try {
            val targetPath = targetLocation.resolve(fileName).normalize()
            // Security check
            if (!targetPath.startsWith(targetLocation)) {
                throw FileStorageException("Cannot store file outside current directory.")
            }
            
            Files.copy(file.inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING)
            val relativePath = if (subDirectory.isNotEmpty()) "$subDirectory/$fileName" else fileName
            println("Successfully stored file: $relativePath at ${targetPath.toAbsolutePath()}")
            return relativePath
        } catch (ex: IOException) {
            throw FileStorageException("Could not store file $fileName. Please try again!", ex)
        }
    }

    fun deleteFile(filePath: String) {
        try {
            val fileLocation = fileStorageLocation.resolve(filePath).normalize()
            // Security check
            if (!fileLocation.startsWith(fileStorageLocation)) {
                throw FileStorageException("Access denied")
            }
            Files.deleteIfExists(fileLocation)
        } catch (ex: IOException) {
            throw FileStorageException("Could not delete file $filePath", ex)
        }
    }

    fun getFile(filePath: String): Path {
        val fileLocation = fileStorageLocation.resolve(filePath).normalize()
        // Security check
        if (!fileLocation.startsWith(fileStorageLocation)) {
            throw FileStorageException("Access denied")
        }
        if (!Files.exists(fileLocation)) {
            throw FileStorageException("File not found: $filePath")
        }
        return fileLocation
    }
    
    /**
     * Creates a new directory in the storage location
     * @param directoryName Name of the directory to create
     * @param parentPath Optional parent directory path (can be empty for root)
     * @return The relative path of the created directory
     * @throws FileStorageException if directory creation fails or directory already exists
     */
    @Throws(FileStorageException::class)
    fun createDirectory(directoryName: String, parentPath: String = ""): String {
        try {
            // Validate directory name
            if (directoryName.isBlank()) {
                throw FileStorageException("Directory name cannot be empty")
            }
            
            // Sanitize directory name
            val sanitizedName = directoryName.trim()
                .replace("..", "")  // Prevent directory traversal
                .replace("/", "")    // Prevent path manipulation
                .trim()
                
            if (sanitizedName.isBlank()) {
                throw FileStorageException("Invalid directory name")
            }
            
            // Resolve the target directory path
            val targetDirectory = if (parentPath.isNotBlank()) {
                fileStorageLocation.resolve(parentPath).normalize()
            } else {
                fileStorageLocation
            }
            
            // Security check
            if (!targetDirectory.startsWith(fileStorageLocation)) {
                throw FileStorageException("Access denied: Invalid parent directory")
            }
            
            // Create parent directories if they don't exist
            Files.createDirectories(targetDirectory)
            
            // Create the new directory
            val newDirectory = targetDirectory.resolve(sanitizedName).normalize()
            
            // Double check security
            if (!newDirectory.startsWith(fileStorageLocation)) {
                throw FileStorageException("Access denied: Invalid directory path")
            }
            
            // Check if directory already exists
            if (Files.exists(newDirectory)) {
                throw FileStorageException("Directory already exists: $sanitizedName")
            }
            
            // Create the directory
            Files.createDirectories(newDirectory)
            
            // Return the relative path
            return if (parentPath.isNotBlank()) {
                "$parentPath/$sanitizedName"
            } else {
                sanitizedName
            }
            
        } catch (ex: IOException) {
            throw FileStorageException("Could not create directory: ${ex.message}", ex)
        } catch (ex: InvalidPathException) {
            throw FileStorageException("Invalid directory name: ${ex.message}")
        }
    }
}
