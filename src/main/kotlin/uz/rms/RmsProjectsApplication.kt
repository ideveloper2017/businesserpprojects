package uz.rms

import jakarta.annotation.PostConstruct
import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.builder.SpringApplicationBuilder
import org.springframework.boot.runApplication
import org.springframework.boot.web.servlet.support.SpringBootServletInitializer
import java.util.TimeZone

@SpringBootApplication(scanBasePackages = ["uz.rms", "uz.rms.modules.v1.users.repository"])
class RmsProjectsApplication: SpringBootServletInitializer() {

    override fun configure(application: SpringApplicationBuilder): SpringApplicationBuilder {
        return application.sources(RmsProjectsApplication::class.java)
    }
}

fun main(args: Array<String>) {
    @PostConstruct
    fun init() {
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"))
    }
    runApplication<RmsProjectsApplication>(*args)
}
