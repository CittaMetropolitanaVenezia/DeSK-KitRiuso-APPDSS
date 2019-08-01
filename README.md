## SICLA - SIstema Concertativo
## Tech/framework utilizzati
- [Ext JS](https://www.sencha.com/products/extjs/)
- [CakePHP](https://cakephp.org/)
## Prerequisiti
- PHP **5.6.x**
- Apache **2.x** con queste estensioni:
  - initl
  - mbstring
  - libxml
  - pdo_pgsql
  - zip
  - zlib
- Database Postgres **9.x**(consigliata 9.5) con codifica **UTF-8** e Postgis **2.x**
- Mapserver **7.x**(consigliata 7.0.7) installato all'interno del webserver avente la cartella 'cgi-bin' nella document root
## Installazione
1. Scaricare la cartella del progetto, posizionarla nella document root del web server e rinominarla in 'appdss';
2. Restaurare il file dump.sql all'interno di un database vuoto;
3. Se non è presente, creare un collegamento alla cartella temporanea del web server all'interno della document root;
4. Assicurarsi che le cartelle 'config', 'logs', 'mapfiles', 'tmp', 'webroot' abbiano tutti i permessi necessari
  - Linux:
    Accedere alla shell e navigare fino alla cartella dell'applicativo, quindi eseguire qeusto comando:
    ```
    sudo chmod -R 777 [nome_cartella]
    ```
5. Aprire il file *app.php* all'interno della cartella config e configurare la connessione al DB (Datasources -> default)
6. Popolare la tabella 'limiti_comunali' del DB con i dati delle città desiderate.
## Utilizzo
1. Accedere all'applicativo tramite l'url del server / appdss:
    ```
    http://www.example.com/sicla
    ```    
2. Effettuare il login: 
   - Username : appdss
   - Password : appdss2019
   2.1 L'utente con cui si effettuerà il login è un utente Admin, il quale ha accesso al pannello di amministrazione. Saranno presenti          delle impostazioni di esempio, per il funzionamento dell'applicativo è neccessario modificarle e renderle veritiere rispetto al          vostro server.
3. Per creare un nuovo progetto, aprire la scheda dedicata e seguire le indicazioni sovrastanti.

