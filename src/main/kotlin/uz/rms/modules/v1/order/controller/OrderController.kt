package uz.rms.modules.v1.order.controller


import org.springframework.data.domain.Pageable
import org.springframework.data.domain.Sort
import org.springframework.data.web.PageableDefault
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.security.core.annotation.AuthenticationPrincipal
import org.springframework.web.bind.annotation.*
import org.springframework.web.servlet.support.ServletUriComponentsBuilder
import java.net.URI
import java.time.LocalDateTime
import java.util.*

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.responses.ApiResponse as SwaggerResponse
import io.swagger.v3.oas.annotations.tags.Tag
import uz.rms.modules.v1.order.dto.CreateOrderRequest
import uz.rms.modules.v1.order.dto.OrderDto
import uz.rms.modules.v1.order.dto.OrderItemDto
import uz.rms.modules.v1.order.service.OrderService
import uz.rms.modules.v1.order.model.Order
import uz.rms.modules.v1.order.model.OrderItem
import uz.rms.modules.v1.order.model.OrderStatus
import uz.rms.modules.v1.order.model.PaymentStatus
import uz.rms.modules.v1.user.dto.UserDto
import jakarta.validation.Valid
import org.springframework.data.domain.PageRequest
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.transaction.annotation.Transactional
import uz.idev.app.security.CurrentUser
import uz.rms.common.ApiResponse
import uz.rms.modules.common.PaginatedResponse
import uz.rms.modules.v1.customer.dto.CustomerDto
import uz.rms.modules.v1.product.dto.ProductDto
import uz.rms.modules.v1.users.domain.User

