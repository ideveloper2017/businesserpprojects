package uz.rms.modules.v1.order.model

import uz.rms.modules.v1.users.domain.User
import jakarta.persistence.*
import java.math.BigDecimal
import java.time.LocalDateTime
import io.swagger.v3.oas.annotations.media.Schema
import uz.rms.common.BaseEntity
import uz.rms.modules.v1.customer.model.Customer

@Entity
@Table(name = "orders")
@Schema(description = "Represents an order in the system")
class Order : BaseEntity() {
    @Schema(description = "Unique order number/identifier", example = "ORD-2025-12345")
    @Column(name = "order_number", nullable = false, unique = true)
    lateinit var orderNumber: String

    @Schema(description = "User who placed the order")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    lateinit var user: User


    @Schema(description = "Customer who placed the order")
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    lateinit var customer: Customer

    
    @OneToMany(mappedBy = "order", cascade = [CascadeType.ALL], orphanRemoval = true)
    val items: MutableList<OrderItem> = mutableListOf()
    
    @Column(name = "subtotal", nullable = false, precision = 10, scale = 2)
    var subtotal: BigDecimal = BigDecimal.ZERO
    
    @Column(name = "tax_amount", nullable = false, precision = 10, scale = 2)
    var taxAmount: BigDecimal = BigDecimal.ZERO
    
    @Column(name = "discount_amount", nullable = false, precision = 10, scale = 2)
    var discountAmount: BigDecimal = BigDecimal.ZERO
    
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    var totalAmount: BigDecimal = BigDecimal.ZERO
    
    @Column(name = "order_date", nullable = false)
    var orderDate: LocalDateTime = LocalDateTime.now()
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: OrderStatus = OrderStatus.PENDING
    
    @Column(name = "payment_status", nullable = false)
    @Enumerated(EnumType.STRING)
    var paymentStatus: PaymentStatus = PaymentStatus.PENDING
    
    @Column(name = "customer_notes")
    var customerNotes: String? = null
    

    fun calculateTotals() {
        subtotal = items.sumOf { it.totalPrice }
        totalAmount = subtotal + taxAmount - discountAmount
    }
}

@Schema(description = "Status of an order in the processing workflow")
enum class OrderStatus {
    @Schema(description = "Order has been created but processing hasn't started")
    PENDING,

    @Schema(description = "Order is being processed")
    PROCESSING,

    @Schema(description = "Order has been fulfilled completely")
    COMPLETED,

    @Schema(description = "Order has been cancelled")
    CANCELLED,

    @Schema(description = "Order has been refunded")
    REFUNDED
}


@Schema(description = "Status of payment for an order")
enum class PaymentStatus {
    @Schema(description = "Payment is pending")
    PENDING,

    @Schema(description = "Payment has been authorized but not captured")
    AUTHORIZED,

    @Schema(description = "Payment is complete")
    PAID,

    @Schema(description = "Payment has been refunded fully")
    REFUNDED,

    @Schema(description = "Payment has been partially refunded")
    PARTIALLY_REFUNDED,

    @Schema(description = "Payment has been voided")
    VOIDED,

    @Schema(description = "Payment attempt failed")
    FAILED
}
