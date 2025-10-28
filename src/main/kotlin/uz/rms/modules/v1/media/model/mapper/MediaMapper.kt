package uz.rms.modules.v1.media.model.mapper

import uz.rms.modules.v1.media.model.Media
import uz.rms.modules.v1.media.model.dto.MediaDto
import uz.rms.modules.v1.media.model.dto.MediaUploadResponse

object MediaMapper {
    fun toDto(media: Media): MediaDto {
        return MediaDto(
            id = media.id,
            originalName = media.originalName,
            fileName = media.fileName,
            fileType = media.fileType,
            fileSize = media.fileSize,
            url = media.url,
            createdAt = media.createdAt,
            updatedAt = media.updatedAt,
            isDirectory = media.isDirectory
        )
    }

    fun toUploadResponse(media: Media): MediaUploadResponse {
        return MediaUploadResponse(
            id = media.id,
            fileName = media.fileName,
            fileType = media.fileType,
            url = media.url,
            size = media.fileSize
        )
    }
}