@RestController
@RequestMapping("/api/v1/orders")
@Tag(name = "Orders", description = "Operations for managing orders")
class OrderController(
    private val orderService: OrderService
) {
    
    @PostMapping
    @Operation(
        summary = "Create a new order",
        description = "Creates a new order with the provided items",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            SwaggerResponse(
                responseCode = "201",
                description = "Order created successfully",
                content = [Content(mediaType = "application/json", 
                    schema = Schema(implementation = OrderDto::class))]
            ),
            SwaggerResponse(
                responseCode = "400",
                description = "Invalid input data"
            ),
            SwaggerResponse(
                responseCode = "401",
                description = "Unauthorized - user not authenticated"
            )
        ]
    )
    @PreAuthorize("isAuthenticated()")
    fun createOrder(
        @Parameter(
            description = "Authenticated user (automatically injected)",
            hidden = true
        )
        @CurrentUser user: User?,

        @Parameter(
            description = "Order details",
            required = true
        )
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Order creation request",
            required = true,
            content = [
                Content(
                    mediaType = "application/json",
                    schema = Schema(implementation = CreateOrderRequest::class)
                )
            ]
        )
        @Valid @RequestBody request: CreateOrderRequest
    ): ResponseEntity<Any> {
        val userId = user?.id ?: return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
            .body(mapOf("error" to "Authentication required"))

        return try {
            val order = orderService.createOrder(
                customerId = request.customerId,
                userId = userId,
                status = request.status,
                notes = request.notes,
                items = request.items
            )

            val location: URI = ServletUriComponentsBuilder
                .fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(order.id)
                .toUri()

            ResponseEntity.created(location).body(toDto(order))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(mapOf("error" to (e.message ?: "Failed to create order")))
        }
    }

    @GetMapping
    @Operation(
        summary = "Get all orders",
        description = "Retrieves a paginated list of all orders (admin only)",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            SwaggerResponse(
                responseCode = "200",
                description = "Successfully retrieved all orders",
                content = [Content(
                    mediaType = "application/json",
                    schema = Schema(implementation = ApiResponse::class)
                )]
            ),
            SwaggerResponse(
                responseCode = "401",
                description = "Unauthorized - authentication required"
            ),
            SwaggerResponse(
                responseCode = "403",
                description = "Forbidden - admin access required"
            ),
            SwaggerResponse(
                responseCode = "500",
                description = "Internal server error"
            )
        ]
    )

    fun getAllOrders(

    ): ResponseEntity<ApiResponse<List<OrderDto>>> {
        return try {
            val orders = orderService.getOrders()
            ResponseEntity.ok(ApiResponse.success(toDtoList(orders)))
        } catch (e: Exception) {
            ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.error("Failed to retrieve orders: ${e.message}"))
        }
    }

    @GetMapping("/all")
    @Operation(
        summary = "Get all orders (Admin only)",
        description = "Retrieves a paginated list of all orders in the system. Requires ADMIN role.",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            SwaggerResponse(
                responseCode = "200",
                description = "Successfully retrieved orders",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ApiResponse::class)
                    )
                ]
            ),
            SwaggerResponse(
                responseCode = "401",
                description = "Unauthorized - authentication required"
            ),
            SwaggerResponse(
                responseCode = "403",
                description = "Forbidden - requires ADMIN role"
            )
        ]
    )
    @PreAuthorize("hasRole('ADMIN')")
    fun getAllOrders(
        @Parameter(description = "Page number (0-based)", example = "0")
        @RequestParam(defaultValue = "0") page: Int,
        @Parameter(description = "Number of items per page", example = "20")
        @RequestParam(defaultValue = "20") size: Int,
        @Parameter(description = "Sort by field (e.g., 'orderDate,desc')", example = "orderDate,desc")
        @RequestParam(required = false) sort: String? = null
    ): ResponseEntity<ApiResponse<List<Order>>?> {
            val response = orderService.getOrders();
            return ResponseEntity.ok(ApiResponse.success(response))
    }
    
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    @Operation(
        summary = "Get order by ID",
        description = "Retrieves a specific order by its ID for the authenticated user",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            SwaggerResponse(
                responseCode = "200",
                description = "Successfully retrieved the order",
                content = [Content(mediaType = "application/json", 
                    schema = Schema(implementation = ApiResponse::class))]
            ),
            SwaggerResponse(responseCode = "404", description = "Order not found"),
            SwaggerResponse(responseCode = "403", description = "Forbidden - order belongs to another user"),
            SwaggerResponse(responseCode = "401", description = "Unauthorized - user not authenticated")
        ]
    )
    fun getOrderById(
        @Parameter(description = "Order ID", required = true)
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<OrderDto>> {
        val order = orderService.getOrderById(id)
            ?: return ResponseEntity.notFound().build()
            

        
        return ResponseEntity.ok(ApiResponse.success(toDto(order)))
    }
    
    @GetMapping("/search")
    @Operation(
        summary = "Search orders",
        description = "Search for orders based on date range, status and payment status",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            SwaggerResponse(
                responseCode = "200",
                description = "Successfully retrieved orders matching search criteria",
                content = [Content(mediaType = "application/json", 
                    schema = Schema(implementation = ApiResponse::class))]
            ),
            SwaggerResponse(responseCode = "400", description = "Invalid search parameters"),
            SwaggerResponse(responseCode = "401", description = "Unauthorized - user not authenticated")
        ]
    )
    fun searchOrders(
        @Parameter(description = "Start date for order search (ISO format)", required = true)
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) startDate: LocalDateTime,

        @Parameter(description = "End date for order search (ISO format)", required = true)
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) endDate: LocalDateTime,

        @Parameter(description = "Filter by order status", schema = Schema(implementation = OrderStatus::class))
        @RequestParam(required = false) status: OrderStatus?,

        @Parameter(description = "Filter by payment status", schema = Schema(implementation = PaymentStatus::class))
        @RequestParam(required = false) paymentStatus: PaymentStatus?,

        @PageableDefault(sort = ["orderDate"], direction = Sort.Direction.DESC) pageable: Pageable
    ): ResponseEntity<ApiResponse<PaginatedResponse<OrderDto>>> {
        val page = orderService.searchOrders(
            startDate = startDate,
            endDate = endDate,
            status = status,
            paymentStatus = paymentStatus,
            pageable = pageable
        )
        
        val response = PaginatedResponse(
            content = toDtoList(page.content),
            page = page.number,
            size = page.size,
            totalElements = page.totalElements,
            totalPages = page.totalPages
        )
        
        return ResponseEntity.ok(ApiResponse.success(response))
    }
    
    @PostMapping("/{orderId}/cancel")
    @Transactional(readOnly = true)
    @Operation(
        summary = "Cancel an order",
        description = "Cancels a user's order with optional reason",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            SwaggerResponse(
                responseCode = "200",
                description = "Order successfully cancelled",
                content = [Content(mediaType = "application/json", 
                    schema = Schema(implementation = ApiResponse::class))]
            ),
            SwaggerResponse(responseCode = "404", description = "Order not found"),
            SwaggerResponse(responseCode = "403", description = "Forbidden - order belongs to another user"),
            SwaggerResponse(responseCode = "401", description = "Unauthorized - user not authenticated")
        ]
    )
    fun cancelOrder(
        @Parameter(description = "Authenticated user", hidden = true)
        @AuthenticationPrincipal user: User,

        @Parameter(description = "Order UUID to cancel", required = true)
        @PathVariable orderId: UUID,

        @Parameter(description = "Cancellation details")
        @RequestBody(required = false) request: CancelOrderRequest?
    ): ResponseEntity<ApiResponse<OrderDto>> {
        val order = orderService.cancelOrder(orderId, request?.reason)
        
        // Verify the order belongs to the user (or proper authorization)
        if (order.user.id != user.id) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }
        
        return ResponseEntity.ok(ApiResponse.success(toDto(order)))
    }
    
    @PutMapping("/{orderId}/status")
    @Operation(
        summary = "Update order status",
        description = "Updates the status of an order",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            SwaggerResponse(
                responseCode = "200",
                description = "Order status successfully updated",
                content = [Content(mediaType = "application/json", 
                    schema = Schema(implementation = ApiResponse::class))]
            ),
            SwaggerResponse(responseCode = "404", description = "Order not found"),
            SwaggerResponse(responseCode = "400", description = "Invalid status update request"),
            SwaggerResponse(responseCode = "401", description = "Unauthorized - user not authenticated")
        ]
    )
    fun updateOrderStatus(
        @Parameter(description = "Order ID to update", required = true)
        @PathVariable orderId: Long,

        @Parameter(description = "Status update details", required = true)
        @RequestBody request: UpdateStatusRequest
    ): ResponseEntity<ApiResponse<Order>> {
        val order = orderService.updateOrderStatus(
            orderId = orderId,
            status = request.status,
            notes = request.notes
        )
        return ResponseEntity.ok(ApiResponse.success(order))
    }
    
    @PutMapping("/{orderId}/payment-status")
    @Operation(
        summary = "Update payment status",
        description = "Updates the payment status of an order",
        security = [SecurityRequirement(name = "bearerAuth")],
        responses = [
            SwaggerResponse(
                responseCode = "200",
                description = "Payment status successfully updated",
                content = [Content(mediaType = "application/json", 
                    schema = Schema(implementation = ApiResponse::class))]
            ),
            SwaggerResponse(responseCode = "404", description = "Order not found"),
            SwaggerResponse(responseCode = "400", description = "Invalid payment status update request"),
            SwaggerResponse(responseCode = "401", description = "Unauthorized - user not authenticated")
        ]
    )
    fun updatePaymentStatus(
        @Parameter(description = "Order ID to update", required = true)
        @PathVariable orderId: Long,

        @Parameter(description = "Payment status update details", required = true)
        @RequestBody request: UpdatePaymentStatusRequest
    ): ResponseEntity<ApiResponse<Order>> {
        val order = orderService.updatePaymentStatus(
            orderId = orderId,
            paymentStatus = request.paymentStatus,
            notes = request.notes
        )
        return ResponseEntity.ok(ApiResponse.success(order))
    }
}

