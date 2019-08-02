<?php
namespace App\Controller;

use App\Controller\AppController;
use Cake\Utility\Security;
use \Firebase\JWT\JWT;

/**
 * Users Controller
 *
 * @property \App\Model\Table\UsersTable $Users
 *
 * @method \App\Model\Entity\User[]|\Cake\Datasource\ResultSetInterface paginate($object = null, array $settings = [])
 */
class UsersController extends AppController
{
    public function initialize()
    {
        parent::initialize();
        $this->Auth->allow(['login','logout']);
    }
    /**
     * Index method
     *
     * @return \Cake\Http\Response|null
     */
    public function index()
    {
        $users= $this->paginate($this->Users);
        $this->autoRender= 0;
        echo json_encode(array(
                'success' => true,
                'data' => $users,
                'msg' => '',
            ));
        //exit;
    }
    public function changepsw(){
        
        $this->autoRender= 0;
        $input = $this->request->getData();
        $userData['password'] = $input['password'];
        $userData['otp'] = false;
        $user = $this->Users->get($this->Auth->user('id'), [
            'contain' => []
        ]);
        $user = $this->Users->patchEntity($user,  $userData);
        if ($this->Users->save($user)) {
            echo json_encode(array(
                'success' => true,
                'data' => array(),
                'msg' => 'Password cambiata correttamente!'
            ));
        }else{
            echo json_encode(array(
                'success' => false,
                'data' => array(),
                'msg' => 'Errore del server'
            ));
        }
        //exit;
    }
	public function generatePassword(){
		$this->autoRender = 0;
        $msgError = "";
        $params = $this->request->getData();
        $id = $this->request->getData('id');
        //recupero il record
        $dataUser = $this->Users->get($id, [
            'contain' => []
            ]);
        if ($dataUser['otp']) {
            $computepassword = $dataUser['computepassword'];
			$success = true;
			$msg = '';
			$data = $computepassword;
        }
        else { //rigenero
            $computepassword = substr( str_shuffle( 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$' ) , 0 , 8 );
			$password = $computepassword;
            $arrToUpd = array(
                    'id' => $id,
                    'password' => $password,
					'computepassword' => $computepassword,
                    'otp' => true
            );
			$dataUser = $this->Users->patchEntity($dataUser,  $arrToUpd);
            if ($this->Users->save($dataUser)){
                $success = true;
                $msg = "";
				$data = $computepassword;
            }else {
                $success = false;
				$msg = "Errore del server!";
				$data = array();
            }
        }
        echo json_encode(array(
			'success' => $success,
			'msg' => $msg,
			'data' => $data));
	}
    public function login(){
        $this->autoRender= 0;
        if ($this->request->is('post')) {
            $user = $this->Auth->identify();
            if ($user) {
                $this->Auth->setUser($user);  
                $key = Security::getSalt();
                $tokenId    = base64_encode(openssl_random_pseudo_bytes(32));
                $issuedAt   = time();
                $notBefore  = $issuedAt + 10;             //Adding 10 seconds
                $expire     = $notBefore + 20000;                          
                $token = array(
                    'iat'  => $issuedAt,         // Issued at: time when the token was generated
                    'jti'  => $tokenId,          // Json Token Id: an unique identifier for the token
                    //'nbf'  => $notBefore,        // Not before
                    //'exp'  => $expire,       
                    "alg" => "HS256",
                    "typ" => 'JWT',
                    "sub" => $user['id'],
                    "id" => $user['id']
                );
                
                $jwt = JWT::encode($token, $key, 'HS256');
                echo json_encode(array(
                    'success' => true,
                    'message' => 'Login avvenuto con successo!',
                    'token' => $jwt,
                    'otp' => $this->Auth->User('otp'),
                    'admin' => $this->Auth->User('is_admin')
                ));
                //exit;
            }else{
                echo json_encode(array('success'=> false, 'message'=> 'Dati inseriti non validi.', 'token'=>null));
                //exit;                 
            }
        }else{
            echo json_encode(array('success'=> false, 'message'=> 'Impossibile eseguire il login.', 'token'=>null));
        }
    }

    /**
     * View method
     *
     * @param string|null $id User id.
     * @return \Cake\Http\Response|null
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function view($id = null)
    {
        $user = $this->Users->get($id, [
            'contain' => []
        ]);

        $this->set('user', $user);
    }

    /**
     * Add method
     *
     * @return \Cake\Http\Response|null Redirects on successful add, renders view otherwise.
     */
    public function add()
    {   
        if (!$this->Auth->User('is_admin')) {
            $this->set(array(
                'result' => array('success' => false, 'data' => array(), 'msg' => 'Operazione non consentita.'),
                '_serialize' => array('result')
            ));
        }else{
            $user = $this->Users->newEntity();
            if ($this->request->is('post')) {
                $data = $this->request->getData();
                unset($data['id']);
                $data['password'] = substr( str_shuffle( 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$' ) , 0 , 8 );
				$data['computepassword'] = $data['password'];
                $data['otp'] = true;
                $user = $this->Users->patchEntity($user,  $data);
                if ($this->Users->save($user)) {
                    $data['id'] = $user->id;
                    $this->set(array(
                        'result' => array('success' => true, 'data' => $data, 'msg' => ''),
                        '_serialize' => array('result')
                    ));
                }else{
                    $this->set(array(
                        'result' => array('success' => false, 'data' => array(), 'msg' => 'Errore del server!'),
                        '_serialize' => array('result')
                    ));
                }
            }
        }
       
    }

    public function logout() {
        // redirect to login page
        $this->Auth->logout();
        return $this->redirect('/index.html');
    }
    /**
     * Edit method
     *
     * @param string|null $id User id.
     * @return \Cake\Http\Response|null Redirects on successful edit, renders view otherwise.
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function edit($id = null)
    {   
        if (!$this->Auth->User('is_admin')) {
            $this->set(array(
                'result' => array('success' => false, 'data' => array(), 'msg' => 'Operazione non consentita.'),
                '_serialize' => array('result')
            ));
        }else{
            $user = $this->Users->get($id, [
            'contain' => []
            ]);
            if ($this->request->is(['patch', 'post', 'put'])) {
                $data = $this->request->getData();
                $user = $this->Users->patchEntity($user,  $data);
                if ($this->Users->save($user)) {
                    $this->set(array(
                        'result' => array('success' => true, 'data' => $user, 'msg' => 'Dati modificati correttamente!'),
                        '_serialize' => array('result')
                    ));
                }else{
                    $this->set(array(
                        'result' => array('success' => false, 'data' => array(), 'msg' => 'Errore del server!'),
                        '_serialize' => array('result')
                    ));
                }
        }
    }
       
    }

    /**
     * Delete method
     *
     * @param string|null $id User id.
     * @return \Cake\Http\Response|null Redirects to index.
     * @throws \Cake\Datasource\Exception\RecordNotFoundException When record not found.
     */
    public function delete($id = null)
    {   
        $this->autoRender= 0;
        $this->request->allowMethod(['post', 'delete']);
        if (!$this->Auth->User('is_admin')) {
            $this->set(array(
                'result' => array('success' => false, 'data' => array(), 'msg' => 'Operazione non consentita.'),
                '_serialize' => array('result')
            ));
            return;
        }
        $user = $this->Users->get($id);
        if ($this->Users->delete($user)) {
            $success = true;           
        } else {
            $success = false;
        }
        $this->set(array(
            'result' => array('success' => $success, 'data' => array(), 'msg' => 'Utente eliminato correttamente!'),
            '_serialize' => array('result')
        ));
        //return $this->redirect(['action' => 'index']);
    }
}
