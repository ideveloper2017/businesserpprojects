package uz.rms.modules.v1.product.model

import com.fasterxml.jackson.annotation.*
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.persistence.*
import org.hibernate.annotations.BatchSize
import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import uz.rms.common.BaseEntity
import java.util.*

/**
 * Represents a category for products in the inventory.
 *
 * @property name Name of the category
 * @property description Optional description of the category
 * @property parent Reference to the parent category (for hierarchical categories)
 * @property active Whether the category is active and visible
 */
@Entity
@Table(
    name = "product_categories",
    indexes = [
        Index(name = "idx_category_name", columnList = "name", unique = true),
        Index(name = "idx_category_parent", columnList = "parent_id")
    ]
)
@Schema(description = "Product category information")
class ProductCategory : BaseEntity() {
    @Column(nullable = false, unique = true, length = 100)
    @Schema(description = "Category name", example = "Electronics", required = true)
    var name: String = ""

    @Column(length = 1000)
    @Schema(description = "Category description", example = "Electronic devices and accessories")
    var description: String? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", foreignKey = ForeignKey(name = "fk_category_parent"))
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator::class, property = "id")
    @JsonIdentityReference(alwaysAsId = true)
    @JsonProperty("parentId")
    @Schema(description = "Parent category if this is a subcategory")
    var parent: ProductCategory? = null
        set(value) {
            field = value
            // Prevent circular reference
            if (value != null && value.id == this.id) {
                throw IllegalArgumentException("A category cannot be its own parent")
            }
        }

    @OneToMany(
        mappedBy = "category",
        cascade = [CascadeType.ALL],
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    @Fetch(FetchMode.SUBSELECT)
    @BatchSize(size = 50)
    @JsonIgnore
    @Schema(hidden = true)
    private val _products: MutableSet<Product> = mutableSetOf()

    /**
     * Immutable view of products in this category
     */
    @get:Transient
    @get:Schema(description = "Products belonging to this category")
    val products: Set<Product>
        get() = Collections.unmodifiableSet(_products)

    @OneToMany(mappedBy = "parent", fetch = FetchType.LAZY)
    @Fetch(FetchMode.SUBSELECT)
    @BatchSize(size = 50)
    @JsonManagedReference("category-children")
    @Schema(description = "Subcategories of this category")
    var children: MutableSet<ProductCategory> = mutableSetOf()

    @Column(nullable = false)
    @Schema(description = "Whether the category is active and visible", example = "true", required = true)
    var active: Boolean = true

    /**
     * Adds a product to this category
     */
    fun addProduct(product: Product) {
        _products.add(product)
        product.category = this
    }

    /**
     * Removes a product from this category
     */
    fun removeProduct(product: Product) {
        _products.remove(product)
        product.category = null
    }

    /**
     * Adds a child category
     */
    fun addChild(category: ProductCategory) {
        require(category.id != this.id) { "A category cannot be a child of itself" }
        children.add(category)
        category.parent = this
    }

    /**
     * Removes a child category
     */
    fun removeChild(category: ProductCategory) {
        if (children.remove(category)) {
            category.parent = null
        }
    }

    /**
     * Moves all products from this category to another category
     */
    fun moveProductsTo(newCategory: ProductCategory) {
        _products.toList().forEach { product ->
            removeProduct(product)
            newCategory.addProduct(product)
        }
    }

    /**
     * Checks if this category is a descendant of the given category
     */
    fun isDescendantOf(category: ProductCategory): Boolean {
        var current = this.parent
        while (current != null) {
            if (current == category) return true
            current = current.parent
        }
        return false
    }

    /**
     * Gets the full path of this category (including all parent categories)
     */
    @get:Transient
    @get:JsonIgnore
    val fullPath: String
        get() {
            val path = mutableListOf<String>()
            var current: ProductCategory? = this
            while (current != null) {
                path.add(current.name)
                current = current.parent
            }
            return path.asReversed().joinToString(" > ")
        }
}