@Schema(description = "Request for updating order status")
data class UpdateStatusRequest(
    @Schema(description = "New order status", required = true)
    val status: OrderStatus,

    @Schema(description = "Optional notes about status change", example = "Customer requested status change via phone")
    val notes: String? = null
)

@Schema(description = "Request for updating payment status")
data class UpdatePaymentStatusRequest(
    @Schema(description = "New payment status", required = true)
    val paymentStatus: PaymentStatus,

    @Schema(description = "Optional notes about payment status change", example = "Payment confirmed via bank transfer")
    val notes: String? = null
)

@Schema(description = "Request for cancelling an order")
data class CancelOrderRequest(
    @Schema(description = "Reason for cancellation", example = "Items no longer needed")
    val reason: String? = null
)

// Mapping helpers (simple, avoids external mapper dependency)
private fun toDto(order: Order): OrderDto = OrderDto(
    id = order.id,
    orderNumber = order.orderNumber,
    user = UserDto.fromUser(order.user),
    items = order.items.map { toDto(it) },
    customer = order.customer.let { CustomerDto.toDto(it) },
    subtotal = order.subtotal,
    taxAmount = order.taxAmount,
    discountAmount = order.discountAmount,
    totalAmount = order.totalAmount,
    orderDate = order.orderDate,
    status = order.status,
    paymentStatus = order.paymentStatus,
    customerNotes = order.customerNotes,
    createdAt = order.createdAt,
    updatedAt = order.updatedAt
)

private fun toDto(item: OrderItem) = OrderItemDto(
    productId = item.productId,
    product = item.product?.let { ProductDto.fromEntity(it) },
    quantity = item.quantity,
    unitPrice = item.unitPrice,
    totalPrice = item.totalPrice,
)

private fun toDtoList(orders: List<Order>) = orders.map { toDto(it) }
