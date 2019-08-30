<?php
namespace App\Controller;

use App\Controller\AppController;
use Cake\Datasource\ConnectionManager;
/**
 * Projects Controller
 *
 * @property \App\Model\Table\ProjectsTable $Projects
 *
 * @method \App\Model\Entity\Project[]|\Cake\Datasource\ResultSetInterface paginate($object = null, array $settings = [])
 */
class ProjectsController extends AppController
{


    public function initialize()
    {
        parent::initialize();
        $this->Auth->allow(['addPolygonShape','addGeneralShape']);
    }
    /**
     * Index method
     *
     * @return \Cake\Http\Response|null
     */
  public function index()
    {
        $projects = $this->paginate($this->Projects);
		$this->set('response',array(
                'success' => true,
                'data' => $projects,
                'msg' => '',
            )); 
    }

    /**
     * View method
     *
     * @param string|null $id Project id.
     * @return \Cake\Http\Response|null
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function view()
    {   
        $this->autoRender = 0;
        $id = $this->request->getParam('?')['id'];
        $project = $this->Projects->get($id, [
            'contain' => []
        ]);
        echo json_encode(array(
            'success' => true,
            'data' => $project,
            'msg' => '',
        ));
        //exit;
        
    }

    /**
     * Add method
     *
     * @return \Cake\Http\Response|null Redirects on successful add, renders view otherwise.
     */
    public function add()
    {
        $project = $this->Projects->newEntity();
        if ($this->request->is('post')) {
            $project = $this->Projects->patchEntity($project, $this->request->getData());
            if ($this->Projects->save($project)) {
                $this->Flash->success(__('The project has been saved.'));

                return $this->redirect(['action' => 'index']);
            }
            $this->Flash->error(__('The project could not be saved. Please, try again.'));
        }
        $this->set(compact('project'));
    }

