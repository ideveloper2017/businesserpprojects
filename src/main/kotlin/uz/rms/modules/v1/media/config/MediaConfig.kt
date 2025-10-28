package uz.rms.modules.v1.media.config

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.UrlBasedCorsConfigurationSource
import org.springframework.web.filter.CorsFilter
import org.springframework.web.servlet.config.annotation.CorsRegistry
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer
import uz.rms.config.FileStorageProperties


@Configuration
@EnableConfigurationProperties(FileStorageProperties::class)
class MediaConfig : WebMvcConfigurer {
    
    @Bean
    fun fileStorageProperties(): FileStorageProperties {
        return FileStorageProperties()
    }
    
    override fun addResourceHandlers(registry: ResourceHandlerRegistry) {
        registry.addResourceHandler("/media/**")
            .addResourceLocations("file:${fileStorageProperties().uploadDir}/")
    }
    
    @Bean
    fun corsFilter(): CorsFilter {
        val source = UrlBasedCorsConfigurationSource()
        val config = CorsConfiguration()
        
        // Allow all origins, methods, and headers for development
        // In production, you should configure these to match your needs
        config.allowCredentials = true
        config.addAllowedOriginPattern("*")
        config.addAllowedHeader("*")
        config.addExposedHeader("Content-Disposition")
        config.addAllowedMethod("OPTIONS")
        config.addAllowedMethod("GET")
        config.addAllowedMethod("POST")
        config.addAllowedMethod("PUT")
        config.addAllowedMethod("DELETE")
        
        source.registerCorsConfiguration("/api/v1/media/**", config)
        return CorsFilter(source)
    }
    
    override fun addCorsMappings(registry: CorsRegistry) {
        registry.addMapping("/api/v1/media/**")
            .allowedOriginPatterns("*")
            .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
            .allowedHeaders("*")
            .exposedHeaders("Content-Disposition")
            .allowCredentials(true)
    }
}
