package uz.rms.config

import jakarta.annotation.PostConstruct
import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.context.annotation.Configuration
import org.springframework.util.unit.DataSize
import java.io.File

@Configuration
@ConfigurationProperties(prefix = "file")
class FileStorageProperties {
    lateinit var uploadDir: String
    var maxFileSize: DataSize = DataSize.ofMegabytes(10)
    var allowedExtensions: List<String> = listOf("jpg", "jpeg", "png", "gif", "pdf", "doc", "docx", "xls", "xlsx")
    
    @PostConstruct
    fun init() {
        // Convert to absolute path
        val processedPath = uploadDir
            .replace("~", System.getProperty("user.home"))
            .replace("\${'$'}{user.home}", System.getProperty("user.home"))
        
        val uploadDirFile = File(processedPath).absoluteFile
        
        // Create upload directory if it doesn't exist
        if (!uploadDirFile.exists()) {
            println("Creating upload directory: ${uploadDirFile.absolutePath}")
            uploadDirFile.mkdirs()
        }
        
        // Update uploadDir to the absolute path
        uploadDir = uploadDirFile.absolutePath
        
        // Verify directory is writable
        println("File upload directory: $uploadDir")
        println("Directory exists: ${uploadDirFile.exists()}")
        println("Directory is writable: ${uploadDirFile.canWrite()}")
        
        // Try to create a test file
        try {
            val testFile = File(uploadDirFile, "test.txt")
            testFile.writeText("test")
            println("Test file created successfully: ${testFile.absolutePath}")
            testFile.delete()
        } catch (e: Exception) {
            System.err.println("Failed to create test file: ${e.message}")
        }
    }
}
