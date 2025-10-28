package uz.rms.modules.v1.units.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive
import uz.rms.modules.v1.units.model.Units

/**
 * Data Transfer Object for creating or updating a Unit
 */
@Schema(description = "Unit of measurement data transfer object")
data class UnitsDto(
    @field:NotBlank(message = "Unit code is required")
    @field:Schema(description = "Unique code for the unit (e.g., \"PCS\", \"KG\", \"L\")", 
                 example = "PCS", required = true)
    val code: String,

    @field:NotBlank(message = "Unit name is required")
    @field:Schema(description = "Full name of the unit (e.g., \"Piece\", \"Kilogram\", \"Liter\")", 
                 example = "Piece", required = true)
    val name: String,

    @field:NotNull(message = "Active status is required")
    @field:Schema(description = "Whether the unit is active and available for use", 
                 example = "true", required = true)
    val active: Boolean = true
) {
    /**
     * Converts this DTO to a Units entity
     */
    fun toEntity(): Units = Units().apply {
        code = this@UnitsDto.code
        name = this@UnitsDto.name
        active = this@UnitsDto.active
    }

    companion object {
        /**
         * Creates a DTO from a Units entity
         */
        fun fromEntity(units: Units): UnitsDto = UnitsDto(
            code = units.code ?: "",
            name = units.name ?: "",
            active = units.active
        )
    }
}

/**
 * Response DTO for Units with additional information
 */
@Schema(description = "Unit of measurement response object")
data class UnitsResponse(
    @field:Schema(description = "Unique identifier of the unit", example = "1", required = true)
    val id: Long,

    @field:Schema(description = "Unique code for the unit", example = "PCS", required = true)
    val code: String,

    @field:Schema(description = "Full name of the unit", example = "Piece", required = true)
    val name: String,

    @field:Schema(description = "Whether the unit is active", example = "true", required = true)
    val active: Boolean,

    @field:Schema(description = "Number of products using this unit", example = "42", required = true)
    val productCount: Int = 0
) {
    companion object {
        /**
         * Creates a response DTO from a Units entity
         */
        fun fromEntity(units: Units, productCount: Int = 0): UnitsResponse = UnitsResponse(
            id = units.id ?: throw IllegalStateException("Unit must have an ID"),
            code = units.code ?: "",
            name = units.name ?: "",
            active = units.active,
            productCount = productCount
        )
    }
}
