<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inventory extends Model
{
    use HasFactory;
    
    protected $table = 'inventory_items';
    
    protected $primaryKey = 'id';
    public $incrementing = true;
    protected $keyType = 'int';
    
    // Disable timestamps since we use custom Modified_Date
    public $timestamps = false;
    
    protected $fillable = [
        'Item_Name',
        'Item_Description',
        'Supplier',
        'Quantity_Alert',
        'Image',
        'Modified_By',
        'Modified_Date',
        'User_Email',
        'Category',
        'Item_ID'
    ];
    
    protected $casts = [
        'Quantity_Alert' => 'integer',
        'Item_ID' => 'integer',
        'Modified_Date' => 'datetime',
    ];

    /**
     * Get items by category
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('Category', $category);
    }

    /**
     * Get items by supplier
     */
    public function scopeBySupplier($query, $supplier)
    {
        return $query->where('Supplier', $supplier);
    }

    /**
     * Get items with quantity alerts
     */
    public function scopeWithQuantityAlerts($query)
    {
        return $query->where('Quantity_Alert', '>', 0);
    }

    /**
     * Search items by name or description
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function ($query) use ($search) {
            $query->where('Item_Name', 'like', '%' . $search . '%')
                  ->orWhere('Item_Description', 'like', '%' . $search . '%');
        });
    }

    /**
     * Get formatted quantity alert
     */
    public function getFormattedQuantityAlertAttribute()
    {
        return $this->Quantity_Alert > 0 ? 'Alert at: ' . $this->Quantity_Alert : 'No alert set';
    }

    /**
     * Check if item has quantity alert
     */
    public function hasQuantityAlert()
    {
        return $this->Quantity_Alert > 0;
    }

    /**
     * Get item status based on quantity alert
     */
    public function getStatusAttribute()
    {
        return $this->hasQuantityAlert() ? 'Alert Set' : 'Normal';
    }

    /**
     * Boot method for model events
     */
    protected static function boot()
    {
        parent::boot();

        // Set modified_date when creating or updating
        static::creating(function ($model) {
            if (empty($model->Modified_Date)) {
                $model->Modified_Date = now();
            }
        });

        static::updating(function ($model) {
            $model->Modified_Date = now();
        });
    }
}
