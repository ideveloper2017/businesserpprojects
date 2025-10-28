package uz.rms.modules.v1.auth.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.Valid
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import uz.rms.common.MessageResponse
import uz.rms.modules.v1.audit.services.AuditService
import uz.rms.modules.v1.auth.dto.AuthResponse
import uz.rms.modules.v1.auth.dto.LoginRequest
import uz.rms.modules.v1.auth.dto.SignupRequest
import uz.rms.modules.v1.users.dto.PermissionDto
import uz.rms.modules.v1.users.dto.RoleDto
import uz.rms.modules.v1.users.dto.UserInfo
import uz.rms.modules.v1.users.repository.UserRepository
import uz.rms.security.JwtUtils


@Tag(name = "Authentication", description = "Authentication and user management APIs")
@RestController
@RequestMapping("/api/v1/auth")
class AuthenticationController(
    @Autowired
    private val authenticationManager: AuthenticationManager,

    private val userRepository: UserRepository,
    @Autowired
    private val jwtUtils: JwtUtils,
    @Autowired
    private val auditService: AuditService,
    @Autowired
    private val encoder: PasswordEncoder,
) {

    @Operation(summary = "User login", description = "Authenticate user and return JWT token")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Login successful", content = [Content(schema = Schema(implementation = AuthResponse::class))]),
        ApiResponse(responseCode = "401", description = "Invalid credentials", content = [Content(schema = Schema(implementation = MessageResponse::class))]),
        ApiResponse(responseCode = "400", description = "Invalid request", content = [Content(schema = Schema(implementation = MessageResponse::class))])
    )
    @PostMapping("/signin")
    fun authenticateUser(@Valid @RequestBody loginRequest: LoginRequest, request: HttpServletRequest): ResponseEntity<AuthResponse> {
        try {
            val authentication: Authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken(
                    loginRequest.username,
                    loginRequest.password
                )
            )

            SecurityContextHolder.getContext().authentication = authentication
            val jwt = jwtUtils.generateJwtToken(authentication)

            val userDetails = authentication.principal as UserDetails
            val user = userRepository.findByLogin(userDetails.username).orElse(null)

            // Log successful login

            auditService.logSuccessfulLogin(user?.id, userDetails.username, request)
            //       roles = userDetails.authorities.map { it.authority }.filter { it.startsWith("ROLE_") },
            //       permissions = userDetails.authorities.map { it.authority }.filter { !it.startsWith("ROLE_") }

            return ResponseEntity.ok(
                AuthResponse(
                    token = jwt,
                    type = "Bearer",
                    id = user?.id,
                    username = userDetails.username,
                    email = user?.email ?: "",
                    roles = user.roles.map { RoleDto(it.id, it.name, it.description) },
                    permissions = user.permissions.map {
                        PermissionDto(it.id, it.name, it.description, it.resource, it.action)
                    }
                )
            )
        } catch (e: Exception) {
            // Log failed login
            auditService.logFailedLogin(loginRequest.username, request, e.message)
            throw e
        }
    }

    @Operation(summary = "User registration", description = "Register a new user account")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Registration successful", content = [Content(schema = Schema(implementation = MessageResponse::class))]),
        ApiResponse(responseCode = "400", description = "Username or email already exists", content = [Content(schema = Schema(implementation = MessageResponse::class))])
    )
    @PostMapping("/signup")
    fun registerUser(@Valid @RequestBody signUpRequest: SignupRequest): ResponseEntity<MessageResponse> {
        if (userRepository.existsByLogin(signUpRequest.username)) {
            return ResponseEntity.badRequest()
                .body(MessageResponse("Error: Username is already taken!"))
        }

        if (userRepository.existsByEmail(signUpRequest.email)) {
            return ResponseEntity.badRequest()
                .body(MessageResponse("Error: Email is already in use!"))
        }

        // Create new user account (without roles for now - admin will assign roles)
//        val user = User(
//            login = signUpRequest.username,
//            email = signUpRequest.email,
//            passwords = encoder.encode(signUpRequest.password),
//            firstName = signUpRequest.firstName,
//            lastName = signUpRequest.lastName,
//            enabled = true,
//            accountNonExpired = true,
//            accountNonLocked = true,
//            credentialsNonExpired = true
//        )
//
//        userRepository.save(user)

        return ResponseEntity.ok(MessageResponse("User registered successfully!"))
    }

    @Operation(summary = "User logout", description = "Sign out current user")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Logout successful", content = [Content(schema = Schema(implementation = MessageResponse::class))])
    )
    @PostMapping("/signout")
    fun logoutUser(): ResponseEntity<MessageResponse> {
        SecurityContextHolder.clearContext()
        return ResponseEntity.ok(MessageResponse("You've been signed out!"))
    }

    @Operation(summary = "Get current user", description = "Get information about the currently authenticated user")
    @ApiResponses(
        ApiResponse(responseCode = "200", description = "Current user information", content = [Content(schema = Schema(implementation = UserInfo::class))]),
        ApiResponse(responseCode = "401", description = "User not authenticated", content = [Content(schema = Schema(implementation = MessageResponse::class))])
    )
    @GetMapping("/me")
    fun getCurrentUser(): ResponseEntity<UserInfo> {
        val authentication = SecurityContextHolder.getContext().authentication
        val userDetails = authentication.principal as UserDetails
        val user = userRepository.findByLogin(userDetails.username).orElse(null)

        return ResponseEntity.ok(
            UserInfo(
                id = user?.id,
                username = userDetails.username,
                email = user?.email ?: "",
                firstName = user?.firstName ?: "",
                lastName = user?.lastName ?: "",
                roles = user.roles.map { RoleDto(it.id, it.name, it.description) },
                permissions = user.permissions.map {
                    PermissionDto(it.id, it.name, it.description, it.resource, it.action)
                }
            )
        )
    }
}








