<?php
namespace App\Model\Entity;

use Cake\ORM\Entity;

/**
 * Project Entity
 *
 * @property int $id
 * @property string|null $name
 * @property string|null $description
 * @property string|null $wms_title
 * @property string|null $wms_endpoint
 * @property string|null $wms_attribution
 * @property string|null $wms_format
 * @property int|null $wms_maxzoom
 * @property string|null $wms_layers
 * @property float|null $center_lat
 * @property float|null $center_long
 * @property \Cake\I18n\FrozenTime|null $created_at
 * @property \Cake\I18n\FrozenTime|null $modified_at
 * @property bool|null $wms_transparent
 */
class Project extends Entity
{
    /**
     * Fields that can be mass assigned using newEntity() or patchEntity().
     *
     * Note that when '*' is set to true, this allows all unspecified fields to
     * be mass assigned. For security purposes, it is advised to set '*' to false
     * (or remove it), and explicitly make individual fields accessible as needed.
     *
     * @var array
     */
    protected $_accessible = [
        'id' => true,
        'name' => true,
        'description' => true,
        'wms_title' => true,
        'wms_endpoint' => true,
        'wms_attribution' => true,
        'wms_format' => true,
        'wms_maxzoom' => true,
        'wms_layers' => true,
        'created_at' => true,
        'modified_at' => true,
        'wms_transparent' => true,
        'polygon_table' => true,
        'shape_table' => true,
        'wms_table' => true,
		'legend_title' => true,
		'desc_title' => true,
		'wms_conf' => true
    ];
}
