<?php
namespace App\Model\Table;

use Cake\ORM\Query;
use Cake\ORM\RulesChecker;
use Cake\ORM\Table;
use Cake\Validation\Validator;

/**
 * Projects Model
 *
 * @method \App\Model\Entity\Project get($primaryKey, $options = [])
 * @method \App\Model\Entity\Project newEntity($data = null, array $options = [])
 * @method \App\Model\Entity\Project[] newEntities(array $data, array $options = [])
 * @method \App\Model\Entity\Project|bool save(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\Project saveOrFail(\Cake\Datasource\EntityInterface $entity, $options = [])
 * @method \App\Model\Entity\Project patchEntity(\Cake\Datasource\EntityInterface $entity, array $data, array $options = [])
 * @method \App\Model\Entity\Project[] patchEntities($entities, array $data, array $options = [])
 * @method \App\Model\Entity\Project findOrCreate($search, callable $callback = null, $options = [])
 */
class ProjectsTable extends Table
{
    /**
     * Initialize method
     *
     * @param array $config The configuration for the Table.
     * @return void
     */
    public function initialize(array $config)
    {
        parent::initialize($config);

        $this->setTable('projects');
        $this->setDisplayField('name');
        $this->setPrimaryKey('id');
    }

    /**
     * Default validation rules.
     *
     * @param \Cake\Validation\Validator $validator Validator instance.
     * @return \Cake\Validation\Validator
     */
    public function validationDefault(Validator $validator)
    {
        $validator
            ->integer('id')
            ->requirePresence('id', 'create')
            ->notEmptyString('id');

        $validator
            ->scalar('name')
            ->maxLength('name', 50)
            ->allowEmptyString('name');

        $validator
            ->scalar('description')
            ->maxLength('description', 255)
            ->allowEmptyString('description');

        $validator
            ->scalar('wms_title')
            ->maxLength('wms_title', 50)
            ->allowEmptyString('wms_title');

        $validator
            ->scalar('wms_endpoint')
            ->maxLength('wms_endpoint', 255)
            ->allowEmptyString('wms_endpoint');

        $validator
            ->scalar('wms_attribution')
            ->maxLength('wms_attribution', 255)
            ->allowEmptyString('wms_attribution');

        $validator
            ->scalar('wms_format')
            ->maxLength('wms_format', 15)
            ->allowEmptyString('wms_format');

        $validator
            ->integer('wms_maxzoom')
            ->allowEmptyString('wms_maxzoom');

        $validator
            ->scalar('wms_layers')
            ->maxLength('wms_layers', 50)
            ->allowEmptyString('wms_layers');

        $validator
            ->dateTime('created_at')
            ->allowEmptyDateTime('created_at');

        $validator
            ->dateTime('modified_at')
            ->allowEmptyDateTime('modified_at');

        $validator
            ->boolean('wms_transparent')
            ->allowEmptyString('wms_transparent');
        $validator
            ->scalar('polygon_table')
            ->maxLength('polygon_table', 255)
            ->allowEmptyString('polygon_table');
        $validator
            ->scalar('shape_table')
            ->maxLength('shape_table', 255)
            ->allowEmptyString('shape_table');
        $validator
            ->scalar('wms_table')
            ->maxLength('wms_table', 255)
            ->allowEmptyString('wms_table');
			$validator
            ->scalar('desc_title')
            ->maxLength('desc_title', 255)
            ->allowEmptyString('desc_title');
			$validator
            ->scalar('legend_title')
            ->maxLength('legend_title', 255)
            ->allowEmptyString('legend_title');
			$validator
            ->scalar('wms_conf')
            ->allowEmptyString('wms_conf');


        return $validator;
    }
}
