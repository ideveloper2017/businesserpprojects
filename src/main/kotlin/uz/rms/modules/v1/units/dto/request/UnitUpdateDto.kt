package uz.rms.modules.v1.units.dto.request

import jakarta.validation.constraints.NotBlank

/**
 * DTO for updating an existing unit
 */
data class UnitUpdateDto(
    @field:NotBlank(message = "Unit code is required")
    val code: String,
    
    @field:NotBlank(message = "Unit name is required")
    val name: String,

    @field:NotBlank(message = "Unit active is required")
    val active: Boolean
)
