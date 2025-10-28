package uz.rms.modules.v1.order.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import uz.rms.modules.v1.customer.model.Customer
import uz.rms.modules.v1.order.dto.OrderItemRequest
import uz.rms.modules.v1.order.model.Order
import uz.rms.modules.v1.order.model.OrderItem
import uz.rms.modules.v1.order.model.OrderStatus
import uz.rms.modules.v1.order.model.PaymentStatus as OrderPaymentStatus
import uz.rms.modules.v1.order.repository.OrderRepository
import uz.rms.modules.v1.users.domain.User
import java.math.BigDecimal
import java.time.LocalDateTime
import java.util.NoSuchElementException
import java.util.UUID

@Service
class OrderService(
    private val orderRepository: OrderRepository
) {

    @Transactional(readOnly = true)
    fun getOrderById(id: Long): Order? {
        return orderRepository.findByOrderNumber(id)
    }

    @Transactional(readOnly = true)
    fun getOrderByNumber(id: Long): Order? {
        return orderRepository.findByOrderNumber(id)
    }

    @Transactional(readOnly = true)
    fun getOrders(): List<Order> = orderRepository.findAllOrders();

    @Transactional(readOnly = true)
    fun searchOrders(
        startDate: LocalDateTime,
        endDate: LocalDateTime,
        status: OrderStatus?,
        paymentStatus: OrderPaymentStatus?,
        pageable: Pageable
    ): Page<Order> {
        return orderRepository.searchOrders(
            startDate = startDate,
            endDate = endDate,
            status = status,
            paymentStatus = paymentStatus,
            pageable = pageable
        )
    }

    @Transactional
    fun updateOrderStatus(orderId: Long, status: OrderStatus, notes: String? = null): Order {
        val order = orderRepository.findByIdOrNull(orderId)
            ?: throw NoSuchElementException("Order not found with id: $orderId")
        order.status = status
        return orderRepository.save(order)
    }

    @Transactional
    fun updatePaymentStatus(orderId: Long?, paymentStatus: OrderPaymentStatus, notes: String? = null): Order {
        val order = orderRepository.findByIdOrNull(orderId as Long)
            ?: throw NoSuchElementException("Order not found with id: $orderId")
        order.paymentStatus = paymentStatus
        return orderRepository.save(order)
    }

    @Transactional
    fun cancelOrder(orderId: UUID, reason: String? = null): Order {
        val order = orderRepository.findByIdWithItems(orderId)
            ?: throw NoSuchElementException("Order not found with id: $orderId")


        if (order.status == OrderStatus.CANCELLED) {
            throw IllegalStateException("Order is already cancelled")
        }


        if (order.status == OrderStatus.COMPLETED) {
            throw IllegalStateException("Cannot cancel a completed order")
        }


        // In a real application, you would:
        // 1. Restore product quantities if needed
        // 2. Process refund if payment was made
        // 3. Send notifications

        order.status = OrderStatus.CANCELLED
        return orderRepository.save(order)
    }
    
    @Transactional
    fun createOrder(
        customerId: Long,
        userId: Long,
        status: String = "pending",
        notes: String? = null,
        items: List<OrderItemRequest>
    ): Order {
        // Create new order
        val order = Order().apply {
            this.orderNumber = "ORD-${System.currentTimeMillis()}"
            this.user = User().apply { id = userId }
            this.customer = Customer().apply { id = customerId }
            this.status = OrderStatus.valueOf(status.uppercase())
            this.paymentStatus = OrderPaymentStatus.PENDING
            this.customerNotes = notes  // Using customerNotes instead of notes
            this.orderDate = LocalDateTime.now()
        }
        
        // Add order items
        items.forEach { item ->
            val orderItem = OrderItem().apply {
                this.order = order
                this.productId = item.productId
                this.quantity = item.quantity
                this.unitPrice = item.unitPrice
                this.discountAmount = BigDecimal.ZERO
                this.taxAmount = BigDecimal.ZERO
                this.calculateTotal()
            }
            order.items.add(orderItem)
        }
        
        // Calculate order totals
        order.calculateTotals()
        
        // Save the order
        return orderRepository.save(order)
    }
}
