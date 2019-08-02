<?php
namespace App\Controller;
use App\Controller\AppController;
use Cake\Datasource\ConnectionManager;
use Cake\Utility\Hash;
use Fpdf\Fpdf;
use Tecnickcom\Tcpdf;
/**
 * Thematizer Controller
 *
 *
 * @method \App\Model\Entity\Thematizer[]|\Cake\Datasource\ResultSetInterface paginate($object = null, array $settings = [])
 */
class ThematizerController extends AppController
{
    public function initialize()
    {
        parent::initialize();
        $this->Auth->allow(['index']);
    }
    /**
     * Index method
     *
     * @return \Cake\Http\Response|null
     */
    public function index()
    {   
        $this->autoRender = 0;
        $wms_table = $this->request->getData('wms_table');
        $conn = ConnectionManager::get('default');											
        $columns = $conn->execute("SELECT column_name FROM INFORMATION_SCHEMA.COLUMNS WHERE table_name='".$wms_table."'");
        $results = $columns ->fetchAll('assoc');
		$classifications = array();
		if($this->request->getData('project') == 'true'){
			$conf = $conn->execute("SELECT wms_conf FROM projects WHERE wms_table='".$wms_table."'");
			$wms_conf = json_decode($conf->fetchAll('assoc')[0]['wms_conf'],true);
			$classifications = json_decode($wms_conf['classifications'],true);
			
		}
		
        if($results && count($results)>0){
			if($classifications && count($classifications)>0){
				$success = true;
				$msg = '';
				$data = array('columns' => $results,
				'classifications' => $classifications,
				'themacol' => $wms_conf['themacolumn'],
				'labelcol' => $wms_conf['labelcolumn'],
				'layername' => $wms_conf['layer_name'],
				'labelcolor' => $wms_conf['labelcolor']);
			}else{
				$success = true;
				$msg = '';
				$data = array('columns' => $results);
			}
            
        }else{
            $success = false;
            $msg = 'Errore del Server';
            $data = array();
        }
        echo json_encode(array(
            'success' => $success,
            'data' => $data,
            'msg' => $msg
        ));					
    }
    public function retrieveValues(){
        $this->autoRender=0;
        $column = $this->request->getData('themacolumn');
        $table = $this->request->getData('wms_table');
        $conn = ConnectionManager::get('default');											
        $data = $conn->execute("SELECT ".$column." FROM ".$table);
        $values = $data ->fetchAll('assoc');
        if($values && count($values)>0){
            $success = true;
            $msg = '';
            $data = $values;
        }else{
            $success = false;
            $msg = 'Errore del Server';
            $data = array();
        }
        echo json_encode(array(
            'success' => $success,
            'data' => $data,
            'msg' => $msg
        ));		

    }
	public function endThematizer(){
		$this->autoRender = 0;
		$data = $this->request->getData();
		$poly_table = $data['poly_table'];
		$gen_table = $data['general_table'];
		$project_id = $data['project_id'];
		$conn = ConnectionManager::get('default');
		$deletedPoly = true;
		$deletedGen = true;
		if($poly_table != ''){
			$deletedPoly = false;
			if($conn->execute("DROP TABLE ".$poly_table."")){
				$deletedPoly = true;
			}
			$conn->execute("UPDATE projects SET polygon_table = null WHERE id = ".$project_id."");
		}
		if($gen_table != ''){
			$deletedGen = false;
			if($conn->execute("DROP TABLE ".$gen_table."")){
				$deletedGen = true;
			}
			$conn->execute("UPDATE projects SET shape_table = null WHERE id = ".$project_id."");
		}
		
		if($deletedPoly && $deletedGen){
			$success = true;
			$msg = 'Progetto creato correttamente!';
			$data = array();
		}else{
			$success = false;
			$msg = 'Errore del Server';
			$data = array();
		}
		echo json_encode(array(
			'success' => $success,
			'data' => $data,
			'message' => $msg
			));
	}
	   public function shapeExport(){
        $this->autoRender = 0;
        $data = $this->request->getData();
        $wms_table = $data['wms_table'];
        $schemadefinition = $this->schema_definition($wms_table, false);
        $tableKeys = array_diff(array_keys($schemadefinition), array('the_geom'));
        $implodedKeys = implode(',',$tableKeys);
        $conn = ConnectionManager::get('default');
        $results = $conn
                    ->newQuery()
                    ->select($implodedKeys)
                    ->from($wms_table)
                    ->execute()
                    ->fetchAll('assoc');
        if(isset($results) && count($results) > 0){
			//shp export
			$myFile = CONFIG."settings.ini";
            $settings = parse_ini_file($myFile,true);
			$sql_shp_path = $settings['sql_shp_path'];
            $shp_folder = realpath('../../tmp');
			$config = ConnectionManager::get('default')->config();
			$options = "";
			$options .= '-f '.$shp_folder.DS.$wms_table.'.shp ';
			$options .= "-h ".$config['host']." ";
			$options .= "-u ".$config['username']." ";
			$options .= "-P ".$config['password']." ";
			$options .= ' '.$config['database'];
			$options .= ' '.$wms_table;
			$cmd = $sql_shp_path.'pgsql2shp ';
            exec($cmd.$options, $return);
			$files = array(
				"/tmp/".$wms_table.".shp" => $wms_table.".shp",
				"/tmp/".$wms_table.".shx" => $wms_table.".shx",
				"/tmp/".$wms_table.".dbf" => $wms_table.".dbf",
				"/tmp/".$wms_table.".cpg" => $wms_table.".cpg"
            );
            $zipname = $shp_folder.DS.$wms_table.'.zip';
			$zip = new \ZipArchive();
			if($zip->open($zipname, \ZipArchive::CREATE)){
                foreach ($files as $file_path => $file_name) {
                    $zip->addFile($file_path,$file_name);
                }			
            }
			$zip->close();		
            $fileUrl= "http://172.16.100.146".$zipname;
			echo json_encode(array(
                'success' => true,
                'data' => $fileUrl,
                'msg' => ''
            ));			
		}else{
			echo json_encode(array(
                'success' => false,
                'data' => array(),
                'msg' => 'Nessuna tabella da esportare. Errore del Server.'
            ));	
		
		}
    }
	public function generatePdf(){
		$data = $this->request->getData();
		$wms_table = $data['wms_table'];
		$classifications = json_decode($data['classifications'],true);
		$project_id = $data['project_id'];
		$myFile = CONFIG."settings.ini";
        $settings = parse_ini_file($myFile,true);
		$proj = $settings['displayProj'];
		$xmin = $settings['x_min'];
		$ymin = $settings['y_min'];
		$xmax = $settings['x_max'];
		$ymax = $settings['y_max'];		
		$conn = ConnectionManager::get('default');
		$project = $conn->execute("SELECT * FROM projects WHERE wms_table = '".$wms_table."'");
		$fetchedProject = $project->fetchAll('assoc')[0];	
		$project_name = $fetchedProject['name'];
		$project_desc = $fetchedProject['description'];
		$desc_title = $fetchedProject['desc_title'];
		$legend_title = $fetchedProject['legend_title'];		
		$mapserverUrl = 'http://172.16.100.146/cgi-bin/mapserv?MAP=';
		$mapfileDir = ROOT.DS.'mapfiles/';
		$mapfileName = $this->normalizeString($project_name);	
		$map = $mapfileDir.$mapfileName.'.map';
		if(!file_exists($map)){
			$output = $this->generateMapfile($data);
			if(!$output){
				$this->autoRender = 0;
				echo json_encode(array(
					'success' => false,
					'msg' => 'Impossibile generare il pdf in questo momento. Controllare che siano inseriti tutti i dati della classificazione.',
					'data' => array()
				));
			}
		}
			$wms_conf = json_decode($fetchedProject['wms_conf'],true);
			$layers = $wms_conf['layer_name'].',limiti_comunali';
			$format = 'image/png';
			$transparent = true;
			$service = 'WMS';
			$version = '1.1.1';
			$request = 'getMap';
			$styles = '';
			$exceptions = 'application/vnd.ogc.se_inimage';
			$srs = 'EPSG:'.$proj;
			$bbox = $xmin.','.$ymin.','.$xmax.','.$ymax;
			$width = 900;
			$height= 780;
			//Chiamata per l'immagine principale
			$finalUrl = $mapserverUrl.$map.'&SB=K&LAYERS='.$layers.'&FORMAT='.$format.'&TRANSPARENT='.$transparent.'&SERVICE='.$service.'&VERSION='.$version.'&REQUEST='.$request.'&STYLES='.$styles.'&EXCEPTIONS='.$exceptions.'&SRS='.$srs.'&BBOX='.$bbox.'&WIDTH='.$width.'&HEIGHT='.$height;		
			$img = './resources/images/pdfImage_'.date('YmdHms').'.png';	
			file_put_contents($img, file_get_contents($finalUrl));
			//Chiamata per l'immagine inquadramento
			$quadroImg = './resources/images/quadroImage_'.date('YmdHms').'.png';
			$layers = 'quadro';
			$width = 200;
			$height = 200;
			$map = $mapfileDir.$mapfileName.'_quadro.map';
			$finalUrl = $mapserverUrl.$map.'&LAYERS='.$layers.'&FORMAT='.$format.'&TRANSPARENT='.$transparent.'&SERVICE='.$service.'&VERSION='.$version.'&REQUEST='.$request.'&STYLES='.$styles.'&EXCEPTIONS='.$exceptions.'&SRS='.$srs.'&BBOX='.$bbox.'&WIDTH='.$width.'&HEIGHT='.$height;
			file_put_contents($quadroImg, file_get_contents($finalUrl));
			$legend = '';
			foreach($classifications as $key => $value){
				$val = $value['value'];
				$color = '#'.$value['color'];
				$legendValue = $value['legend'];
				$legend.= '<span style="line-height:10px;background-color:'.$color.';color:'.$color.'">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>&nbsp;'.$legendValue.'<br>';
			}
			$this->set('legend',$legend);
			$this->set('legendTitle', $legend_title);
			$this->set('descTitle', $desc_title);
			$this->set('projectName', $project_name);
			$this->set('fileName',$mapfileName);
			$this->set('projectDesc', $project_desc);
			$this->set('mapImage',$img);
			$this->set('quadroImage',$quadroImg);
			$this->set('title', 'My Great Title');
		
	}
	public function saveThema(){
		$this->autoRender = 0;
		$data = $this->request->getData();
		$project_id = $data['project_id'];
		$themacolumn = $data['themacolumn'];
		$labelcolumn = $data['labelcolumn'];
		$labelcolor = $data['label_color'];
		$layer_name = $data['layer_name'];
		$this->loadModel('Projects');
		$Project = $this->Projects->get($project_id, [
            'contain' => []
        ]);
		$projectData['wms_conf'] = json_encode(array(
			'layer_name' => $layer_name,
			'classifications' => $data['classifications'],
			'themacolumn' => $themacolumn,
			'labelcolumn' => $labelcolumn,
			'labelcolor' => $labelcolor));
            $Project = $this->Projects->patchEntity($Project, $projectData);
			$msg = '';
            if ($this->Projects->save($Project)) {
                $success = true;
				$msg = 'Impostazioni salvate correttamente!';
				$data = array();
            }else{
                $success = false;
				$msg = 'Errore del Server.';
				$data = array();
            }
		echo json_encode(array(
			'success' => $success,
			'data' => $data,
			'message' => $msg
		));
	}	
    public function generateWms(){
		$this->autoRender=0;
        $data = $this->request->getData();
		$output = $this->generateMapfile($data);
		if($output){
			$success = true;
			$msg = 'Mapfile generato correttamente!';
			$data = array(
			'endpoint' => $output['projectData']['wms_endpoint'],
			'layers' => $output['projectData']['wms_layers']);
		}else{
			$success = false;
			$msg = 'Impossibile generare il mapfile in questo momento. Controllare che siano inseriti tutti i dati della classificazione.';
			$data = array();
		}	
		echo json_encode(array(
                'success' => $success,
                'data' => $data,
                'msg' => $msg
            ));	
		
    }
	public function generateMapFile($data){
		$mapfileFolder = ROOT.DS.'mapfiles';
		$project_id = $data['project_id'];
        $classifications = json_decode($data['classifications'],true);
		$validClass = true;
		foreach($classifications as $key => $val){
			if($val['value'] == '' || $val['color'] == '' || $val['legend'] == ''){
				$validClass = false;
			}
		}
		if(!$validClass){
			return false;
		}
        $wms_table = $data['wms_table'];
        $themacolumn = $data['themacolumn'];
		$labelcolumn = $data['labelcolumn'];
		$labelcolor = $data['label_color'];
		$finalLabelColor = $this->hexToRgb('#'.$labelcolor);	
		$layer_name = $data['layer_name'];
        $opacity = $data['wms_transp'];		
        $schemadefinition = $this->schema_definition($wms_table, false);
        $tableKeys = array_keys($schemadefinition);
		$myFile = CONFIG."settings.ini";
        $settings = parse_ini_file($myFile,true);
		$proj = $settings['displayProj'];
		$xmin = $settings['x_min'];
		$ymin = $settings['y_min'];
		$xmax = $settings['x_max'];
		$ymax = $settings['y_max'];
		$dbconf = ConnectionManager::get('default')->config();
		$conn = ConnectionManager::get('default');
		$project = $conn->execute("SELECT * FROM projects WHERE wms_table = '".$wms_table."'");
		$fetchedProject = $project->fetchAll('assoc');
		$projectName = $this->normalizeString($fetchedProject[0]['name']);
		$wms_title = $projectName.'_'.date("Ymd");
		$table = $conn->execute("SELECT * FROM geometry_columns WHERE f_table_name = '".$wms_table."'");
		$results = $table ->fetchAll('assoc');
		$shapeType = $results[0]['type'];
		$geomColumn = $results[0]['f_geometry_column'];
		if($shapeType == 'MULTIPOLYGON'){
			$shapeType = 'POLYGON';
		}else if($shapeType == 'MULTILINE'){
			$shapeType = 'LINE';
		}else if($shapeType == 'MULTIPOINT'){
			$shapeType = 'POINT';
		}		
		$queryResult = $conn->execute('SELECT proj4text FROM spatial_ref_sys WHERE auth_srid = '.$proj);
		$projection = $queryResult ->fetchAll('assoc');
		
		$projection = explode('+',$projection[0]['proj4text']);
		foreach($projection as $key => $value){
			$projection[$key] = trim($value);
		}
		$projection = array_values(array_filter($projection));
		$content = 'MAP
						NAME "'.strtoupper($projectName).'"
						STATUS on
						SIZE   640 442
						MAXSIZE   4096
						EXTENT   '.$xmin.' '.$ymin.' '.$xmax.' '.$ymax.'
						UNITS   METERS
						RESOLUTION 72
						SYMBOLSET   "/var/www/html/symbols/thematizer.sym"
						FONTSET   "/var/www/html/fonts/fonts.txt"
						IMAGECOLOR   255 255 255
						PROJECTION 
							';
		foreach($projection as $key => $value){
			$content.='"'.$value.'" ';
		}
		$content.='
		                END
						WEB
						  IMAGEPATH   "/var/www/html/tmp/"
						  IMAGEURL   "'.$_SERVER['HTTP_ORIGIN'].'/tmp/"
						  #MINSCALEDENOM   100
						  MAXSCALEDENOM   1500000
						  METADATA
						    WMS_TITLE   "'.strtoupper($projectName).'"
						    WMS_SRS   "epsg:32632 epsg:4326 epsg:900913 epsg:3857"
						    WMS_ONLINERESOURCE   "'.$_SERVER['HTTP_ORIGIN'].'/cgi-bin/mapserv?map='.$mapfileFolder.DS.$projectName.'.map"
						    WMS_FEATURE_INFO_MIME_TYPE   "text/html"
						    WMS_ABSTRACT   ""
						    WMS_INCLUDE_ITEMS "all"
						  END    
						END
						 OUTPUTFORMAT
						  NAME   "png"
						  DRIVER   "GD/PNG"
						  MIMETYPE   "image/png"
						  IMAGEMODE   "RGBA"
						  EXTENSION   "png"
						  FORMATOPTION   "INTERLACE=ON"
						  TRANSPARENT  on
						 END
						 #SCALEBAR
						   #INTERVALS 5
						   #UNITS kilometers
						   #OUTLINECOLOR 0 0 0
						  #STYLE 0
						   #STATUS embed
						     #LABEL
						   	   #SIZE small
							   #COLOR 0 0 0
							 #END
						 #END

#---------- start layer '.$layer_name.'----------

                         LAYER
						   NAME   "'.$layer_name.'"
						   CONNECTION   "user='.$dbconf['username'].' dbname='.$dbconf['database'].' host='.$dbconf['host'].' password='.$dbconf['password'].' port='.$dbconf['port'].'"
						   CONNECTIONTYPE  postgis
						   TYPE  '.$shapeType.'
						   DATA   "'.$geomColumn.' from '.$wms_table.' USING UNIQUE gid USING srid = '.$proj.'"
						   OPACITY '.$opacity.'
						   LABELITEM   "'.$labelcolumn.'"
						   CLASSITEM   "'.$themacolumn.'" 
						   ';						
		foreach($classifications as $key => $val){
			
			$rawExpression = $val['value'];
			$className = $val['legend'];
			$itemColor = '#'.$val['color'];
			$finalItemColor = $this->hexToRgb($itemColor);
			if(is_numeric($rawExpression)){
				$expression = "('[".$themacolumn."]' = '".$rawExpression."')";
			}else if(strpos($rawExpression, '|')){
				$rawValues = explode('|',$rawExpression);
				$expression = '(';
				$i = 0;
				$len = count($rawValues);
				foreach($rawValues as $key2 => $v){
					if($i != ($len-1)){
						$condition[$key2]="'[".$themacolumn."]' = '".$v."' OR ";
					}else{
						$condition[$key2]="'[".$themacolumn."]' = '".$v."'";
					}
					$expression.=$condition[$key2];
					$i++;
				}
				$expression.=')';			
			}else if(strpos($rawExpression, ',')){
				$rawValues = explode(',',$rawExpression);
				if($rawValues[0][0] == '<' AND $rawValues[0][1] == '='){
					$firstCondition = '<=';
				}else if($rawValues[0][0] == '<'){
					$firstCondition = '<';
				}else if($rawValues[0][0] == '>' AND $rawValues[0][1] == '='){
					$firstCondition = '>=';
				}else if($rawValues[0][0] == '>'){
					$firstCondition = '>';
				}else{
					$firstCondition = '=';
				}
				if($rawValues[1][0] == '<' AND $rawValues[1][1] == '='){
					$lastCondition = '<=';
				}else if($rawValues[1][0] == '<'){
					$lastCondition = '<';
				}else if($rawValues[1][0] == '>' AND $rawValues[1][1] == '='){
					$lastCondition = '>=';
				}else if($rawValues[1][0] == '>'){
					$lastCondition = '>';
				}else{
					$lastCondition = '=';
				}
				if($firstCondition == '='){
					$finalFirstValue = $rawValues[0];
					$firstCondition = '>=';
				}else{
					$explodedFirstValue = explode($firstCondition,$rawValues[0]);
					$finalFirstValue = end($explodedFirstValue);
				}
				
				if($lastCondition == '='){
					$finalLastValue = $rawValues[1];
					$lastCondition = '<=';
				}else{
					$explodedLastValue = explode($lastCondition,$rawValues[1]);
					$finalLastValue = end($explodedLastValue);
				}				
				$expression = "('[".$themacolumn."]' ".$firstCondition." '".$finalFirstValue."' AND '[".$themacolumn."]' ".$lastCondition." '".$finalLastValue."')";				
			}else if($rawExpression[0] == '<' AND $rawExpression[1] == '='){
				$rawValue = explode('<=',$rawExpression);
				$expression = "('[".$themacolumn."]' <= '".end($rawValue)."')";
				
			}else if($rawExpression[0] == '<'){
				$rawValue = explode('<',$rawExpression);
				$expression = "('[".$themacolumn."]' < '".end($rawValue)."')";
				
			}else if($rawExpression[0] == '>' AND $rawExpression[1] == '='){
				$rawValue = explode('>=',$rawExpression);
				$expression = "('[".$themacolumn."]' >= '".end($rawValue)."')";
				
			}else if($rawExpression[0] == '>'){
				$rawValue = explode('>',$rawExpression);
				$expression = "('[".$themacolumn."]' > '".end($rawValue)."')";
			}else if(is_string($rawExpression)){
				$expression = "('[".$themacolumn."]' = '".$rawExpression."')";
			}
			$class = 'CLASS
						     NAME "'.$className.'"
							 EXPRESSION '.$expression.' 
							 STYLE
							   BACKGROUNDCOLOR '.($finalItemColor['r']-1 > 0 ? ($finalItemColor['r']-1) : $finalItemColor['r']).' '.($finalItemColor['g']-1 > 0 ? ($finalItemColor['g']-1) : $finalItemColor['g']).' '.($finalItemColor['b']-1 > 0 ? ($finalItemColor['b']-1) : $finalItemColor['b']).'
							   COLOR '.$finalItemColor['r'].' '.$finalItemColor['g'].' '.$finalItemColor['b'].'
							   OUTLINECOLOR  '.($finalItemColor['r']+2 < 255 ? ($finalItemColor['r']+2) : $finalItemColor['r']).' '.($finalItemColor['g']+2 < 255 ? ($finalItemColor['g']+2) : $finalItemColor['g']).' '.($finalItemColor['b']+2 <255 ? ($finalItemColor['b']+2) : $finalItemColor['b']).' 
							 END
							 LABEL
							   COLOR  '.$finalLabelColor['r'].' '.$finalLabelColor['g'].' '.$finalLabelColor['b'].' 
							   FONT   "arial"
							   #OUTLINECOLOR '.($finalLabelColor['r']+2 < 255 ? ($finalLabelColor['r']+2) : $finalLabelColor['r']).' '.($finalLabelColor['g']+2 < 255 ? ($finalLabelColor['g']+2) : $finalLabelColor['g']).' '.($finalLabelColor['b']+2 <255 ? ($finalLabelColor['b']+2) : $finalLabelColor['b']).'
							   ##POSITION  cc
							   SIZE  10
							   TYPE  truetype
							 END    
						   END
						  
						   ';
		   $content.=$class;
		}
		$content.='METADATA
							 ORNAME "'.$layer_name.'"
							 WMS_ENABLE_REQUEST "*"
							 WMS_SRS  "epsg:32632"
							 WMS_TITLE  "'.$layer_name.'"
							 WMS_INCLUDE_ITEMS "all"
							 WMS_FEATURE_INFO_MIME_TYPE  "text/html"	
						   END    
						   PROCESSING "CLOSE_CONNECTION=DEFER"
					    END 
#---------- start layer limiti_comunali----------

                         LAYER
						   NAME   "limiti_comunali"
						   CONNECTION   "user='.$dbconf['username'].' dbname='.$dbconf['database'].' host='.$dbconf['host'].' password='.$dbconf['password'].' port='.$dbconf['port'].'"
						   CONNECTIONTYPE  postgis
						   TYPE  POLYGON
						   DATA   "the_geom from limiti_comunali USING UNIQUE gid USING srid = 32632"
						   #LABELITEM   "name"
						   CLASS						   
						      NAME  "limiti"
						      STYLE
							    MAXSIZE  1
							    OUTLINECOLOR  179 179 179
								SYMBOL  "linea_continua"
							    SIZE  1
							  END
							  #LABEL
								#COLOR  64 64 64
								#FONT  "arial"
								#POSITION  auto
								#SIZE  10
								#TYPE  truetype
							 # END    
						   END
						   METADATA
						     WMS_ENABLE_REQUEST "*"
						     ORNAME   "limiti_comunali"
						     WMS_SRS  "epsg:32632 epsg:4326 epsg:900913 epsg:3857 epsg:32633"
						     WMS_TITLE  "limiti_comunali"
						     WMS_FEATURE_INFO_MIME_TYPE  "text/html"
						   END    
						   PROCESSING "CLOSE_CONNECTION=DEFER"
						 END						   						 
						   '."\n".'END';						
		$mapFile = fopen($mapfileFolder.DS.$projectName.'.map','w');
		
		if(fwrite($mapFile,$content)){
			fclose($mapFile);
		$contentQuadro = 'MAP
						NAME "'.strtoupper($projectName).'_QUADRO'.'"
						STATUS on
						SIZE   640 442
						MAXSIZE   4096
						EXTENT   '.$xmin.' '.$ymin.' '.$xmax.' '.$ymax.'
						UNITS   METERS
						RESOLUTION 72
						SYMBOLSET   "/var/www/html/symbols/thematizer.sym"
						FONTSET   "/var/www/html/fonts/fonts.txt"
						IMAGECOLOR   255 255 255
						PROJECTION 
							';
		foreach($projection as $key => $value){
			$contentQuadro.='"'.$value.'" ';
		}	
		$contentQuadro.='
		                END
						WEB
						  IMAGEPATH   "/var/www/html/tmp/"
						  IMAGEURL   "http://172.16.100.146/tmp/"
						  #MINSCALEDENOM   100
						  MAXSCALEDENOM   1500000
						  METADATA
						    WMS_TITLE   "'.strtoupper($projectName).'_QUADRO'.'"
						    WMS_SRS   "epsg:32632 epsg:4326 epsg:900913 epsg:3857"
						    WMS_ONLINERESOURCE   "http://172.16.100.146/cgi-bin/mapserv?map='.$mapfileFolder.DS.$projectName.'_quadro'.'.map"
						    WMS_FEATURE_INFO_MIME_TYPE   "text/html"
						    WMS_ABSTRACT   ""
						    WMS_INCLUDE_ITEMS "all"
						  END    
						END
						 OUTPUTFORMAT
						  NAME   "png"
						  DRIVER   "GD/PNG"
						  MIMETYPE   "image/png"
						  IMAGEMODE   "RGBA"
						  EXTENSION   "png"
						  FORMATOPTION   "INTERLACE=ON"
						  TRANSPARENT  on
						 END

#---------- start layer quadro----------

                         LAYER
						   NAME   "quadro"
						   CONNECTION   "user='.$dbconf['username'].' dbname='.$dbconf['database'].' host='.$dbconf['host'].' password='.$dbconf['password'].' port='.$dbconf['port'].'"
						   CONNECTIONTYPE  postgis
						   TYPE  POLYGON
						   DATA   "the_geom from limiti_comunali USING UNIQUE gid USING srid = 32632"
						   #LABELITEM   "name"
						   CLASS						   
						      NAME  "limiti"
						      STYLE
							    MAXSIZE  1
							    OUTLINECOLOR  0 0 205
								COLOR 0 0 205
								SYMBOL  "linea_continua"
							    SIZE  1
							  END
							 # LABEL
								#COLOR  64 64 64
								#FONT  "arial"
								#POSITION  auto
								#SIZE  10
								#TYPE  truetype
							  #END    
						   END
						   METADATA
						     WMS_ENABLE_REQUEST "*"
						     ORNAME   "quadro"
						     WMS_SRS  "epsg:32632"
						     WMS_TITLE  "quadro"
						     WMS_FEATURE_INFO_MIME_TYPE  "text/html"
						   END    
						   PROCESSING "CLOSE_CONNECTION=DEFER"
						 END						   						 
						   '."\n".'END';
		$mapQuadroFile = fopen($mapfileFolder.DS.$projectName.'_quadro.map','w');
		fwrite($mapQuadroFile,$contentQuadro);
		fclose($mapQuadroFile);
		$this->loadModel('Projects');
		$Project = $this->Projects->get($project_id, [
            'contain' => []
        ]);
		$projectData['wms_layers'] = $layer_name.',limiti_comunali';
		$projectData['wms_transparent'] = true;
		$projectData['wms_title'] = $layer_name;
		$projectData['wms_format'] = 'image/png';
		$projectData['wms_attribution'] = '';
		$projectData['wms_maxzoom'] = 18;
		$projectData['wms_endpoint'] = $_SERVER['HTTP_ORIGIN'].'/cgi-bin/mapserv?map='.$mapfileFolder.DS.$projectName.'.map';
		$projectData['wms_conf'] = json_encode(array(
			'layer_name' => $layer_name,
			'classifications' => $data['classifications'],
			'themacolumn' => $themacolumn,
			'labelcolumn' => $labelcolumn,
			'labelcolor' => $labelcolor));
            $Project = $this->Projects->patchEntity($Project, $projectData);
			$msg = '';
            if ($this->Projects->save($Project)) {
                return array('data' => $data, 'projectData' => $projectData);
            }else{
                return false;
            }
		}else{
			return false;
		}
	}
	public function deleteWmsTable(){
		$this->autoRender = 0;
		$wms_table = $this->request->getData('wms_table');
		$conn = ConnectionManager::get('default');
		if($wms_table != ''){
			if($conn->execute("DROP TABLE ".$wms_table."")){
				$success = true;
			}else{
				$success = false;
			}
		}else{
			$success = false;
		}	
		$msg = '';
		$data = array();
		echo json_encode(array(
			'success' => $success,
			'data' => $data,
			'message' => $msg
			));
	}
	
