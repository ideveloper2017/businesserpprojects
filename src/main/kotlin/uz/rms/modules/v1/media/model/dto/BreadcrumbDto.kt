package uz.rms.modules.v1.media.model.dto

import io.swagger.v3.oas.annotations.media.Schema

/**
 * DTO representing a breadcrumb item in the navigation
 */
@Schema(description = "Breadcrumb item for navigation")
data class BreadcrumbDto(
    @field:Schema(description = "Display name of the breadcrumb", example = "documents")
    val name: String,
    
    @field:Schema(description = "Path segment for this breadcrumb", example = "documents")
    val path: String,
    
    @field:Schema(description = "Full path up to this breadcrumb", example = "documents/projects")
    val fullPath: String,
    
    @field:Schema(description = "Whether this is the last item in the breadcrumb trail", example = "false")
    val isLast: Boolean = false
)
