package uz.rms.modules.v1.auth.dto

data class SignupRequest(
    val username: String,
    val email: String,
    val password: String,
    val firstName: String,
    val lastName: String
)