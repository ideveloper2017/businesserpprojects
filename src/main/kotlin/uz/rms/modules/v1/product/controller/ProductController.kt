// src/main/kotlin/uz/idev/app/v1/product/controller/ProductController.kt
package uz.rms.modules.v1.product.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.responses.ApiResponse as SwaggerApiResponse
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.web.PageableDefault
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.multipart.MultipartFile
import java.math.BigDecimal
import java.net.URI


import org.slf4j.LoggerFactory
import uz.rms.common.ApiResponse
import uz.rms.modules.v1.product.dto.ProductResponse
import uz.rms.modules.v1.product.dto.request.CreateProductRequest
import uz.rms.modules.v1.product.dto.request.UpdateProductRequest
import uz.rms.modules.v1.product.service.ProductService

@RestController
@RequestMapping("/api/v1/products")
@Tag(name = "Products", description = "Product management APIs")
class ProductController(
    private val productService: ProductService
) {
    private val logger = LoggerFactory.getLogger(ProductController::class.java)

    @PostMapping(
        consumes = [MediaType.APPLICATION_JSON_VALUE, MediaType.MULTIPART_FORM_DATA_VALUE],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    @Operation(
        summary = "Create a new product",
        description = "Creates a new product with the given details"
    )
    @SwaggerApiResponse(
        responseCode = "201",
        description = "Product created successfully",
        content = [Content(mediaType = "application/json", schema = Schema(implementation = ProductResponse::class))]
    )
    @SwaggerApiResponse(
        responseCode = "400",
        description = "Invalid input or missing required fields"
    )
    fun createProduct(
        @Parameter(description = "Product data", required = true)
        @Valid @RequestBody request: CreateProductRequest
    ): ResponseEntity<ApiResponse<ProductResponse>> {
        try {
            logger.info("Creating product: $request")
            val product = productService.createProduct(request, null)
            return ResponseEntity
                .created(URI.create("/api/v1/products/${product.id}"))
                .body(ApiResponse.success("Product created successfully", product))
        } catch (e: Exception) {
            logger.error("Error creating product: ${e.message}", e)
            throw e
        }
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Returns a single product by its ID")
    @SwaggerApiResponse(
        responseCode = "200",
        description = "Product found",
        content = [Content(mediaType = "application/json", schema = Schema(implementation = ProductResponse::class))]
    )
    @SwaggerApiResponse(responseCode = "404", description = "Product not found")
    fun getProductById(
        @Parameter(description = "ID of the product to retrieve", required = true)
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<ProductResponse>> {
        val product = productService.getProductById(id)
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product))
    }

    @GetMapping("/sku/{sku}")
    @Operation(summary = "Get product by SKU", description = "Returns a single product by its SKU")
    @SwaggerApiResponse(
        responseCode = "200",
        description = "Product found",
        content = [Content(mediaType = "application/json", schema = Schema(implementation = ProductResponse::class))]
    )
    @SwaggerApiResponse(responseCode = "404", description = "Product not found")
    fun getProductBySku(
        @Parameter(description = "SKU of the product to retrieve", required = true)
        @PathVariable sku: String
    ): ResponseEntity<ApiResponse<ProductResponse>> {
        val product = productService.getProductBySku(sku)
        return ResponseEntity.ok(ApiResponse.success("Product retrieved successfully", product))
    }

    @PutMapping(
        value = ["/{id}"],
        consumes = [MediaType.MULTIPART_FORM_DATA_VALUE, MediaType.APPLICATION_OCTET_STREAM_VALUE, "application/json"],
        produces = [MediaType.APPLICATION_JSON_VALUE]
    )
    @Operation(
        summary = "Update a product", 
        description = "Updates an existing product. The request should be sent as multipart/form-data with:\n" +
                "1. 'request' (required): A JSON string containing the product data to update\n" +
                "2. 'image' (optional): The new product image file"
    )
    @SwaggerApiResponse(
        responseCode = "200",
        description = "Product updated successfully",
        content = [Content(mediaType = "application/json", schema = Schema(implementation = ProductResponse::class))]
    )
    @SwaggerApiResponse(
        responseCode = "400",
        description = "Invalid input"
    )
    @SwaggerApiResponse(
        responseCode = "404",
        description = "Product not found"
    )
    fun updateProduct(
        @Parameter(description = "ID of the product to update", required = true)
        @PathVariable id: Long,

        @Parameter(description = "Updated product data as JSON string or form data", required = true)
        @RequestPart("request") @Valid request: UpdateProductRequest,

        @Parameter(description = "New product image file (optional)")
        @RequestPart(value = "image", required = false) image: MultipartFile?,

        requestEntity: org.springframework.http.HttpEntity<*>
    ): ResponseEntity<ApiResponse<ProductResponse>> {
        try {
            logger.info("Received update product request for id: $id. Content-Type: ${requestEntity.headers.contentType}")
            logger.info("Request parts: request=${request != null}, image=${image != null}")
            
            val product = productService.updateProduct(id, request, image)
            return ResponseEntity.ok(ApiResponse.success("Product updated successfully", product))
        } catch (e: Exception) {
            logger.error("Error updating product: ${e.message}", e)
            throw e
        }
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a product", description = "Deletes a product by its ID")
    @SwaggerApiResponse(responseCode = "204", description = "Product deleted successfully")
    @SwaggerApiResponse(responseCode = "404", description = "Product not found")
    fun deleteProduct(
        @Parameter(description = "ID of the product to delete", required = true)
        @PathVariable id: Long
    ): ResponseEntity<Void> {
        productService.deleteProduct(id)
        return ResponseEntity.noContent().build()
    }

    @GetMapping
    @Operation(summary = "Search products", description = "Searches products with pagination and filtering")
    @SwaggerApiResponse(
        responseCode = "200",
        description = "Products retrieved successfully",
        content = [Content(mediaType = "application/json", schema = Schema(implementation = Page::class))]
    )
    fun searchProducts(
        @Parameter(description = "Search query (searches in name, SKU, and description)")
        @RequestParam(required = false) query: String?,

        @Parameter(description = "Filter by category ID")
        @RequestParam(required = false) categoryId: Long?,

        @Parameter(description = "Filter by minimum price")
        @RequestParam(required = false) minPrice: BigDecimal?,

        @Parameter(description = "Filter by maximum price")
        @RequestParam(required = false) maxPrice: BigDecimal?,

        @Parameter(description = "Filter by minimum quantity in stock")
        @RequestParam(required = false) minQuantity: Int?,

        @Parameter(description = "Filter by maximum quantity in stock")
        @RequestParam(required = false) maxQuantity: Int?,

        @Parameter(description = "Filter by active status (default: true)")
        @RequestParam(required = false, defaultValue = "true") active: Boolean?,

        @Parameter(hidden = true)
        @PageableDefault(size = 20) pageable: Pageable
    ): ResponseEntity<ApiResponse<Page<ProductResponse>>> {
        val products = productService.searchProducts(
            query = query,
            categoryId = categoryId,
            minPrice = minPrice,
            maxPrice = maxPrice,
            minQuantity = minQuantity,
            maxQuantity = maxQuantity,
            active = active,
            pageable = pageable
        )
        return ResponseEntity.ok(ApiResponse.success("Products retrieved successfully", products))
    }

    @PostMapping("/{id}/image")
    @Operation(summary = "Update product image", description = "Updates the image of a product")
    @SwaggerApiResponse(
        responseCode = "200",
        description = "Product image updated successfully",
        content = [Content(mediaType = "application/json", schema = Schema(implementation = ProductResponse::class))]
    )
    @SwaggerApiResponse(responseCode = "404", description = "Product not found")
    fun updateProductImage(
        @Parameter(description = "ID of the product to update image for", required = true)
        @PathVariable id: Long,
        @Parameter(description = "Image file to upload", required = true)
        @RequestParam("image") image: MultipartFile
    ): ResponseEntity<ApiResponse<ProductResponse>> {
        val product = productService.updateProductImage(id, image)
        return ResponseEntity.ok(ApiResponse.success("Product image updated successfully", product))
    }

    @DeleteMapping("/{id}/image")
    @Operation(summary = "Delete product image", description = "Deletes the image of a product")
    @SwaggerApiResponse(
        responseCode = "200",
        description = "Product image deleted successfully",
        content = [Content(mediaType = "application/json", schema = Schema(implementation = ProductResponse::class))]
    )
    @SwaggerApiResponse(responseCode = "404", description = "Product not found or no image to delete")
    fun deleteProductImage(
        @Parameter(description = "ID of the product to delete image for", required = true)
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<ProductResponse>> {
        val product = productService.deleteProductImage(id)
        return ResponseEntity.ok(ApiResponse.success("Product image deleted successfully", product))
    }

    @PostMapping("/{id}/stock")
    @Operation(summary = "Update product stock", description = "Updates the stock quantity of a product")
    @SwaggerApiResponse(
        responseCode = "200",
        description = "Product stock updated successfully",
        content = [Content(mediaType = "application/json", schema = Schema(implementation = ProductResponse::class))]
    )
    @SwaggerApiResponse(responseCode = "400", description = "Insufficient stock")
    @SwaggerApiResponse(responseCode = "404", description = "Product not found")
    fun updateStock(
        @Parameter(description = "ID of the product to update stock for", required = true)
        @PathVariable id: Long,

        @Parameter(description = "Quantity to add (positive) or subtract (negative)", required = true)
        @RequestParam quantityChange: Int
    ): ResponseEntity<ApiResponse<ProductResponse>> {
        val product = productService.updateStock(id, quantityChange)
        return ResponseEntity.ok(
            ApiResponse.success(
                "Product stock updated successfully. New quantity: ${product.quantityInStock}",
                product
            )
        )
    }
}