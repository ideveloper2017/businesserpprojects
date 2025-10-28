package uz.rms.modules.v1.auth.dto

data class LoginRequest(
    val username: String,
    val password: String
)
