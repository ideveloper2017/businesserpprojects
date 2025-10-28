package uz.idev.app.v1.payment.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import uz.rms.modules.v1.payment.mapper.PaymentMapper


@Configuration
class PaymentConfig {
    
    @Bean
    fun paymentMapper(): PaymentMapper {
        return PaymentMapper()
    }
}
