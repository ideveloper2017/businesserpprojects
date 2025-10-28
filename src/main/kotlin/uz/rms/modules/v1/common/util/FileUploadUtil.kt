// src/main/kotlin/uz/idev/app/v1/common/util/FileUploadUtil.kt
package uz.rms.modules.v1.common.util

import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Component
import org.springframework.util.StringUtils
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths
import java.nio.file.StandardCopyOption
import java.util.*

@Component
class FileUploadUtil(
    @Value("\${app.upload.dir:uploads}")
    private val uploadDir: String
) {
    private val log = LoggerFactory.getLogger(javaClass)

    init {
        val uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize()
        try {
            Files.createDirectories(uploadPath)
            log.info("Created upload directory: {}", uploadPath)
        } catch (ex: IOException) {
            log.error("Could not create upload directory: {}", uploadPath, ex)
            throw IllegalStateException("Could not create upload directory", ex)
        }
    }

    fun saveFile(file: MultipartFile, subdirectory: String = ""): String {
        val originalFilename = StringUtils.cleanPath(file.originalFilename ?: "file")
        val fileExtension = originalFilename.substringAfterLast('.', "")
        val uniqueFilename = "${UUID.randomUUID()}${if (fileExtension.isNotBlank()) ".$fileExtension" else ""}"

        val targetDir = Paths.get(uploadDir, subdirectory).toAbsolutePath().normalize()
        try {
            Files.createDirectories(targetDir)
        } catch (ex: IOException) {
            log.error("Could not create target directory: {}", targetDir, ex)
            throw IllegalStateException("Could not create target directory", ex)
        }

        val targetLocation = targetDir.resolve(uniqueFilename)
        try {
            file.inputStream.use { input ->
                Files.copy(input, targetLocation, StandardCopyOption.REPLACE_EXISTING)
            }
        } catch (ex: IOException) {
            log.error("Could not save file: {}", targetLocation, ex)
            throw IllegalStateException("Could not save file", ex)
        }

        log.debug("File saved to: {}", targetLocation)
        return uniqueFilename
    }

    fun deleteFile(filename: String, subdirectory: String = ""): Boolean {
        if (filename.isBlank()) return false

        return try {
            val filePath = getFilePath(filename, subdirectory)
            if (!filePath.startsWith(Paths.get(uploadDir).toAbsolutePath())) {
                log.warn("Attempted to delete file outside upload directory: {}", filePath)
                return false
            }

            val deleted = Files.deleteIfExists(filePath)
            if (deleted) {
                log.debug("File deleted: {}", filePath)
            } else {
                log.debug("File not found, nothing to delete: {}", filePath)
            }
            deleted
        } catch (ex: IOException) {
            log.error("Could not delete file: $filename", ex)
            false
        }
    }

    private fun getFilePath(filename: String, subdirectory: String): Path {
        return Paths.get(uploadDir, subdirectory, filename).toAbsolutePath().normalize()
    }
}