    /**
     * Edit method
     *
     * @param string|null $id Project id.
     * @return \Cake\Http\Response|null Redirects on successful edit, renders view otherwise.
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function edit()
    {   
        $this->autoRender = 0;
        $data = $this->request->getData();
        if($data['wms_attribution'] == '1'){
            $data['wms_attribution']= true;
        }else{
            $data['wms_attribution'] = false;
        }
        $project = $this->Projects->get($data['id'], [
            'contain' => []
        ]);
        if ($this->request->is(['patch', 'post', 'put'])) {
            $project = $this->Projects->patchEntity($project, $data);
            if ($this->Projects->save($project)) {
                $success = true;
                $output = $project;
                $msg = 'Dati modificati correttamente';
            }else{
                $success = false;
                $output = array();
                $msg = 'Errore del Server';
            }

            echo json_encode(array(
                'success' => $success,
                'data' => $output,
                'msg' => $msg
            ));
            //exit;
        }
    }

    /**
     * Delete method
     *
     * @param string|null $id Project id.
     * @return \Cake\Http\Response|null Redirects to index.
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function delete($id = null)
    {   
        $this->autoRender= 0;
        $this->request->allowMethod(['post', 'delete']);
        /*if (!$this->Auth->User('is_admin')) {
            $this->set(array(
                'result' => array('success' => false, 'data' => array(), 'msg' => 'Operazione non consentita.'),
                '_serialize' => array('result')
            ));
            return;
        }*/
        $project = $this->Projects->get($id);
		$filesName = $this->normalizeString($project['name']);		
		$wms_table = $project['wms_table'];
		if($wms_table != ''){
			$conn = ConnectionManager::get('default');	
			$conn ->execute("DROP TABLE IF EXISTS ".$wms_table."");
		}
        if ($this->Projects->delete($project)) {
			$mapFile = ROOT.'/mapfiles/'.$filesName.'.map';
			$mapquadroFile = ROOT.'/mapfiles/'.$filesName.'_quadro.map';
			$pdfFile = WWW_ROOT.$filesName.'.pdf';
			if(file_exists($mapFile)){
				unlink($mapFile);
			}
			if(file_exists($mapquadroFile)){
				unlink($mapquadroFile);
			}
			if(file_exists($pdfFile)){
				unlink($pdfFile);
			}
            $success = true;           
        } else {
            $success = false;
        }
        echo json_encode(array(
			'success' => $success,
			'data' => array(),
			'msg' => ''));
    }
    public function addPolygonShape(){
		$this->autoRender = 0;
		$tmpFolder = realpath('../../tmp').'/';
		$project_name = $this->request->getData('project_name');
		$project_desc = $this->request->getData('project_desc');
		$desc_title = $this->request->getData('desc_title');
		$legend_title = $this->request->getData('legend_title');
		//mi ricavo i nomi senza estensione
		foreach($_FILES['shape']['name'] as $key => $val){
			$tokens = explode('.',$val);
			$fileNames[$key]= $tokens[0];
		}
		
		//controllo se sono stati caricati 3 file
		$fileNum = false;
		if(count($fileNames) >= 3){
			$fileNum = true;
		}
		if($fileNum){
			//controllo se i nomi sono uguali		
			if(strcmp($fileNames[0], $fileNames[1]) == 0  && strcmp($fileNames[0],$fileNames[2]) == 0 ){
				$equalNames = true;
			}else{
				$equalNames = false;
			}
			if($equalNames){
				//Ricostruisco i file
				$dimMsg = 0;
				foreach($_FILES['shape'] as $key => $val){			
					if($key == 'name'){
						foreach($val as $k => $v){
							$tokens = explode('.',$v);
							$ext = array_pop($tokens);
							//mi salvo l'id del file shp
							if($ext == 'shp'){
								$index = $k;
							}
							$files[$k][$key] = $v;
						}
					}else if($key == 'type'){
						foreach($val as $k => $v){
							$files[$k][$key] = $v;
						}
					}else if($key == 'tmp_name'){
						foreach($val as $k => $v){
							$files[$k][$key] = $v;
							$res = move_uploaded_file($files[$k][$key],$tmpFolder.$files[$k]['name']);
							chmod($tmpFolder.$files[$k]['name'],0777);
						}
					}else if($key == 'error'){
						foreach($val as $k => $v){
							if($v == 1){
								//se ERRORE = 1 il file è troppo grande
								$dimMsg = 'Il file '.$files[$k]['name'].' supera le dimensioni massime permesse dal server.';
							}
							$files[$k][$key] = $v;
						}
					}else if($key == 'size'){
						foreach($val as $k => $v){
							$files[$k][$key] = $v;
						}
					}
				}
				// se almeno un file è di dimensioni troppo grandi mi fermo
				if($dimMsg == 0){			
					//controllo se sono stati caricati i file corretti
					$shpExt = false;
					$shxExt = false;
					$dbfExt = false;
					foreach($files as $file){
						$tokens = explode('.',$file['name']);
						$fileExt = array_pop($tokens);
						if($fileExt == 'shp'){
							$shpExt = true;
						}else if ($fileExt == 'shx'){
							$shxExt = true;
						}else if ($fileExt == 'dbf'){
							$dbfExt = true;
						}
					}
					if($shpExt && $shxExt && $dbfExt ){
                        //ricavo la proiezione geometrica del progetto
                        $myFile = CONFIG."settings.ini";
                        $settings = parse_ini_file($myFile,true);
						$sql_shp_path = $settings['sql_shp_path'];
						$proj = $settings['displayProj'];
						$rand_val= date('YmdHis');
						$shpFile = $files[$index];
						$exploded = explode('.',$shpFile['name']);
						$nameWithoutExt = $exploded[0];
						//tabella
						$tableName = strtolower($nameWithoutExt).'_'.$rand_val;
						//file sql
						$sqlPath = $tmpFolder. strtolower($nameWithoutExt).'_'.$rand_val.'.sql';
						//eseguo lo script
						$content = $sql_shp_path."shp2pgsql -s ".$proj." -g the_geom -W \"LATIN1\" ".$tmpFolder.$shpFile['name']." public.".$tableName." > ".$sqlPath;
						exec($content, $output, $res);	
						//ottengo la query generata nel file sql dallo script
						$query = file_get_contents($sqlPath);
						$dbConf = ConnectionManager::get('default')->config();
						//eseguo la query
						$dbi = pg_connect('host='.$dbConf['host'].' port='.$dbConf['port'].' dbname='.$dbConf['database'].' user='.$dbConf['username'].' password='.$dbConf['password']);
						$res = pg_query($dbi,$query);
						$success = ($res === FALSE) ? false : true;	
						$data = array();	
						$conn = ConnectionManager::get('default');				
						if($success){
							foreach($files as $key => $values){
								$fileshapePath = $tmpFolder.$files[$key]['name'];
								if(file_exists($fileshapePath)){
									unlink($fileshapePath);
								}
							}
							if(file_exists($sqlPath)){
								unlink($sqlPath);
							}
							//controllo se la geometria inserita è di tipo POLYGON o MULTIPOLYGON, se non lo è elimino la tabella
							$table = $conn->execute("SELECT * FROM geometry_columns WHERE f_table_name = '".$tableName."'");
							$results = $table ->fetchAll('assoc');
							if($results[0]['type'] != 'MULTIPOLYGON' && $results[0]['type'] !='POLYGON' ){								
								$conn->execute('DROP TABLE '. $tableName);
								$success = false;								
								$msg = 'File shape non valido. Sono accettati solo shape poligonali';
							
							}else if($results[0]['srid'] == $proj){															
								$project = $this->Projects->newEntity();
								$project['polygon_table'] = $tableName;
								$project['name'] = $project_name;
								$project['description'] = $project_desc;
								$project['desc_title'] = $desc_title;
								$project['legend_title'] = $legend_title;
									if ($this->Projects->save($project)) {
										$msg = 'Shape caricata correttamente!';
										$data = array('project_id' => $project['id'], 'polygonTable'=>$tableName);
									}else{
										$success = false;
										$conn->execute('DROP TABLE '. $tableName);
										$msg = 'Errore del server';
									}								
							}else{
								$conn->execute('DROP TABLE '. $tableName);
								$success = false;								
								$msg = 'File shape non valido. Sono accettati solo shape in proiezione '.$proj.'';
							}
						}else{
							foreach($files as $key => $values){
								$fileshapePath = $tmpFolder.$files[$key]['name'];
								if(file_exists($fileshapePath)){
									unlink($fileshapePath);
								}
							}
							if(file_exists($sqlPath)){
								unlink($sqlPath);
							}
							$msg = 'Impossibile caricare il file di shape. Riprovare più tardi.';
						}
						echo json_encode(array(				
							'success' => $success,
							'data' => $data,
							'msgError' => $msg
						));
					}else{
						//errore mancanza file
						$msg = 'Mancano i seguenti file: ';
						if(!$shpExt && $shxExt && $dbfExt){
							$msg .='SHP';
						}else if(!$shpExt && !$shxExt && $dbfExt){
							$msg .='SHP,SHX';
						}else if(!$shpExt && !$shxExt && !$dbfExt){
							$msg .='SHP,SHX,DBF';
						}else if(!$shpExt && $shxExt && !$dbfExt){
							$msg .='SHP,DBF';
						}else if($shpExt && $shxExt && !$dbfExt){
							$msg .='SHX,DBF';
						}
						echo json_encode(array(
							'success' => false,
							'data' => '',
							'msgError' => $msg
						));
					}
					
				}else{
						//Errore dimensione file
						echo json_encode(array(				
						'success' => false,
						'data' => '',
						'msgError' => $dimMsg
					));
				}
			}else{
				//errore nome file
				 echo json_encode(array(
					'success' => false,
					'data' => '',
					'msgError' => "Attenzione! Il nome dei file deve essere uguale!"
				));
			}
		}else{
			//errore numero file
			echo json_encode(array(
				'success' => false,
				'data' => '',
				'msgError' => "Attenzione! I file devono essere 3! SHP, SHX e DBF"
			));
		}
    }
    public function addGeneralShape(){
		$this->autoRender = 0;
		$tmpFolder = realpath('../../tmp').'/';
		//mi ricavo i nomi senza estensione
		foreach($_FILES['shape']['name'] as $key => $val){
			$tokens = explode('.',$val);
			$fileNames[$key]= $tokens[0];
		}
		$project_id = $this->request->getData('project_id');
		//controllo se sono stati caricati 3 file
		$fileNum = false;
		if(count($fileNames) == 3){
			$fileNum = true;
		}
		if($fileNum){
			//controllo se i nomi sono uguali		
			if(strcmp($fileNames[0], $fileNames[1]) == 0  && strcmp($fileNames[0],$fileNames[2]) == 0 ){
				$equalNames = true;
			}else{
				$equalNames = false;
			}
			if($equalNames){
				//Ricostruisco i file
				$dimMsg = 0;
				foreach($_FILES['shape'] as $key => $val){			
					if($key == 'name'){
						foreach($val as $k => $v){
							$tokens = explode('.',$v);
							$ext = array_pop($tokens);
							//mi salvo l'id del file shp
							if($ext == 'shp'){
								$index = $k;
							}
							$files[$k][$key] = $v;
						}
					}else if($key == 'type'){
						foreach($val as $k => $v){
							$files[$k][$key] = $v;
						}
					}else if($key == 'tmp_name'){
						foreach($val as $k => $v){
							$files[$k][$key] = $v;
							$res = move_uploaded_file($files[$k][$key],$tmpFolder.$files[$k]['name']);
							chmod($tmpFolder.$files[$k]['name'],0777);
						}
					}else if($key == 'error'){
						foreach($val as $k => $v){
							if($v == 1){
								//se ERRORE = 1 il file è troppo grande
								$dimMsg = 'Il file '.$files[$k]['name'].' supera le dimensioni massime permesse dal server.';
							}
							$files[$k][$key] = $v;
						}
					}else if($key == 'size'){
						foreach($val as $k => $v){
							$files[$k][$key] = $v;
						}
					}
				}
				// se almeno un file è di dimensioni troppo grandi mi fermo
				if($dimMsg == 0){			
					//controllo se sono stati caricati i file corretti
					$shpExt = false;
					$shxExt = false;
					$dbfExt = false;
					foreach($files as $file){
						$tokens = explode('.',$file['name']);
						$fileExt = array_pop($tokens);
						if($fileExt == 'shp'){
							$shpExt = true;
						}else if ($fileExt == 'shx'){
							$shxExt = true;
						}else if ($fileExt == 'dbf'){
							$dbfExt = true;
						}
					}
					if($shpExt && $shxExt && $dbfExt ){
                        //ricavo la proiezione geometrica del progetto
                        $myFile = CONFIG."settings.ini";
                        $settings = parse_ini_file($myFile,true);
						$proj = $settings['displayProj'];
						$sql_shp_path = $settings['sql_shp_path'];
						$rand_val= date('YmdHis');
						$shpFile = $files[$index];
						$exploded = explode('.',$shpFile['name']);

						$nameWithoutExt = $exploded[0];
						//tabella
						$tableName = strtolower($nameWithoutExt).'_'.$rand_val;
						//file sql
						$sqlPath = $tmpFolder. strtolower($nameWithoutExt).'_'.$rand_val.'.sql';
						//eseguo lo script
						$content = $sql_shp_path."shp2pgsql -s ".$proj." -g the_geom -W \"LATIN1\" ".$tmpFolder.$shpFile['name']." public.".$tableName." > ".$sqlPath;
						exec($content, $output, $res);						
						//ottengo la query generata nel file sql dallo script
						$query = file_get_contents($sqlPath);
						$dbConf = ConnectionManager::get('default')->config();
						//eseguo la query
						$dbi = pg_connect('host='.$dbConf['host'].' port='.$dbConf['port'].' dbname='.$dbConf['database'].' user='.$dbConf['username'].' password='.$dbConf['password']);
						$res = pg_query($dbi,$query);
						$success = ($res === FALSE) ? false : true;
						$conn = ConnectionManager::get('default');				
						if($success){
							foreach($files as $key => $values){
								$fileshapePath = $tmpFolder.$files[$key]['name'];
								if(file_exists($fileshapePath)){
									unlink($fileshapePath);
								}
							}
							if(file_exists($sqlPath)){
								unlink($sqlPath);
							}
							$table = $conn->execute("SELECT * FROM geometry_columns WHERE f_table_name = '".$tableName."'");
							$results = $table ->fetchAll('assoc');
							if($results[0]['srid'] == $proj){
								$project = $this->Projects->get($project_id, [
									'contain' => []
								]);
								$project['shape_table'] = $tableName;
								if($this->Projects->save($project)){
									$msg = 'Shape caricata correttamente!';		
								}else{													
									$conn->execute('DROP TABLE '. $tableName);
									$success = false;
									$msg = 'Errore del server';
								}
								$columns = $conn->execute("SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='".$tableName."'");
								$results = $columns ->fetchAll('assoc');
								$rawType = $conn->execute("SELECT type FROM geometry_columns WHERE f_table_name='".$tableName."'");
								$type  = $rawType->fetchAll('assoc');
							}else{
								$conn->execute('DROP TABLE '. $tableName);
								$success = false;
								$results = null;
								$msg = 'File shape non valido. Sono accettati solo shape in proiezione '.$proj.'';
							}
					
						}else{
							foreach($files as $key => $values){
								$fileshapePath = $tmpFolder.$files[$key]['name'];
								if(file_exists($fileshapePath)){
									unlink($fileshapePath);
								}
							}
							if(file_exists($sqlPath)){
								unlink($sqlPath);
							}
							$msg = 'Impossibile caricare il file di shape. Riprovare più tardi.';
							$results = null;
						}
						
						$output = array(
							'tableName' => $tableName,
							'columns' => $results,
							'type' => $type[0]['type']
						);
						echo json_encode(array(				
							'success' => $success,
							'data' => $output,
							'msgError' => $msg
						));
					}else{
						//errore mancanza file
						$msg = 'Mancano i seguenti file: ';
						if(!$shpExt && $shxExt && $dbfExt){
							$msg .='SHP';
						}else if(!$shpExt && !$shxExt && $dbfExt){
							$msg .='SHP,SHX';
						}else if(!$shpExt && !$shxExt && !$dbfExt){
							$msg .='SHP,SHX,DBF';
						}else if(!$shpExt && $shxExt && !$dbfExt){
							$msg .='SHP,DBF';
						}else if($shpExt && $shxExt && !$dbfExt){
							$msg .='SHX,DBF';
						}
						echo json_encode(array(
							'success' => false,
							'data' => '',
							'msgError' => $msg
						));
					}
					
				}else{
						//Errore dimensione file
						echo json_encode(array(				
						'success' => false,
						'data' => '',
						'msgError' => $dimMsg
					));
				}
			}else{
				//errore nome file
				 echo json_encode(array(
					'success' => false,
					'data' => '',
					'msgError' => "Attenzione! Il nome dei file deve essere uguale!"
				));
			}
		}else{
			//errore numero file
			echo json_encode(array(
				'success' => false,
				'data' => '',
				'msgError' => "Attenzione! I file devono essere 3! SHP, SHX e DBF"
			));
		}
	}
	public function resetShapes(){
		$this->autoRender = 0;
		$data = $this->request->getData();
		$project_id = $this->Projects->get($data['project_id']);
        if ($this->Projects->delete($project_id)) {
            $success = true;           
        } else {
			$success = false;
			$msg = 'Errore del server';
		}
		if($success){
			$conn = ConnectionManager::get('default');
			if($data['poly_table'] != ''){
				$conn->execute('DROP TABLE '. $data['poly_table']);
			}		
			if($data['general_table'] != ''){
				$conn->execute('DROP TABLE '. $data['general_table']);
			}
			if($data['wms_table'] != ''){
				$conn->execute('DROP TABLE '. $data['wms_table']);
			}		
			$msg = 'Creazione del progetto annullata!';						
		}
		echo json_encode(array(
			'success' => $success,
			'data' => array(),
			'msg' => $msg
		));
	}
	public function actionSwitch(){
		$this->autoRender = 0;
		set_time_limit(0);
		$data = $this->request->getData();
		$action = $data['action'];
		$column = $data['column'];
		$tableA = $data['poly_table'];
		$tableB = $data['general_table'];
		$tableOutput = strtolower($tableA.'_output');
		if($column == 'Conteggio'){
			$fieldOutput = strtolower($column);
		}else{
			$fieldOutput = strtolower($column.'_'.substr($action,0,3));
		}		
		$conn = ConnectionManager::get('default');
		$conn ->execute("DROP TABLE IF EXISTS ".$tableOutput."");
		$conn ->execute("SELECT * INTO ".$tableOutput." FROM ".$tableA."");
		$conn ->execute("ALTER TABLE ".$tableOutput."  ADD COLUMN ".$fieldOutput." varchar");
		switch($column){
			case "Conteggio":
			$tableIsReady = $this->countQueryBuilder($tableOutput,$fieldOutput,$tableA,$tableB);
			break;
			default: 
			$tableIsReady = $this->thematizerQueryBuilder($action,$column,$tableOutput,$fieldOutput,$tableA,$tableB);
			break;
		}
		if($tableIsReady){
			$success = true;
			$msg = 'Tabella creata correttamente';
			$conn->execute("UPDATE projects SET wms_table = '".$tableOutput."' WHERE shape_table = '".$tableB."'");
		}else{
			$success = false;
			$msg  = 'Errore del Server';
		}
		echo json_encode(array(
		'success' => $success,
		'message' => $msg,
		'data' => array('output_table' => $tableOutput, 'output_field' => $fieldOutput)));
	}
	public function thematizerQueryBuilder($action,$column,$tableOutput,$fieldOutput,$tableA,$tableB){
		switch($action){
							case "Somma" :	
							$querySuccessful = $this->sumQueryBuilder($column,$tableOutput,$fieldOutput,$tableA,$tableB);
							break;
							case "Minimo" :
							$querySuccessful = $this->minQueryBuilder($column,$tableOutput,$fieldOutput,$tableA,$tableB);
							break;
							case "Massimo" :
							$querySuccessful = $this->maxQueryBuilder($column,$tableOutput,$fieldOutput,$tableA,$tableB);
							break;
							case "Media" :
							$querySuccessful = $this->medQueryBuilder($column,$tableOutput,$fieldOutput,$tableA,$tableB);
							break;
							case "SQM" :
							$querySuccessful = $this->sqmQueryBuilder($column,$tableOutput,$fieldOutput,$tableA,$tableB);
							break;
						}
		return $querySuccessful;
	}
	public function sumQueryBuilder($column,$tableOutput,$fieldOutput,$tableA,$tableB){
		$conn = ConnectionManager::get('default');
		switch($column){
			case "Area": $query = "SELECT SUM(ST_AREA(ST_INTERSECTION(ST_TRANSFORM(tB.the_geom ,32632),ST_TRANSFORM(tA.the_geom ,32632)))) as ".$fieldOutput.", tA.gid 
								   FROM ".$tableB." as tB 
								   JOIN ".$tableA." as tA 
								   ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
								   GROUP BY tA.gid";					
			break;
			case "Perimetro": $query = "SELECT ST_PERIMETER(ST_UNION(ST_TRANSFORM(tB.the_geom,32632))) as ".$fieldOutput.", tA.gid
										FROM ".$tableB." as tB 
										JOIN ".$tableA." as tA 
										ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
										GROUP BY tA.gid";	
			break;
			case "Lunghezza": $query = "SELECT  SUM(ST_LENGTH(ST_INTERSECTION(ST_TRANSFORM(tB.the_geom,32632),ST_TRANSFORM(tA.the_geom,32632)))) as ".$fieldOutput.", tA.gid 
										FROM ".$tableB." as tB 
										JOIN ".$tableA." as tA 
										ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
										GROUP BY tA.gid;";	
			
			break;
			default: $query =  "SELECT SUM(tB.".$column."::int) as ".$fieldOutput.", tA.gid 
								FROM ".$tableB." as tB 
								JOIN ".$tableA." as tA 
								ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
								GROUP BY tA.gid;";
			break;
		}
		$rawData = $conn->execute($query);
		$result = $rawData->fetchAll('assoc');
		$updateQuery = "UPDATE ".$tableOutput." 
						SET ".$fieldOutput." = CASE ";
		foreach($result as $key => $assoc){
		$updateQuery.="
					   WHEN gid = ".$assoc['gid']." THEN ".$assoc[$fieldOutput]."
					   ";
		}
		$updateQuery.= " END";
		if($conn->execute($updateQuery)){
			return true;
		}else{
			return false;
		}
	}
	public function minQueryBuilder($column,$tableOutput,$fieldOutput,$tableA,$tableB){
		$conn = ConnectionManager::get('default');
		switch($column){
			case "Area": $query = "SELECT MIN(ST_AREA(ST_INTERSECTION(ST_TRANSFORM(tB.the_geom ,32632),ST_TRANSFORM(tA.the_geom ,32632)))) as ".$fieldOutput.", tA.gid 
								   FROM ".$tableB." as tB 
								   JOIN ".$tableA." as tA 
								   ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
								   GROUP BY tA.gid";					
			break;
			case "Perimetro": $query = "SELECT MIN(ST_PERIMETER(ST_TRANSFORM(tB.the_geom,32632))) as ".$fieldOutput.", tA.gid
										FROM ".$tableB." as tB 
										JOIN ".$tableA." as tA 
										ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
										GROUP BY tA.gid";	
			break;
			case "Lunghezza": $query = "SELECT  MIN(ST_LENGTH(ST_INTERSECTION(ST_TRANSFORM(tB.the_geom,32632), ST_TRANSFORM(tA.the_geom,32632)))) as ".$fieldOutput.", tA.gid 
										FROM ".$tableB." as tB 
										JOIN ".$tableA." as tA 
										ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
										GROUP BY tA.gid";	
			
			break;
			default: $query =  "SELECT MIN(tB.".$column."::int) as ".$fieldOutput.", tA.gid 
								FROM ".$tableB." as tB 
								JOIN ".$tableA." as tA 
								ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
								GROUP BY tA.gid;";
			break;
		}
		$rawData = $conn->execute($query);
		$result = $rawData->fetchAll('assoc');
		$updateQuery = "UPDATE ".$tableOutput." 
						SET ".$fieldOutput." = CASE ";
		foreach($result as $key => $assoc){
		$updateQuery.="
					   WHEN gid = ".$assoc['gid']." THEN ".$assoc[$fieldOutput]."
					   ";
		}
		$updateQuery.= " END";
		if($conn->execute($updateQuery)){
			return true;
		}else{
			return false;
		}
		
	}
	public function maxQueryBuilder($column,$tableOutput,$fieldOutput,$tableA,$tableB){
		$conn = ConnectionManager::get('default');
		switch($column){
			case "Area": $query = "SELECT MAX(ST_AREA(ST_INTERSECTION(ST_TRANSFORM(tB.the_geom ,32632),ST_TRANSFORM(tA.the_geom ,32632)))) as ".$fieldOutput.", tA.gid 
								   FROM ".$tableB." as tB 
								   JOIN ".$tableA." as tA 
								   ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
								   GROUP BY tA.gid";					
			break;
			case "Perimetro": $query = "SELECT MAX(ST_PERIMETER(ST_TRANSFORM(tB.the_geom,32632))) as ".$fieldOutput.", tA.gid
										FROM ".$tableB." as tB 
										JOIN ".$tableA." as tA 
										ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
										GROUP BY tA.gid";	
			break;
			case "Lunghezza": $query = "SELECT  MAX(ST_LENGTH(ST_INTERSECTION(ST_TRANSFORM(tB.the_geom,32632), ST_TRANSFORM(tA.the_geom,32632)))) as ".$fieldOutput.", tA.gid 
										FROM ".$tableB." as tB 
										JOIN ".$tableA." as tA 
										ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
										GROUP BY tA.gid";	
			
			break;
			default: $query =  "SELECT MAX(tB.".$column."::int) as ".$fieldOutput.", tA.gid 
								FROM ".$tableB." as tB 
								JOIN ".$tableA." as tA 
								ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
								GROUP BY tA.gid;";
			break;
		}
		$rawData = $conn->execute($query);
		$result = $rawData->fetchAll('assoc');
		$updateQuery = "UPDATE ".$tableOutput." 
						SET ".$fieldOutput." = CASE ";
		foreach($result as $key => $assoc){
		$updateQuery.="
					   WHEN gid = ".$assoc['gid']." THEN ".$assoc[$fieldOutput]."
					   ";
		}
		$updateQuery.= " END";
		if($conn->execute($updateQuery)){
			return true;
		}else{
			return false;
		}
	}
	public function medQueryBuilder($column,$tableOutput,$fieldOutput,$tableA,$tableB){
		$conn = ConnectionManager::get('default');
		switch($column){
			case "Area": $query = "SELECT AVG(ST_AREA(ST_INTERSECTION(ST_TRANSFORM(tB.the_geom ,32632),ST_TRANSFORM(tA.the_geom ,32632)))) as ".$fieldOutput.", tA.gid 
								   FROM ".$tableB." as tB 
								   JOIN ".$tableA." as tA 
								   ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
								   GROUP BY tA.gid";					
			break;
			case "Perimetro": $query = "SELECT AVG(ST_PERIMETER(ST_TRANSFORM(tB.the_geom,32632))) as ".$fieldOutput.", tA.gid
										FROM ".$tableB." as tB 
										JOIN ".$tableA." as tA 
										ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
										GROUP BY tA.gid";	
			break;
			case "Lunghezza": $query = "SELECT  AVG(ST_LENGTH(ST_INTERSECTION(ST_TRANSFORM(tB.the_geom,32632), ST_TRANSFORM(tA.the_geom,32632)))) as ".$fieldOutput.", tA.gid 
										FROM ".$tableB." as tB 
										JOIN ".$tableA." as tA 
										ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
										GROUP BY tA.gid";	
			
			break;
			default: $query =  "SELECT AVG(tB.".$column."::int) as ".$fieldOutput.", tA.gid 
								FROM ".$tableB." as tB 
								JOIN ".$tableA." as tA 
								ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
								GROUP BY tA.gid;";
			break;
		}
		$rawData = $conn->execute($query);
		$result = $rawData->fetchAll('assoc');
		$updateQuery = "UPDATE ".$tableOutput." 
						SET ".$fieldOutput." = CASE ";
		foreach($result as $key => $assoc){
		$updateQuery.="
					   WHEN gid = ".$assoc['gid']." THEN ".$assoc[$fieldOutput]."
					   ";
		}
		$updateQuery.= " END";
		if($conn->execute($updateQuery)){
			return true;
		}else{
			return false;
		}
		
	}
	public function sqmQueryBuilder($column,$tableOutput,$fieldOutput,$tableA,$tableB){
		$conn = ConnectionManager::get('default');
		$rawGids = $conn->execute("SELECT DISTINCT gid FROM ".$tableA."");
		$gids = $rawGids->fetchAll('assoc');
		$avg = 0;
				
		switch($column){
			case "Area":
						foreach($gids as $key => $val){
							
							$sqmQuery = "SELECT ST_AREA(ST_INTERSECTION(ST_TRANSFORM(tB.the_geom ,32632),ST_TRANSFORM(tA.the_geom ,32632))) as ".$fieldOutput.",tA.gid
										FROM ".$tableB." as tB 
										JOIN ".$tableA." as tA 
										ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
										WHERE tA.gid = ".$val['gid']."";
										
							$rawSqmData = $conn->execute($sqmQuery);
							$sqmData = $rawSqmData->fetchAll('assoc');
							$n = count($sqmData);
							if($n > 1){
								foreach($sqmData as $k => $value){
									$avg+= $value[$fieldOutput];
								}
								$avg = ($avg / $n);
								$sqm = 0;
								foreach($sqmData as $ke => $valore){
									$sqm+=pow(($valore[$fieldOutput]-$avg),2);
								}
								$sqm = pow(($sqm / ($n-1)),1/2);
								$result[$key] = array('sqm' => $sqm, 'gid' => $val['gid']);
							}else{
								$result[$key] = array('sqm' => 0, 'gid' => $val['gid']);
							}
							
						}
			break;
			case "Perimetro":
							foreach($gids as $key => $val){
								$sqmQuery = "SELECT ST_PERIMETER(ST_TRANSFORM(tB.the_geom,32632)) as ".$fieldOutput.",tA.gid
											FROM ".$tableB." as tB 
											JOIN ".$tableA." as tA 
											ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
											WHERE tA.gid = ".$val['gid']."";
								$rawSqmData = $conn->execute($sqmQuery);
								$sqmData = $rawSqmData->fetchAll('assoc');
								$n = count($sqmData);
								if($n > 1){
									foreach($sqmData as $k => $value){
										$avg+= $value[$fieldOutput];
									}
									$avg = ($avg / $n);
									$sqm = 0;
									foreach($sqmData as $ke => $valore){
										$sqm+=pow(($valore[$fieldOutput]-$avg),2);
									}
									$sqm = pow(($sqm / ($n-1)),1/2);
									$result[$key] = array('sqm' => $sqm, 'gid' => $val['gid']);	
								}else{
									$result[$key] = array('sqm' => 0, 'gid' => $val['gid']);	
								}
							
							}
			break;
			case "Lunghezza":
							foreach($gids as $key => $val){
								$sqmQuery = "SELECT ST_LENGTH(ST_INTERSECTION(ST_TRANSFORM(tB.the_geom,32632), ST_TRANSFORM(tA.the_geom,32632))) as ".$fieldOutput.",tA.gid
											FROM ".$tableB." as tB 
											JOIN ".$tableA." as tA 
											ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
											WHERE tA.gid = ".$val['gid']."";
								$rawSqmData = $conn->execute($sqmQuery);
								$sqmData = $rawSqmData->fetchAll('assoc');
								$n = count($sqmData);
								if($n > 1){
									foreach($sqmData as $k => $value){
										$avg+= $value[$fieldOutput];
									}
									$avg = ($avg / $n);
									$sqm = 0;
									foreach($sqmData as $ke => $valore){
										$sqm+=pow(($valore[$fieldOutput]-$avg),2);
									}
									$sqm = pow(($sqm / ($n-1)),1/2);
									$result[$key] = array('sqm' => $sqm, 'gid' => $val['gid']);
								}else{
									$result[$key] = array('sqm' => 0, 'gid' =>  $val['gid']);
								}
						
							}
			break;
			default:
					foreach($gids as $key => $val){
						$sqmQuery = "SELECT tB.".$column." as ".$fieldOutput.",tA.gid
									FROM ".$tableB." as tB 
									JOIN ".$tableA." as tA 
									ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
									WHERE tA.gid = ".$val['gid']."";
						$rawSqmData = $conn->execute($sqmQuery);
						$sqmData = $rawSqmData->fetchAll('assoc');
						$n = count($sqmData);
						if($n > 1){
							foreach($sqmData as $k => $value){
								$avg+= $value[$fieldOutput];
							}
							$avg = ($avg / $n);
							$sqm = 0;
							foreach($sqmData as $ke => $valore){
								$sqm+=pow(($valore[$fieldOutput]-$avg),2);
							}
							$sqm = pow(($sqm / ($n-1)),1/2);
							$result[$key] = array('sqm' => $sqm, 'gid' => $val['gid']);
						}else{
							$result[$key] = array('sqm' => 0, 'gid' => $val['gid']);
						}
						
					}		
			break;
		}
		$updateQuery = "UPDATE ".$tableOutput." 
						SET ".$fieldOutput." = CASE ";
		foreach($result as $key => $assoc){
		$updateQuery.="
					   WHEN gid = ".$assoc['gid']." THEN ".$assoc['sqm']."
					   ";
		}
		$updateQuery.= " END";
		if($conn->execute($updateQuery)){
			return true;
		}else{
			return false;
		}
	}
	public function countQueryBuilder($tableOutput,$fieldOutput,$tableA,$tableB){
		$conn = ConnectionManager::get('default');
		$query = 	"SELECT COUNT(*) as ".$fieldOutput.", tA.gid 
					FROM ".$tableB." as tB 
					JOIN ".$tableA." as tA 
					ON ST_Intersects(ST_TRANSFORM(tA.the_geom,32632), ST_TRANSFORM(tB.the_geom,32632))
					GROUP BY tA.gid";	
		$rawData = $conn->execute($query);
		$result = $rawData->fetchAll('assoc');
		$updateQuery = "UPDATE ".$tableOutput." 
						SET ".$fieldOutput." = CASE ";
		foreach($result as $key => $assoc){
		$updateQuery.="
					   WHEN gid = ".$assoc['gid']." THEN ".$assoc[strtolower($fieldOutput)]."
					   ";
		}
		$updateQuery.= " END";
		if($conn->execute($updateQuery)){
			return true;
		}else{
			return false;
		}
	}
	public static function normalizeString ($str = '')
{
		$str = strip_tags($str); 
		$str = preg_replace('/[\r\n\t ]+/', ' ', $str);
		$str = preg_replace('/[\"\*\/\:\<\>\?\'\|]+/', ' ', $str);
		$str = strtolower($str);
		$str = html_entity_decode( $str, ENT_QUOTES, "utf-8" );
		$str = htmlentities($str, ENT_QUOTES, "utf-8");
		$str = preg_replace("/(&)([a-z])([a-z]+;)/i", '$2', $str);
		$str = str_replace(' ', '-', $str);
		$str = rawurlencode($str);
		$str = str_replace('%', '-', $str);
		return $str;
}
}
