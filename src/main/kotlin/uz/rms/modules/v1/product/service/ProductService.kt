
package uz.rms.modules.v1.product.service

import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.web.multipart.MultipartFile
import uz.rms.modules.v1.product.dto.ProductResponse
import uz.rms.modules.v1.product.dto.request.CreateProductRequest
import uz.rms.modules.v1.product.dto.request.UpdateProductRequest


import java.math.BigDecimal

interface ProductService {
    fun createProduct(request: CreateProductRequest, image: MultipartFile? = null): ProductResponse
    fun getProductById(id: Long): ProductResponse
    fun getProductBySku(sku: String): ProductResponse
    fun updateProduct(id: Long, request: UpdateProductRequest, image: MultipartFile? = null): ProductResponse
    fun deleteProduct(id: Long)
    fun searchProducts(
        query: String? = null,
        categoryId: Long? = null,
        minPrice: BigDecimal? = null,
        maxPrice: BigDecimal? = null,
        minQuantity: Int? = null,
        maxQuantity: Int? = null,
        active: Boolean? = true,
        pageable: Pageable
    ): Page<ProductResponse>
    fun updateProductImage(productId: Long, image: MultipartFile): ProductResponse
    fun deleteProductImage(productId: Long): ProductResponse
    fun updateStock(productId: Long, quantityChange: Int): ProductResponse
}