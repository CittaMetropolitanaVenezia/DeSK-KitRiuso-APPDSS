<?php
namespace App\Controller;

use App\Controller\AppController;
use Cake\Core\Configure;
/**
 * Configuration Controller
 *
 *
 * @method \App\Model\Entity\Configuration[]|\Cake\Datasource\ResultSetInterface paginate($object = null, array $settings = [])
 */
class ConfigurationController extends AppController
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
        $myFile = CONFIG."settings.ini";
        $settings = parse_ini_file($myFile,true);
		$ipFile = CONFIG."config.ini";
		$privateIp = parse_ini_file($ipFile,true)['privateIp'];
        if($settings && count($settings)>0){
            foreach($settings as $key => $val){
                $data[$key] = $val;
            }
			$data['privateIp'] = $privateIp;
            $success = true;
            $msg = 'Impostazioni caricate correttamente';
        }else{
            $success = false;
            $msg = 'Impossibile caricare le impostazioni';
            $data = array();
        }
        echo json_encode(array(
            'success' => $success,
            'data' => $data,
            'msg' => $msg
        ));
    }

    /**
     * Edit method
     *
     * @param string|null $id Configuration id.
     * @return \Cake\Http\Response|null Redirects on successful edit, renders view otherwise.
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function edit($id = null)
    {
        $this->autoRender = 0;
        $data = $this->request->getData();     
        $myFile = CONFIG."settings.ini";
        $keys = array_keys($this->request->getData());
        foreach($keys as $num => $val){
            $conf[$val] = $data[$val];
        }
        $success = $this->write_ini_file($myFile,$conf);
        if($success){
            $msg = 'Dati salvati correttamente!';
        }else{
            $msg = 'Errore del server';
        }
        echo json_encode(array(
            'success' => $success,
            'data' => '',
            'msg' => $msg
        ));

    }

    function write_ini_file($file, $array = []) {
        // check first argument is string
        if (!is_string($file)) {
            throw new \InvalidArgumentException('Function argument 1 must be a string.');
        }

        // check second argument is array
        if (!is_array($array)) {
            throw new \InvalidArgumentException('Function argument 2 must be an array.');
        }

        // process array
        $data = array();
        foreach ($array as $key => $val) {
            if (is_array($val)) {
                $data[] = "[$key]";
                foreach ($val as $skey => $sval) {
                    if (is_array($sval)) {
                        foreach ($sval as $_skey => $_sval) {
                            if (is_numeric($_skey)) {
                                $data[] = $skey.'[] = '.(is_numeric($_sval) ? $_sval : (ctype_upper($_sval) ? $_sval : '"'.$_sval.'"'));
                            } else {
                                $data[] = $skey.'['.$_skey.'] = '.(is_numeric($_sval) ? $_sval : (ctype_upper($_sval) ? $_sval : '"'.$_sval.'"'));
                            }
                        }
                    } else {
                        $data[] = $skey.' = '.(is_numeric($sval) ? $sval : (ctype_upper($sval) ? $sval : '"'.$sval.'"'));
                    }
                }
            } else {
                $data[] = $key.' = '.(is_numeric($val) ? $val : (ctype_upper($val) ? $val : '"'.$val.'"'));
            }
            // empty line
            $data[] = null;
        }

        // open file pointer, init flock options
        $fp = fopen($file, 'w');
        $retries = 0;
        $max_retries = 100;

        if (!$fp) {
            return false;
        }

        // loop until get lock, or reach max retries
        do {
            if ($retries > 0) {
                usleep(rand(1, 5000));
            }
            $retries += 1;
        } while (!flock($fp, LOCK_EX) && $retries <= $max_retries);

        // couldn't get the lock
        if ($retries == $max_retries) {
            return false;
        }

        // got lock, write data
        fwrite($fp, implode(PHP_EOL, $data).PHP_EOL);

        // release lock
        flock($fp, LOCK_UN);
        fclose($fp);

        return true;
    } 
}
