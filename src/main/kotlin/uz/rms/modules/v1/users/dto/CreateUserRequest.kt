package uz.idev.app.v1.user.dto

import jakarta.validation.constraints.Email
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class CreateUserRequest(
    @field:NotBlank(message = "Login is required")
    @field:Size(min = 3, max = 50, message = "Login must be between 3 and 50 characters")
    val login: String,

    @field:NotBlank(message = "Email is required")
    @field:Email(message = "Email should be valid")
    val email: String,

    @field:NotBlank(message = "Password is required")
    @field:Size(min = 6, message = "Password must be at least 6 characters")
    val password: String,


    @field:NotBlank(message = "Phone is required")
    @field:Size(min=12,max=12,message = "Phone should be valid")
    val phone: String,

    val firstName: String?,

    val lastName: String?,

    val roleName: String?
)
