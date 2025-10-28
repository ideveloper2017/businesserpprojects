package uz.rms.modules.v1.product.controller

import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.media.Content
import io.swagger.v3.oas.annotations.media.Schema
import io.swagger.v3.oas.annotations.security.SecurityRequirement
import io.swagger.v3.oas.annotations.tags.Tag
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse as SwaggerApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses as SwaggerApiResponses
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*
import uz.rms.common.ApiResponse
import uz.rms.modules.v1.product.exception.ResourceNotFoundException
import uz.rms.modules.v1.product.dto.CreateProductCategoryRequest
import uz.rms.modules.v1.product.dto.ProductCategoryResponse
import uz.rms.modules.v1.product.dto.SimpleCategoryResponse
import uz.rms.modules.v1.product.dto.UpdateProductCategoryRequest
import uz.rms.modules.v1.product.mapper.ProductCategoryMapper
import uz.rms.modules.v1.product.service.ProductCategoryService

/**
 * REST controller for managing product categories.
 */
@RestController
@RequestMapping(
    value = ["/api/v1/categories"],
    produces = [MediaType.APPLICATION_JSON_VALUE]
)
@Tag(name = "Product Categories", description = "Operations pertaining to product categories in the system")
@SecurityRequirement(name = "bearerAuth")
class ProductCategoryController(
    private val categoryService: ProductCategoryService,
    private val categoryMapper: ProductCategoryMapper
) {
    
    @GetMapping("/tree-with-details")
    @Operation(
        summary = "Get category tree with details",
        description = "Returns a hierarchical tree of all product categories with full details"
    )
    @SwaggerApiResponses(
        value = [
            SwaggerApiResponse(
                responseCode = "200",
                description = "Successfully retrieved category tree with details",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ProductCategoryResponse::class)
                    )
                ]
            )
        ]
    )
    @Transactional(readOnly = true)
    fun getCategoryTreeWithDetails(
        @RequestParam(required = false, defaultValue = "false") includeInactive: Boolean
    ): ResponseEntity<ApiResponse<List<ProductCategoryResponse>>> {
        val categories = categoryService.getCategoryTree(includeInactive)
        val rootCategories = categories.filter { it.parent == null }
        val response = rootCategories.map { categoryMapper.toResponse(it, true) }
        return ResponseEntity.ok(ApiResponse.success(response))
    }

    @GetMapping
    @Operation(
        summary = "Get all categories",
        description = "Returns a flat list of all product categories in the system"
    )
    @SwaggerApiResponses(
        value = [
            SwaggerApiResponse(
                responseCode = "200",
                description = "Successfully retrieved list of categories",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ApiResponse::class)
                    )
                ]
            )
        ]
    )
    @Transactional(readOnly = true)
    fun getAllCategories(
        @RequestParam(required = false, defaultValue = "false") includeInactive: Boolean = false
    ): ResponseEntity<ApiResponse<List<ProductCategoryResponse>>> =
        ResponseEntity.ok(
            ApiResponse.success(
                data = categoryMapper.toResponseList(
                    if (includeInactive) categoryService.getAllCategories(true)
                    else categoryService.getActiveCategories()
                ),
                message = "Categories retrieved successfully"
            )
        )
    
    @GetMapping("/{id}")
    @Operation(
        summary = "Get category by ID",
        description = "Returns a single category by its unique identifier"
    )
    @SwaggerApiResponses(
        value = [
            SwaggerApiResponse(
                responseCode = "200",
                description = "Successfully retrieved category",
                content = [Content(mediaType = "application/json", schema = Schema(implementation = ApiResponse::class))]
            ),
            SwaggerApiResponse(
                responseCode = "404",
                description = "Category not found"
            )
        ]
    )
    @Transactional(readOnly = true)
    fun getCategoryById(
        @Parameter(description = "ID of the category to be obtained. Cannot be empty.")
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<ProductCategoryResponse>> {
        val category = categoryService.getCategoryById(id)
        return ResponseEntity.ok(
            ApiResponse.success(
                data = categoryMapper.toResponse(category),
                message = "Category retrieved successfully"
            )
        )
    }
    
    @GetMapping("/{id}/children")
    @Operation(
        summary = "Get child categories",
        description = "Returns all direct child categories of the specified category"
    )
    @SwaggerApiResponses(
        value = [
            SwaggerApiResponse(
                responseCode = "200",
                description = "Successfully retrieved child categories",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ApiResponse::class)
                    )
                ]
            ),
            SwaggerApiResponse(
                responseCode = "404",
                description = "Parent category not found"
            )
        ]
    )
    @Transactional(readOnly = true)
    fun getChildCategories(
        @Parameter(description = "ID of the parent category") 
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<List<SimpleCategoryResponse>>> {
        // Check if parent exists
        categoryService.getCategoryById(id)
        
        val children = categoryService.getChildCategories(id)
        return ResponseEntity.ok(
            ApiResponse.success(
                data = categoryMapper.toSimpleResponseList(children),
                message = "Child categories retrieved successfully"
            )
        )
    }
    
    @GetMapping("/tree")
    @Operation(
        summary = "Get category tree",
        description = "Returns categories in a hierarchical tree structure"
    )
    @SwaggerApiResponses(
        value = [
            SwaggerApiResponse(
                responseCode = "200",
                description = "Successfully retrieved category tree",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ProductCategoryResponse::class)
                    )
                ]
            )
        ]
    )
    @Transactional(readOnly = true)
    fun getCategoryTree(
        @RequestParam(required = false, defaultValue = "false") includeInactive: Boolean = false
    ): ResponseEntity<ApiResponse<List<ProductCategoryResponse>>> {
        val categories = categoryService.getCategoryTree(includeInactive)
        val rootCategories = categories.filter { it.parent == null }
        val response = rootCategories.map { categoryMapper.toResponse(it, true) }
        return ResponseEntity.ok(
            ApiResponse.success(
                data = response,
                message = "Category tree retrieved successfully"
            )
        )
    }

    
    @PostMapping
    @Operation(
        summary = "Create a new category",
        description = "Creates a new product category with the given details"
    )
    @SwaggerApiResponses(
        value = [
            SwaggerApiResponse(
                responseCode = "201",
                description = "Successfully created category",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = SwaggerApiResponse::class)
                    )
                ]
            ),
            SwaggerApiResponse(
                responseCode = "400",
                description = "Invalid input, category with same name already exists"
            ),
            SwaggerApiResponse(
                responseCode = "404",
                description = "Parent category not found"
            )
        ]
    )
    @Transactional
    fun createCategory(
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Category object that needs to be added to the system",
            required = true,
            content = [
                Content(
                    mediaType = "application/json",
                    schema = Schema(implementation = CreateProductCategoryRequest::class)
                )
            ]
        )
        @RequestBody request: CreateProductCategoryRequest
    ): ResponseEntity<ApiResponse<ProductCategoryResponse>> {
        val category = categoryService.createCategory(
            name = request.name,
            description = request.description,
            parentId = request.parentCategoryId,
            active =  true
        )
        return ResponseEntity.status(HttpStatus.CREATED).body(
            ApiResponse.success(
                data = categoryMapper.toResponse(category),
                message = "Category created successfully"
            )
        )
    }
    
    @PutMapping("/{id}")
    @Operation(
        summary = "Update an existing category",
        description = "Updates the details of an existing category"
    )
    @SwaggerApiResponses(
        value = [
            SwaggerApiResponse(
                responseCode = "200",
                description = "Successfully updated category",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ApiResponse::class)
                    )
                ]
            ),
            SwaggerApiResponse(
                responseCode = "400",
                description = "Invalid input, category with same name already exists, or circular reference detected"
            ),
            SwaggerApiResponse(
                responseCode = "404",
                description = "Category or parent category not found"
            )
        ]
    )
    @Transactional
    fun updateCategory(
        @Parameter(description = "ID of the category to be updated. Cannot be empty.")
        @PathVariable id: Long,
        @io.swagger.v3.oas.annotations.parameters.RequestBody(
            description = "Updated category object",
            required = true,
            content = [
                Content(
                    mediaType = "application/json",
                    schema = Schema(implementation = UpdateProductCategoryRequest::class)
                )
            ]
        )
        @RequestBody request: UpdateProductCategoryRequest
    ): ResponseEntity<ApiResponse<ProductCategoryResponse>> {
        val updatedCategory = categoryService.updateCategory(
            id = id,
            name = request.name,
            description = request.description,
            parentId = request.parentCategoryId,
            active = request.active
        )
        
        return ResponseEntity.ok(
            ApiResponse.success(
                data = categoryMapper.toResponse(updatedCategory),
                message = "Category updated successfully"
            )
        )
    }
    
    @DeleteMapping("/{id}")
    @Operation(
        summary = "Delete a category",
        description = "Deletes a category by ID. If the category has products or child categories, it will be deactivated instead of deleted."
    )
    @SwaggerApiResponses(
        value = [
            SwaggerApiResponse(
                responseCode = "200",
                description = "Successfully deleted or deactivated category",
                content = [
                    Content(
                        mediaType = "application/json",
                        schema = Schema(implementation = ApiResponse::class)
                    )
                ]
            ),
            SwaggerApiResponse(
                responseCode = "400",
                description = "Cannot delete category with child categories"
            ),
            SwaggerApiResponse(
                responseCode = "404",
                description = "Category not found"
            )
        ]
    )
    @Transactional
    fun deleteCategory(
        @Parameter(description = "ID of the category to be deleted. Cannot be empty.")
        @PathVariable id: Long
    ): ResponseEntity<ApiResponse<Void>> {
        return try {
            categoryService.deleteCategory(id)
            val category = categoryService.getCategoryById(id)
            ResponseEntity.ok(
                ApiResponse.success(
                    message = if (category.active) 
                        "Category deactivated successfully" 
                    else 
                        "Category deleted successfully"
                )
            )
        } catch (e: IllegalStateException) {
            ResponseEntity.badRequest().body(
                ApiResponse.error(
                    message = e.message ?: "Cannot delete category"
                )
            )
        } catch (e: ResourceNotFoundException) {
            ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                ApiResponse.error(
                    message = "Category not found with id: $id"
                )
            )
        }
    }
}
