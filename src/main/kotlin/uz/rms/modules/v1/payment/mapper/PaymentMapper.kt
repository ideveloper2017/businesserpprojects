package uz.rms.modules.v1.payment.mapper

import org.springframework.stereotype.Component
import uz.rms.modules.v1.order.model.Order
import uz.rms.modules.v1.payment.dto.CreatePaymentRequest
import uz.rms.modules.v1.payment.dto.PaymentDto
import uz.rms.modules.v1.payment.dto.UpdatePaymentRequest
import uz.rms.modules.v1.payment.model.Payment
import uz.rms.modules.v1.payment.model.PaymentStatus
import uz.rms.modules.v1.users.domain.User


@Component
class PaymentMapper {
    
    fun toDto(payment: Payment): PaymentDto {
        return PaymentDto(
            id = payment.id,
            orderId = payment.order.id.let { it ?: throw IllegalArgumentException("Order ID cannot be null") },
            amount = payment.amount,
            paymentMethod = payment.paymentMethod,
            status = payment.status,
            transactionId = payment.transactionId,
            notes = payment.notes,
            createdAt = payment.createdAt,
            updatedAt = payment.updatedAt
        )
    }
    
    fun toEntity(
        request: CreatePaymentRequest,
        order: Order,
        createdBy: User? = null
    ): Payment {
        return Payment(
            order = order,
            amount = request.amount,
            paymentMethod = request.paymentMethod,
            status = PaymentStatus.PENDING,
            notes = request.notes,
            transactionId = request.transactionId,
            createdBy = createdBy
        )
    }
    
    fun updateFromRequest(
        payment: Payment,
        request: UpdatePaymentRequest
    ): Payment {
        request.amount?.let { payment.amount = it }
        request.paymentMethod?.let { payment.paymentMethod = it }
        request.status?.let { payment.status = it }
        request.notes?.let { payment.notes = it }
        request.transactionId?.let { payment.transactionId = it }
        return payment
    }
}
