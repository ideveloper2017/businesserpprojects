package uz.rms.modules.v1.media.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.core.io.ByteArrayResource
import org.springframework.core.io.Resource
import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import uz.rms.modules.v1.media.model.dto.BreadcrumbDto
import uz.rms.modules.v1.media.model.dto.MediaDto
import uz.rms.modules.v1.media.model.dto.MediaListResponse
import uz.rms.modules.v1.media.model.dto.MediaUploadResponse
import uz.rms.modules.v1.media.model.mapper.MediaMapper
import uz.rms.modules.v1.media.service.MediaService

@RestController
@RequestMapping("/api/v1/media")
@Tag(name = "Media Library", description = "API for managing media files (images, documents, etc.)")
//@SecurityRequirement(name = "JWT")
class MediaController(
    private val mediaService: MediaService
) {

    @Operation(
        summary = "Upload a file",
        description = "Upload a file to the media library. Supported file types: images (JPG, PNG, GIF), documents (PDF, DOC, DOCX, XLS, XLSX)"
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "File uploaded successfully",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = MediaUploadResponse::class))]
            ),
            ApiResponse(
                responseCode = "400",
                description = "Invalid file type or size"
            ),
            ApiResponse(
                responseCode = "401",
                description = "Unauthorized"
            )
        ]
    )
    @PostMapping("/upload", consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun uploadFile(
        @RequestParam("file") 
        @Parameter(description = "File to upload") 
        file: MultipartFile,
        
        @RequestParam(value = "directory", required = false, defaultValue = "")
        @Parameter(description = "Optional subdirectory for organization")
        directory: String
    ): ResponseEntity<uz.rms.common.ApiResponse<MediaUploadResponse>?> {
        val media = mediaService.uploadFile(file, directory)
        val response = MediaMapper.toUploadResponse(media)
        
        return ResponseEntity.ok()
            .header("X-File-Uploaded", "true")
            .body(uz.rms.common.ApiResponse.success("File uploaded successfully", response))
    }

    @Operation(
        summary = "Download a file",
        description = "Download a file by its path in the storage"
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "File downloaded successfully",
                content = [
                    Content(mediaType = "application/octet-stream", schema = Schema(type = "string", format = "binary"))
                ]
            ),
            ApiResponse(
                responseCode = "404",
                description = "File not found",
                content = [Content(mediaType = "application/json")]
            )
        ]
    )
    @GetMapping("/download/{filePath:.+}")
    fun downloadFile(
        @PathVariable 
        @Parameter(description = "Path of the file to download") 
        filePath: String
    ): ResponseEntity<Resource> {
        val (fileData, contentType) = mediaService.getMediaFile(filePath)
        
        val resource = ByteArrayResource(fileData)
        
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(
                HttpHeaders.CONTENT_DISPOSITION,
                "attachment; filename=\"${filePath.substringAfterLast("/")}\""
            )
            .body(resource)
    }

    @Operation(
        summary = "Get all media files",
        description = "Retrieve a paginated list of all media files with sorting and filtering options"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Successfully retrieved media files",
        content = [Content(mediaType = "application/json", schema = Schema(implementation = MediaListResponse::class))]
    )
    @GetMapping
    fun getAllMedia(
        @Parameter(
            description = "Pagination and sorting parameters",
            example = "{\"page\":0,\"size\":10,\"sort\":[\"createdAt,desc\"]}"
        )
        @PageableDefault(sort = ["createdAt"], direction = Sort.Direction.DESC, size = 10) 
        pageable: Pageable
    ): ResponseEntity<uz.rms.common.ApiResponse<List<MediaDto>>?> {
        val response = mediaService.getAllMedia(pageable)
        return ResponseEntity.ok(uz.rms.common.ApiResponse.success("Successfully retrieved media files", response))
    }

    @Operation(
        summary = "Get media by ID",
        description = "Retrieve a media file by its ID"
    )


    @PostMapping("/directories")
    fun createDirectory(
        @RequestParam("name") 
        @Parameter(description = "Name of the directory to create") 
        directoryName: String,
        
        @RequestParam(value = "parentPath", required = false, defaultValue = "") 
        @Parameter(description = "Parent directory path (leave empty for root)")
        parentPath: String
    ): ResponseEntity<uz.rms.common.ApiResponse<String>> {
        print(directoryName+" "+parentPath)
        val directoryPath = mediaService.createDirectory(directoryName, parentPath)
        return ResponseEntity.ok(uz.rms.common.ApiResponse.success("Directory created successfully", directoryPath))
    }

    @Operation(
        summary = "Get breadcrumb navigation for a path",
        description = "Get a list of breadcrumb items for the given path"
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Breadcrumb navigation retrieved successfully",
                content = [Content(mediaType = "application/json")]
            )
        ]
    )
    @GetMapping("/breadcrumbs")
    fun getBreadcrumbs(
        @RequestParam(value = "path", required = false, defaultValue = "") 
        @Parameter(description = "Path to generate breadcrumbs for (leave empty for root)")
        path: String
    ): ResponseEntity<uz.rms.common.ApiResponse<List<BreadcrumbDto>>> {
        val breadcrumbs = mediaService.getBreadcrumbs(path)
        return ResponseEntity.ok(uz.rms.common.ApiResponse.success("Breadcrumbs retrieved successfully", breadcrumbs))
    }

    @Operation(
        summary = "List directory contents",
        description = "List all files and subdirectories in a given directory"
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "200",
                description = "Directory contents retrieved successfully",
                content = [Content(mediaType = "application/json")]
            ),
            ApiResponse(
                responseCode = "404",
                description = "Directory not found"
            )
        ]
    )
    @GetMapping("/browse")
    fun listDirectory(
        @RequestParam(value = "path", required = false, defaultValue = "") 
        @Parameter(description = "Path of the directory to list (leave empty for root)")
        path: String,
        
        @Parameter(
            description = "Pagination and sorting parameters",
            example = "{\"page\":0,\"size\":10,\"sort\":[\"name,asc\"]}"
        )
        @PageableDefault(sort = ["fileName"], direction = Sort.Direction.ASC, size = 100) 
        pageable: Pageable
    ): ResponseEntity<uz.rms.common.ApiResponse<MediaListResponse>> {
        val response = mediaService.listDirectory(path, pageable)
        return ResponseEntity.ok(uz.rms.common.ApiResponse.success("Directory contents retrieved successfully", response))
    }

    @GetMapping("/{id}")
    @ResponseBody
    fun getMediaById(
        @PathVariable 
        @Parameter(description = "ID of the media to retrieve") 
        id: Long
    ): ResponseEntity<ByteArrayResource> {
        val media = mediaService.getMedia(id)
        val (fileData, contentType) = mediaService.getMediaFile(media.filePath)
        
        val resource = ByteArrayResource(fileData)
        
        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(contentType))
            .header(
                HttpHeaders.CONTENT_DISPOSITION,
                "inline; filename=\"${media.originalName}\""
            )
            .body(resource)
    }

    @Operation(
        summary = "Delete a media file",
        description = "Delete a media file by its ID (soft delete)"
    )
    @ApiResponses(
        value = [
            ApiResponse(
                responseCode = "204",
                description = "Media deleted successfully"
            ),
            ApiResponse(
                responseCode = "404",
                description = "Media not found",
                content = [Content(mediaType = "application/json")]
            )
        ]
    )
    @DeleteMapping("/{id}")
    fun deleteMedia(
        @PathVariable 
        @Parameter(description = "ID of the media to delete") 
        id: Long
    ): ResponseEntity<Void> {
        mediaService.deleteMedia(id)
        return ResponseEntity.noContent().build()
    }

    @Operation(
        summary = "Get media by type",
        description = "Retrieve media files filtered by MIME type"
    )
    @ApiResponse(
        responseCode = "200",
        description = "Successfully retrieved media files by type",
        content = [Content(mediaType = "application/json", schema = Schema(implementation = MediaListResponse::class))]
    )
    @GetMapping("/type/{type}")
    fun getMediaByType(
        @PathVariable
        @Parameter(description = "MIME type to filter by (e.g., image/jpeg, application/pdf)")
        type: String,
        
        @Parameter(
            description = "Pagination and sorting parameters",
            example = "{\"page\":0,\"size\":10,\"sort\":[\"createdAt,desc\"]}"
        )
        @PageableDefault(sort = ["createdAt"], direction = Sort.Direction.DESC, size = 10) 
        pageable: Pageable
    ): ResponseEntity<MediaListResponse> {
        val response = mediaService.getMediaByType(type, pageable)
        return ResponseEntity.ok(response)
    }
}
