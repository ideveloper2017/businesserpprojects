package uz.rms.security
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration
import org.springframework.security.access.expression.method.DefaultMethodSecurityExpressionHandler
import org.springframework.security.access.expression.method.MethodSecurityExpressionHandler
import org.springframework.security.authentication.dao.DaoAuthenticationProvider
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.core.userdetails.UserDetailsService
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.security.web.SecurityFilterChain
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(
    prePostEnabled = true,
    securedEnabled = true,
    jsr250Enabled = true
)
class WebSecurityConfig(
    @Autowired
    private val userDetailsService: UserDetailsService,

    @Autowired
    private val authEntryPointJwt: AuthEntryPointJwt,

    @Autowired
    private val authTokenFilter: AuthTokenFilter,

    @Autowired
    private val customPermissionEvaluator: CustomPermissionEvaluator
) {

    @Bean
    fun passwordEncoder(): PasswordEncoder {
        return BCryptPasswordEncoder()
    }

    @Bean
    fun authenticationProvider(): DaoAuthenticationProvider {
        val authProvider = DaoAuthenticationProvider()
        authProvider.setUserDetailsService(userDetailsService)
        authProvider.setPasswordEncoder(passwordEncoder())
        return authProvider
    }

    @Bean
    fun authenticationManager(config: AuthenticationConfiguration): AuthenticationManager {
        return config.authenticationManager
    }

    @Bean
    fun methodSecurityExpressionHandler(): MethodSecurityExpressionHandler {
        val expressionHandler = DefaultMethodSecurityExpressionHandler()
        expressionHandler.setPermissionEvaluator(customPermissionEvaluator)
        return expressionHandler
    }

    @Bean
    fun filterChain(http: HttpSecurity): SecurityFilterChain {
        http
            .cors { it.disable() }
            .csrf { it.disable() }
            .exceptionHandling { it.authenticationEntryPoint(authEntryPointJwt) }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests { auth ->
                // Public endpoints (including Swagger)
                auth.requestMatchers("/api/v1/auth/**").permitAll()
                auth.requestMatchers("/api/v1/public/**").permitAll()
                auth.requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
                auth.requestMatchers("/h2-console/**").permitAll()
                auth.requestMatchers("/actuator/**").permitAll()

                // Role-based access
                auth.requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
                auth.requestMatchers("/api/v1/manager/**").hasAnyRole("ADMIN", "MANAGER")
                auth.requestMatchers("/api/v1/user/**").hasAnyRole("ADMIN", "MANAGER", "USER")

//                // HTTP method restrictions
//                auth.requestMatchers(HttpMethod.GET, "/api/resources/**").hasAnyRole("USER", "MANAGER", "ADMIN")
//                auth.requestMatchers(HttpMethod.POST, "/api/resources/**").hasAnyRole("MANAGER", "ADMIN")
//                auth.requestMatchers(HttpMethod.PUT, "/api/resources/**").hasAnyRole("MANAGER", "ADMIN")
//                auth.requestMatchers(HttpMethod.DELETE, "/api/resources/**").hasRole("ADMIN")

                // All other requests need authentication
                auth.anyRequest().authenticated()
            }
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter::class.java)

        // For H2 Console (development only)
        http.headers { it.frameOptions().disable() }

        return http.build()
    }
}
