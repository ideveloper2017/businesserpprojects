package uz.rms.modules.v1.product.service

import jakarta.transaction.Transactional
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import uz.rms.modules.v1.product.exception.ResourceNotFoundException
import uz.rms.modules.v1.product.mapper.ProductCategoryMapper
import uz.rms.modules.v1.product.model.ProductCategory
import uz.rms.modules.v1.product.repository.ProductCategoryRepository


@Service
class ProductCategoryService(
    private val categoryRepository: ProductCategoryRepository,
    private val categoryMapper: ProductCategoryMapper
) {
    
    @Transactional()
    fun getAllCategories(includeInactive: Boolean = false): List<ProductCategory> =
        if (includeInactive) categoryRepository.findAll()
        else categoryRepository.findAllActive()
    
    @Transactional()
    fun getActiveCategories(includeInactive: Boolean = false): List<ProductCategory> =
        if (includeInactive) categoryRepository.findRootCategories()
        else categoryRepository.findActiveRootCategories()
    
    @Transactional()
    fun getCategoryById(id: Long): ProductCategory =
        categoryRepository.findByIdOrNull(id) 
            ?: throw ResourceNotFoundException("Category not found with id: $id")
    
    @Transactional()
    fun getChildCategories(parentId: Long, includeInactive: Boolean = false): List<ProductCategory> {
        return if (parentId == 0L) {
            if (includeInactive) categoryRepository.findRootCategories()
            else categoryRepository.findActiveRootCategories()
        } else {
            if (includeInactive) categoryRepository.findAllChildren(parentId)
            else categoryRepository.findActiveChildren(parentId)
        }
    }
    

    @Transactional
    fun createCategory(
        name: String,
        description: String? = null,
        parentId: Long? = null,
        active: Boolean = true
    ): ProductCategory {
        if (categoryRepository.existsByName(name)) {
            throw IllegalArgumentException("Category with name '$name' already exists")
        }
        
        val parent = parentId?.let { 
            categoryRepository.findByIdOrNull(it) ?: 
            throw ResourceNotFoundException("Parent category not found with id: $parentId")
        }
        
        return ProductCategory().apply {
            this.name = name
            this.description = description
            this.parent = parent
            this.active = active
        }.let { categoryRepository.save(it) }
    }
    
    @Transactional
    fun updateCategory(
        id: Long,
        name: String? = null,
        description: String? = null,
        parentId: Long? = null,
        active: Boolean? = null
    ): ProductCategory {
        val category = categoryRepository.findByIdOrNull(id)
            ?: throw ResourceNotFoundException("Category not found with id: $id")
            
        name?.let { 
            if (it != category.name && categoryRepository.existsByName(it)) {
                throw IllegalArgumentException("Category with name '$it' already exists")
            }
            category.name = it
        }
        
        description?.let { category.description = it }
        active?.let { category.active = it }
        
        parentId?.let { newParentId ->
            if (newParentId == category.id) {
                throw IllegalArgumentException("Category cannot be its own parent")
            }
            
            // Check for circular reference
            var currentParentId: Long? = newParentId
            while (currentParentId != null) {
                if (currentParentId == category.id) {
                    throw IllegalArgumentException("Circular reference detected in category hierarchy")
                }
                currentParentId = categoryRepository.findByIdOrNull(currentParentId)?.parent?.id
            }
            
            val newParent = categoryRepository.findByIdOrNull(newParentId)
                ?: throw ResourceNotFoundException("Parent category not found with id: $newParentId")
            category.parent = newParent
        }
        
        return categoryRepository.save(category)
    }
    
    @Transactional
    fun deleteCategory(id: Long): Boolean {
        val category = categoryRepository.findByIdOrNull(id)
            ?: throw ResourceNotFoundException("Category not found with id: $id")
            
        return if (category.products.isNotEmpty()) {
            // Instead of deleting, mark as inactive
            category.active = false
            categoryRepository.save(category)
            true
        } else {
            // Only delete if no child categories exist
            val childCount = categoryRepository.findByParentId(id).size
            if (childCount > 0) {
                throw IllegalStateException("Cannot delete category with $childCount child categories")
            }
            categoryRepository.delete(category)
            true
        }
    }
    
    @Transactional()
    fun getCategoryTree(includeInactive: Boolean = false): List<ProductCategory> {
        // Fetch all categories in a single query with proper ordering
        val allCategories = if (includeInactive) {
            categoryRepository.findAll().sortedBy { it.name }
        } else {
            categoryRepository.findAllActive()
        }
        
        if (allCategories.isEmpty()) return emptyList()
        
        // Create a map of categories by ID for O(1) lookups
        val categoryMap = allCategories.associateBy { it.id!! }
        
        // Track root categories (those without parents)
        val rootCategories = mutableListOf<ProductCategory>()
        
        // First pass: Initialize all categories with empty children sets
        allCategories.forEach { category ->
            if (category.children == null) {
                category.children = mutableSetOf()
            }
        }
        
        // Second pass: Build the tree structure
        allCategories.forEach { category ->
            category.parent?.id?.let { parentId ->
                // Only process if parent exists in our map
                categoryMap[parentId]?.let { parent ->
                    parent.children?.add(category)
                    return@forEach
                }
                // If we get here, parent doesn't exist or is filtered out
                category.parent = null
            }
            
            // If no parent or parent not found, add to root categories
            if (category.parent == null) {
                rootCategories.add(category)
            }
        }
        
        return rootCategories.sortedBy { it.name }
    }
}
