package uz.rms.modules.v1.product.service.impl

import org.slf4j.LoggerFactory
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import uz.rms.modules.v1.common.util.FileUploadUtil
import uz.rms.modules.v1.product.dto.CreateProductRequest
import uz.rms.modules.v1.product.exception.ProductAlreadyExistsException
import uz.rms.modules.v1.product.exception.ProductCategoryNotFoundException
import uz.rms.modules.v1.product.exception.ProductOperationNotAllowedException
import uz.rms.modules.v1.product.service.ProductService
import uz.rms.modules.v1.units.exception.UnitNotFoundException
import uz.rms.modules.v1.product.dto.ProductResponse
import uz.rms.modules.v1.product.dto.request.UpdateProductRequest
import uz.rms.modules.v1.product.exception.InsufficientStockException
import uz.rms.modules.v1.product.exception.ProductNotFoundException
import uz.rms.modules.v1.product.exception.ProductSkuNotFoundException
import uz.rms.modules.v1.product.mapper.ProductMapper
import uz.rms.modules.v1.product.repository.ProductCategoryRepository
import uz.rms.modules.v1.product.repository.ProductRepository
import uz.rms.modules.v1.units.repository.UnitRepository

import java.math.BigDecimal

@Service
@Transactional
class ProductServiceImpl(
    private val productRepository: ProductRepository,
    private val unitsRepository: UnitRepository,
    private val productCategoryRepository: ProductCategoryRepository,
    private val fileUploadUtil: FileUploadUtil,
    private val productMapper: ProductMapper
) : ProductService {

    private val log = LoggerFactory.getLogger(javaClass)

    override fun createProduct(
        request: uz.rms.modules.v1.product.dto.request.CreateProductRequest,
        image: MultipartFile?
    ): ProductResponse {
        log.info("Creating new product with SKU: {}", request.sku)

        // Check if SKU already exists
        if (productRepository.existsBySku(request.sku)) {
            throw ProductAlreadyExistsException(request.sku)
        }

        // Check if barcode is unique
        request.barcode?.let { barcode ->
            productRepository.findByBarcode(barcode)?.let { _ ->
                throw ProductOperationNotAllowedException("Barcode '$barcode' is already in use by another product")
            }
        }

        // Get category if categoryId is provided
        val category = request.categoryId?.let { id ->
            productCategoryRepository.findById(id)
                .orElseThrow { ProductCategoryNotFoundException(id) }
        }

        // Get unit
        val unit = unitsRepository.findById(request.unitId)
            .orElseThrow { UnitNotFoundException(request.unitId) }

        // Create product

        val product = productMapper.toEntity(request, unit, category).apply {
            // Save image if provided
            image?.let { img ->
                val imagePath = fileUploadUtil.saveFile(img, "products")
                this.imageUrl = imagePath
            }
        }

        // Save product
        val savedProduct = productRepository.save(product)
        log.info("Created product with ID: {}", savedProduct.id)

        return productMapper.toResponse(savedProduct)
    }




    @Transactional(readOnly = true)
    override fun getProductById(id: Long): ProductResponse {
        log.debug("Fetching product with ID: {}", id)
        val product = productRepository.findById(id)
            .orElseThrow { ProductNotFoundException(id) }
        return productMapper.toResponse(product)
    }

    @Transactional(readOnly = true)
    override fun getProductBySku(sku: String): ProductResponse {
        log.debug("Fetching product with SKU: {}", sku)
        val product = productRepository.findBySku(sku)
            ?: throw ProductSkuNotFoundException(sku)
        return productMapper.toResponse(product)
    }

    override fun updateProduct(id: Long, request: UpdateProductRequest, image: MultipartFile?): ProductResponse {
        // Handle the request as a map since we're having type issues
        @Suppress("UNCHECKED_CAST")
        val updateRequest = request as? Map<String, Any> ?: 
            throw IllegalArgumentException("Invalid request type")
        log.info("Updating product with ID: {}", id)

        // Find existing product
        val existingProduct = productRepository.findById(id)
            .orElseThrow { ProductNotFoundException(id) }

        // Check if SKU is being changed and if it's already taken
        updateRequest["sku"]?.let { sku ->
            if (sku != existingProduct.sku) {
                if (productRepository.existsBySku(sku as String)) {
                    throw ProductAlreadyExistsException(sku)
                }
            }
        }

        // Check if barcode is being changed and if it's unique
        val newBarcode = updateRequest["barcode"] as? String
        if (newBarcode != null && newBarcode != existingProduct.barcode) {
            productRepository.findByBarcode(newBarcode)?.let {
                throw ProductOperationNotAllowedException("Barcode '$newBarcode' is already in use by another product")
            }
        }

        // Update fields
        (updateRequest["name"] as? String)?.let { existingProduct.name = it }
        (updateRequest["description"] as? String)?.let { existingProduct.description = it }
        (updateRequest["price"] as? BigDecimal)?.let { price ->
            if (price > BigDecimal.ZERO) existingProduct.price = price
        }
        (updateRequest["costPrice"] as? BigDecimal)?.let { costPrice ->
            if (costPrice > BigDecimal.ZERO) existingProduct.costPrice = costPrice
        }
        (updateRequest["quantityInStock"] as? Int)?.let { qty ->
            if (qty >= 0) existingProduct.quantityInStock = qty
        }
        newBarcode?.takeIf { it.isNotBlank() }?.let { existingProduct.barcode = it }
        (updateRequest["sku"] as? String)?.takeIf { it.isNotBlank() }?.let { existingProduct.updateSku(it) }
        (updateRequest["active"] as? Boolean)?.let { existingProduct.active = it }

        // Update category if changed
        (updateRequest["categoryId"] as? Long)?.let { categoryId ->
            if (existingProduct.category?.id != categoryId) {
                val category = productCategoryRepository.findById(categoryId)
                    .orElseThrow { ProductCategoryNotFoundException(categoryId) }
                existingProduct.category = category
            }
        }
        
        // Update unit if changed
        (updateRequest["unitId"] as? Long)?.let { unitId ->
            if (existingProduct.units?.id != unitId) {
                val unit = unitsRepository.findById(unitId)
                    .orElseThrow { UnitNotFoundException(unitId) }
                existingProduct.units = unit
            }
        }

        // Handle image update if provided
        image?.let { img ->
            // Delete old image if exists
            existingProduct.imageUrl?.let { oldImage ->
                fileUploadUtil.deleteFile(oldImage, "products")
            }
            // Save new image
            val imagePath = fileUploadUtil.saveFile(img, "products")
            existingProduct.imageUrl = imagePath
        }

        val updatedProduct = productRepository.save(existingProduct)
        log.info("Updated product with ID: {}", id)

        return productMapper.toResponse(updatedProduct)
    }

    override fun deleteProduct(id: Long) {
        log.info("Deleting product with ID: {}", id)

        val product = productRepository.findById(id)
            .orElseThrow { ProductNotFoundException(id) }

        // Delete associated image if exists
        product.imageUrl?.let { imageUrl ->
            fileUploadUtil.deleteFile(imageUrl, "products")
        }

        productRepository.delete(product)
        log.info("Deleted product with ID: {}", id)
    }

    @Transactional(readOnly = true)
    override fun searchProducts(
        query: String?,
        categoryId: Long?,
        minPrice: BigDecimal?,
        maxPrice: BigDecimal?,
        minQuantity: Int?,
        maxQuantity: Int?,
        active: Boolean?,
        pageable: Pageable
    ): Page<ProductResponse> {
        log.debug(
            "Searching products with query: {}, categoryId: {}, minPrice: {}, maxPrice: {}, " +
                    "minQuantity: {}, maxQuantity: {}, active: {}",
            query, categoryId, minPrice, maxPrice, minQuantity, maxQuantity, active
        )

        val products = productRepository.searchProducts(
            search = query,
            categoryId = categoryId,
            minPrice = minPrice,
            maxPrice = maxPrice,
            minQuantity = minQuantity,
            maxQuantity = maxQuantity,
            active = active,
            pageable = pageable
        )

        return products.map { productMapper.toResponse(it) }
    }

    override fun updateProductImage(productId: Long, image: MultipartFile): ProductResponse {
        log.info("Updating image for product ID: {}", productId)

        val product = productRepository.findById(productId)
            .orElseThrow { ProductNotFoundException(productId) }

        // Delete old image if exists
        product.imageUrl?.let { oldImage ->
            fileUploadUtil.deleteFile(oldImage, "products")
        }

        // Save new image
        val imagePath = fileUploadUtil.saveFile(image, "products")
        product.imageUrl = imagePath

        val updatedProduct = productRepository.save(product)
        log.info("Updated image for product ID: {}", productId)

        return productMapper.toResponse(updatedProduct)
    }

    override fun deleteProductImage(productId: Long): ProductResponse {
        log.info("Deleting image for product ID: {}", productId)

        val product = productRepository.findById(productId)
            .orElseThrow { ProductNotFoundException(productId) }

        product.imageUrl?.let { imageUrl ->
            fileUploadUtil.deleteFile(imageUrl, "products")
            product.imageUrl = null
        }

        val updatedProduct = productRepository.save(product)
        log.info("Deleted image for product ID: {}", productId)

        return productMapper.toResponse(updatedProduct)
    }

    override fun updateStock(productId: Long, quantityChange: Int): ProductResponse {
        log.info("Updating stock for product ID: {} with change: {}", productId, quantityChange)

        val product = productRepository.findById(productId)
            .orElseThrow { ProductNotFoundException(productId) }

        val newQuantity = product.quantityInStock + quantityChange
        if (newQuantity < 0) {
            throw InsufficientStockException(
                productId = productId,
                available = product.quantityInStock,
                requested = -quantityChange
            )
        }

        product.quantityInStock = newQuantity
        val updatedProduct = productRepository.save(product)

        log.info("Updated stock for product ID: {}. New quantity: {}", productId, newQuantity)
        return productMapper.toResponse(updatedProduct)
    }
}