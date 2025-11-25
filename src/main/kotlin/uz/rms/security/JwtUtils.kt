package uz.rms.security

import io.jsonwebtoken.*
import io.jsonwebtoken.security.Keys
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.security.core.Authentication
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import org.springframework.stereotype.Component


import java.util.*
import javax.crypto.SecretKey

@Component
class JwtUtils(
    @Value("\${app.jwt.secret}")
    val jwtSecret: String,

    @Value("\${app.jwt.expiration}")
    private val accessTokenExpirationInMs: Long,
    @Value("\${app.jwt.refresh-expiration:2592000000}") // 30 days default
    private val refreshTokenExpirationInMs: Long,

    @Value("\${app.jwt.expiration:86400000}")
    private val jwtExpirationMs: Int
) {
    private val logger = LoggerFactory.getLogger(JwtUtils::class.java)
    private val key: SecretKey = Keys.hmacShaKeyFor(jwtSecret.toByteArray())

    fun validateJwtToken(authToken: String): Boolean {
        return try {
            Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(authToken)
            true
        } catch (e: Exception) {
            logger.error("Invalid JWT token: {}", e.message)
            false
        }
    }

    fun getUserNameFromJwtToken(token: String): String {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload
            .subject
    }

    fun getClaimsFromToken(token: String): Claims {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload as Claims
    }

    fun getAuthoritiesFromToken(token: String): Collection<GrantedAuthority> {
        val claims = getClaimsFromToken(token)
        val roles = claims.get("roles") as? List<*> ?: return emptyList()

        return roles.mapNotNull { role ->
            role?.let { SimpleGrantedAuthority(it.toString()) }
        }
    }

    fun generateJwtToken(authentication: Authentication): String {
        val principal = authentication.principal
        val (username, authorities) = when (principal) {
            is UserDetailsImpl -> principal.username to (principal.authorities?.map { it?.authority } ?: emptyList<String>())
            is UserDetails -> principal.username to principal.authorities.map { it.authority }
            else -> throw IllegalStateException("Unexpected principal type: ${principal.javaClass.name}")
        }

        return Jwts.builder()
            .subject(username)
            .claim("roles", authorities)
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + jwtExpirationMs))
            .signWith(key, Jwts.SIG.HS512)
            .compact()
    }


    fun generateRefreshToken(userDetails: UserDetails): String {
        val now = Date()
        val expiryDate = Date(now.time + refreshTokenExpirationInMs)
        val userDetailsImpl = userDetails as? UserDetailsImpl

        return Jwts.builder()
            .setSubject(userDetails.username)
            .claim("id", userDetailsImpl?.getId())
            .claim("type", "refresh")
            .setIssuedAt(now)
            .setExpiration(expiryDate)
            .signWith(key, SignatureAlgorithm.HS512)
            .compact()
    }

    fun generateTokenFromUsername(username: String): String {
        return Jwts.builder()
            .expiration(Date(Date().time + jwtExpirationMs))
            .signWith(key, Jwts.SIG.HS512)
            .compact()
    }

    fun getClaimsFromJwtToken(token: String): Claims {
        return Jwts.parser()
            .verifyWith(key)
            .build()
            .parseSignedClaims(token)
            .payload
    }

    fun getExpirationInSeconds(token: String): Long {
        return try {
            val claims = Jwts.parser()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .body

            (claims.expiration.time - Date().time) / 1000
        } catch (e: Exception) {
            0L
        }
    }



}
