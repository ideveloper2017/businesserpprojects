package uz.rms.modules.v1.units.model

import com.fasterxml.jackson.annotation.*
import io.swagger.v3.oas.annotations.media.Schema
import jakarta.persistence.*
import org.hibernate.annotations.BatchSize
import org.hibernate.annotations.Fetch
import org.hibernate.annotations.FetchMode
import uz.rms.common.BaseEntity
import uz.rms.modules.v1.product.model.Product

import java.util.*

/**
 * Represents a unit of measurement for products in the inventory.
 *
 * @property code Unique code for the unit (e.g., "PCS", "KG", "L")
 * @property name Full name of the unit (e.g., "Piece", "Kilogram", "Liter")
 * @property active Whether the unit is active and available for use
 */
@Entity
@Table(
    name = "units",
    indexes = [
        Index(name = "idx_unit_code", columnList = "code", unique = true),
        Index(name = "idx_unit_name", columnList = "name", unique = true)
    ]
)
@Schema(description = "Unit of measurement information")
class Units : BaseEntity() {
    @Column(nullable = false, length = 20, unique = true)
    @Schema(description = "Unique code for the unit (e.g., \"PCS\", \"KG\", \"L\")", 
             example = "PCS", required = true)
    var code: String? = null
        set(value) {
            field = value?.uppercase(Locale.getDefault())
        }

    @Column(nullable = false, length = 100, unique = true)
    @Schema(description = "Full name of the unit (e.g., \"Piece\", \"Kilogram\", \"Liter\")", 
             example = "Piece", required = true)
    var name: String? = null

    @Column(nullable = false)
    @Schema(description = "Whether the unit is active and available for use", 
             example = "true", required = true)
    var active: Boolean = true

    @OneToMany(
        mappedBy = "units",
        fetch = FetchType.LAZY,
        cascade = [CascadeType.ALL],
        orphanRemoval = true
    )
    @Fetch(FetchMode.SUBSELECT)
    @BatchSize(size = 50)
    @JsonIgnore
    @Schema(hidden = true)
    private val _products: MutableSet<Product> = mutableSetOf()

    /**
     * Immutable view of products using this unit
     */
    @get:Transient
    @get:Schema(description = "Products using this unit")
    val products: Set<Product>
        get() = Collections.unmodifiableSet(_products)

    /**
     * Adds a product to this unit
     */
    fun addProduct(product: Product) {
        _products.add(product)
        product.units = this
    }

    /**
     * Removes a product from this unit
     */
    fun removeProduct(product: Product) {
        _products.remove(product)
        product.units = null
    }

    /**
     * Updates the unit's code and name
     */
    fun update(code: String, name: String) {
        this.code = code
        this.name = name
    }

    /**
     * Deactivates the unit and removes it from all products
     */
    fun deactivate() {
        if (active) {
            active = false
            // Optionally: Handle what happens to products using this unit when it's deactivated
            // For example, move them to a default unit or mark them as inactive
        }
    }

    /**
     * Merges another unit into this one, moving all products to this unit
     * and deactivating the other unit
     */
    fun mergeWith(other: Units) {
        if (this == other) return
        
        // Move all products from the other unit to this one
        other._products.toList().forEach { product ->
            other.removeProduct(product)
            this.addProduct(product)
        }
        
        // Deactivate the other unit
        other.active = false
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false
        other as Units
        return code == other.code
    }

    override fun hashCode(): Int {
        return code?.hashCode() ?: 0
    }

    override fun toString(): String {
        return "Units(id=$id, code=$code, name=$name, active=$active)"
    }
}
