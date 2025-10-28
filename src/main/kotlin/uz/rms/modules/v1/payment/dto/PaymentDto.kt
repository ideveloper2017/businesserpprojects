package uz.rms.modules.v1.payment.dto

import uz.rms.modules.v1.payment.model.PaymentMethod
import uz.rms.modules.v1.payment.model.PaymentStatus
import java.math.BigDecimal
import java.time.LocalDateTime

data class PaymentDto(
    val id: Long?,
    val orderId: Long,
    val amount: BigDecimal,
    val paymentMethod: PaymentMethod,
    val status: PaymentStatus,
    val transactionId: String?,
    val notes: String?,
    val createdAt: LocalDateTime?,
    val updatedAt: LocalDateTime?
)

data class CreatePaymentRequest(
    val orderId: Long,
    val amount: BigDecimal,
    val paymentMethod: PaymentMethod,
    val notes: String? = null,
    val transactionId: String? = null
)

data class UpdatePaymentRequest(
    val amount: BigDecimal? = null,
    val paymentMethod: PaymentMethod? = null,
    val status: PaymentStatus? = null,
    val notes: String? = null,
    val transactionId: String? = null
)

data class PaymentResponse(
    val success: Boolean,
    val message: String? = null,
    val data: PaymentDto? = null
)

data class PaymentListResponse(
    val success: Boolean,
    val data: List<PaymentDto>,
    val total: Long,
    val page: Int,
    val size: Int
)
