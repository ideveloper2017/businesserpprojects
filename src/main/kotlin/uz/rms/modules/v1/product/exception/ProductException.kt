package uz.rms.modules.v1.product.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

/**
 * Base exception for product-related errors
 */
@ResponseStatus(HttpStatus.BAD_REQUEST)
open class ProductException(message: String) : RuntimeException(message)

/**
 * Thrown when a product with the given SKU already exists
 */
@ResponseStatus(HttpStatus.CONFLICT)
class ProductAlreadyExistsException(sku: String) : 
    ProductException("Product with SKU '$sku' already exists")

/**
 * Thrown when a product with the given ID is not found
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
class ProductNotFoundException(id: Long) : 
    ProductException("Product with ID '$id' not found")

/**
 * Thrown when a product with the given SKU is not found
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
class ProductSkuNotFoundException(sku: String) : 
    ProductException("Product with SKU '$sku' not found")

/**
 * Thrown when a product operation is not allowed
 */
@ResponseStatus(HttpStatus.FORBIDDEN)
class ProductOperationNotAllowedException(message: String) : 
    ProductException(message)

/**
 * Thrown when there's insufficient stock for an operation
 */
@ResponseStatus(HttpStatus.CONFLICT)
class InsufficientStockException(
    productId: Long? = null,
    sku: String? = null,
    available: Int = 0,
    requested: Int = 0
) : ProductException(
    when {
        productId != null -> "Insufficient stock for product ID $productId (available: $available, requested: $requested)"
        sku != null -> "Insufficient stock for product with SKU $sku (available: $available, requested: $requested)"
        else -> "Insufficient stock (available: $available, requested: $requested)"
    }
)
