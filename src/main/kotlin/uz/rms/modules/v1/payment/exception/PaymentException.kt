package uz.rms.modules.v1.payment.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

@ResponseStatus(HttpStatus.NOT_FOUND)
class PaymentNotFoundException(message: String) : RuntimeException(message)

@ResponseStatus(HttpStatus.BAD_REQUEST)
class PaymentValidationException(message: String) : RuntimeException(message)

@ResponseStatus(HttpStatus.CONFLICT)
class PaymentProcessingException(message: String) : RuntimeException(message)
