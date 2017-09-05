<?php session_start();

error_reporting(E_ERROR);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);

//Redsys entrada de respuestas
if($_POST["Ds_Signature"] && file_exists(getcwd()."/sistema/librerias/redsys/recibe.php")){
	try {
		require_once getcwd()."/sistema/librerias/redsys/recibe.php";
	} catch (Exception $e) {
		file_put_contents("Log_Redsys", "Error redsys: ".$e->getMessage());
	}
}else if($_POST["Ds_Signature"]){
	file_put_contents("Log_Redsys", "No se escuentra el archivo: ".getcwd()."/sistema/librerias/redsys/recibe.php");
}
	
	include "core/Store.php";
	include "libraries/jsmin-php-master/jsmin.php";
	
	header('Content-Type: text/html; charset='.$CB->getConfig('charset'));

	$urlparts = false;
		
	if(in_array($_SERVER['REMOTE_ADDR'], $CB->getConfig('local_ips')))
	{
		if($CB->getConfig('auto_min_js') == 'local'){
			$CB->setConfig('auto_min_js', true);
		}
		$fname = trim(str_replace('\\', '/', getcwd()), '/');
		$fname = end(explode('/', $fname));
		$uri = trim(str_replace('\\', '/', $_SERVER['REQUEST_URI']), '/');
		
		if(strpos($uri, $fname) !== false){
			$temp = end(explode($fname, $uri));
			$urlparts = explode('/', trim($temp, '/'));
		}else{
			$urlparts = explode('/', $uri);
		}
	}
	else
	{
		if($CB->getConfig('auto_min_js') == 'local'){
			$CB->setConfig('auto_min_js', false);
		}
		$turi = trim($_SERVER['REQUEST_URI'], "/");
		$urlparts = explode('/', $turi);
	}
			
	if ((!empty($_SERVER['HTTP_X_REQUESTED_WITH']) && strtolower($_SERVER['HTTP_X_REQUESTED_WITH']) == 'xmlhttprequest') || $_FILES['file']) {
		
		if($urlparts[0] == 'require')
		{
			$value = json_decode($_POST['data'], true);
			if($value['xtype']){
				$value = array($value);
			}
			if(is_array($value))
			{
				$data = array();
				for($i=0;$i<count($value);$i++)
				{
					if(!$value[$i]['data']){
						$value[$i]['data'] = array();
					}
					array_push($data, array($value[$i]['xtype'], $value[$i]['module'], $value[$i]['name'], $value[$i]['data']));
				}
			}
		}
		else if($urlparts[0] == 'loadAll')
		{
			$data = json_decode($_POST['data'], true);
		}
		else if(is_array($urlparts))
		{
			if($urlparts[3]){
				$urlparts[2] .= '/'.$urlparts[3];
			}
			$data = array(array($urlparts[1], $urlparts[0], $urlparts[2], $_POST));
		}
		
		if(is_array($data))
		{
			$store = array();
			foreach($data as $dt)
			{
				if(is_array($dt))
				{
					if(!$dt[2]){
						$dt[2] = $dt[1];
					}
											
					if($dt[0] == 'view'){
						$dt[2] .= 'View';
					}
					if($dt[0] == 'component'){
						$dt[2] .= 'Component';
						$dt[0] = 'view/'.$dt[0];
					}
					if(file_exists('module/'.$dt[1].'/'.$dt[0].'/'.$dt[2].'.min.js'))
					{
						if($CB->getConfig('auto_min_js') === true && file_exists('module/'.$dt[1].'/'.$dt[0].'/'.$dt[2].'.js') && filemtime('module/'.$dt[1].'/'.$dt[0].'/'.$dt[2].'.min.js') != filemtime('module/'.$dt[1].'/'.$dt[0].'/'.$dt[2].'.js')){
							$codemin = JSMin::minify(file_get_contents('module/'.$dt[1].'/'.$dt[0].'/'.$dt[2].'.js'));
							$min = fopen('module/'.$dt[1].'/'.$dt[0].'/'.$dt[2].'.min.js', "w+");
							fwrite($min, $codemin);
							fclose($min);
							$time_ctr = time();
							touch('module/'.$dt[1].'/'.$dt[0].'/'.$dt[2].'.min.js', $time_ctr);
							touch('module/'.$dt[1].'/'.$dt[0].'/'.$dt[2].'.js', $time_ctr);
							echo $codemin.'
									';
						}else{
							echo file_get_contents('module/'.$dt[1].'/'.$dt[0].'/'.$dt[2].'.min.js').'
									';
						}
					}
					else if(file_exists('module/'.$dt[1].'/'.$dt[0].'/'.$dt[2].'.js'))
					{
						if($CB->getConfig('auto_min_js') === true){
							$codemin = JSMin::minify(file_get_contents('module/'.$dt[1].'/'.$dt[0].'/'.$dt[2].'.js'));
							$min = fopen('module/'.$dt[1].'/'.$dt[0].'/'.$dt[2].'.min.js', "w+");
							fwrite($min, $codemin);
							fclose($min);
							$time_ctr = time();
							touch('module/'.$dt[1].'/'.$dt[0].'/'.$dt[2].'.min.js', $time_ctr);
							touch('module/'.$dt[1].'/'.$dt[0].'/'.$dt[2].'.js', $time_ctr);
							echo $codemin.'
									';
						}else{
							echo file_get_contents('module/'.$dt[1].'/'.$dt[0].'/'.$dt[2].'.js').'
									';
						}
					}
					
					if($dt[0] == 'store')
					{
						$temp_class = ucwords($dt[2]);
						
						if(file_exists('module/'.$dt[1].'/'.$dt[0].'/'.$dt[2].'Store.php'))
						{
							if(!$store[$temp_class])
							{
								include 'module/'.$dt[1].'/'.$dt[0].'/'.$dt[2].'Store.php';
							}
							$CB->db->reset();
							$store[$temp_class] = new $temp_class($CB, $dt[3]);
						}
						else
						{
							echo 'alert(\'No existe el fichero: module/'.$dt[1].'/'.$dt[0].'/'.$dt[2].'Store.php\');';
						}
					}
				}
			}
		}
		
	} else {

?>

<!DOCTYPE html>
	<head>
		<title><?php echo $CB->getConfig('title'); ?></title>
		<meta http-equiv="Content-Type" content="text/html; charset=<?php echo $CB->getConfig('charset'); ?>" />
		
		<link rel="stylesheet" type="text/css" href="main.css" />

		<script type="text/javascript" src="libraries/jQuery/jQuery.min.js"></script>
		<script type="text/javascript" src="libraries/system/cookie.js"></script>
		<script type="text/javascript" src="libraries/system/cacheJs.js"></script>
		<script type="text/javascript" src="libraries/system/base.js"></script>
		
		<link name="apple-touch-icon" href="" />
		<link name="apple-touch-startup-image" href="" />
		<meta name="apple-mobile-web-app-capable" content="yes" />
		<meta name="apple-mobile-web-app-status-bar-style" content="default" />
		<meta name="viewport" content="width=980">
				
		<script type="text/javascript">
			
			$(document).ready(function(){
				<?php
					if($urlparts[0])
					{
						if(strpos($urlparts[0], '?') !== false && !empty($_GET)){
							$urlparts[0] = explode('?', $urlparts[0])[0];
							if($urlparts[0]){
								echo "cb.load('controller', '".$urlparts[0]."', ".json_encode($_GET).");";
							}else{
								echo "cb.load('controller', '".$CB->getConfig('default_controller')."', ".json_encode($_GET).");";
							}
						}else{
							echo "cb.load('controller', '".$urlparts[0]."');";
						}
					}
					else
					{
						echo "cb.load('controller', '".$CB->getConfig('default_controller')."');";
					}
				?> $.cachedScript("libraries/bootstrap/js/bootstrap.min.js");
			});
			
		</script>
		

	</head>
	<body>
		
	</body>
</html>

<?php
	}
?>
