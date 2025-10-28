
package uz.rms.modules.v1.units.dto

import java.time.Instant

/**
 * DTO for transferring Unit data
 */
import com.fasterxml.jackson.annotation.JsonProperty
import java.time.LocalDateTime

data class UnitDto(
    val id: Long? = null,
    val code: String?,
    val name: String?,
    val active: Boolean?,
    
    @JsonProperty("createdAt")
    val createdAt: LocalDateTime?,
    
    @JsonProperty("updatedAt")
    val updatedAt: LocalDateTime?
) {
    constructor(code: String?, name: String?, active: Boolean, createdAt: LocalDateTime, updatedAt: LocalDateTime) : this(
        id = null,
        code = code ?: "",
        name = name ?: "",
        active = active,
        createdAt = createdAt,
        updatedAt = updatedAt
    )
}