    public function schema_definition($table_name=null,$remove_geom=true){
		if($table_name==null){
		return array();
        }
        $conn = ConnectionManager::get('default');
        $results = $conn->execute("SELECT  c.COLUMN_NAME,c.DATA_TYPE as type, c.character_maximum_length as length, c.is_nullable as null
                                ,CASE WHEN pk.COLUMN_NAME IS NOT NULL THEN 'primary' ELSE null END AS key
                                FROM INFORMATION_SCHEMA.COLUMNS c
                                LEFT JOIN (
                                SELECT ku.TABLE_CATALOG,ku.TABLE_SCHEMA,ku.TABLE_NAME,ku.COLUMN_NAME
                                FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS tc
                                INNER JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS ku
                                ON tc.CONSTRAINT_TYPE = 'PRIMARY KEY' 
                                AND tc.CONSTRAINT_NAME = ku.CONSTRAINT_NAME
                                )   pk 
                                ON  c.TABLE_CATALOG = pk.TABLE_CATALOG
                                AND c.TABLE_SCHEMA = pk.TABLE_SCHEMA
                                AND c.TABLE_NAME = pk.TABLE_NAME
                                AND c.COLUMN_NAME = pk.COLUMN_NAME WHERE c.TABLE_NAME = '".$table_name."'
                                ORDER BY c.TABLE_SCHEMA,c.TABLE_NAME, c.ORDINAL_POSITION;");
        $_schema_definition = $results->fetchAll('assoc');
		$schema_definition = array();
		foreach($_schema_definition as $index => $info_field){
		if($info_field['column_name']=='the_geom' and $remove_geom){
			continue;
			}	
			$key = $info_field['column_name'];
			if($info_field['key']==null){
			unset($info_field['key']);
			}
			if($info_field['type']=='character varying' or $info_field['type']=='text'){
			$info_field['type'] = 'string';
			}
			$info_field['null'] = ($info_field['null']=='YES') ? true : false;
			unset($info_field['column_name']);
			$schema_definition[$key] = $info_field;
        }
		return $schema_definition;
    }
	public function hexToRgb($hex, $alpha = false) {
	   $hex      = str_replace('#', '', $hex);
	   $length   = strlen($hex);
	   $rgb['r'] = hexdec($length == 6 ? substr($hex, 0, 2) : ($length == 3 ? str_repeat(substr($hex, 0, 1), 2) : 0));
	   $rgb['g'] = hexdec($length == 6 ? substr($hex, 2, 2) : ($length == 3 ? str_repeat(substr($hex, 1, 1), 2) : 0));
	   $rgb['b'] = hexdec($length == 6 ? substr($hex, 4, 2) : ($length == 3 ? str_repeat(substr($hex, 2, 1), 2) : 0));
	   if ( $alpha ) {
		  $rgb['a'] = $alpha;
	   }
	   return $rgb;
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
?>