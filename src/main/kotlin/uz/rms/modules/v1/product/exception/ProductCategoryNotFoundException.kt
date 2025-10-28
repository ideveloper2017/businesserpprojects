package uz.rms.modules.v1.product.exception

import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.ResponseStatus

/**
 * Exception thrown when a product category with the given ID is not found
 */
@ResponseStatus(HttpStatus.NOT_FOUND)
class ProductCategoryNotFoundException(id: Long) : 
    ProductException("Product category with ID '$id' not found")
