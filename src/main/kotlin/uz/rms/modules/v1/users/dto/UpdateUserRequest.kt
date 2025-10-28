package uz.idev.app.v1.user.dto

import io.swagger.v3.oas.annotations.media.Schema
import jakarta.validation.constraints.Email
import jakarta.validation.constraints.Size
@Schema(description = "Role data transfer object")
data class UpdateUserRequest(
    @field:Email(message = "Email should be valid")
    val email: String,

    @field:Size(min = 6, message = "Password must be at least 6 characters", groups = [OnUpdate::class])
    val password: String? = null,

    val firstName: String?,

    val lastName: String?
)

// Validation group for update operations
interface OnUpdate
