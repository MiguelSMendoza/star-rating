<?php
require __DIR__ . '/vendor/autoload.php';
define("DBHOST", "localhost");
define("DBUSER", "USER");
define("DBPASS", "PASS");
define("DBNAME", "NAME");
/*ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);*/

	$app = new CyberREST("Stars");
	
	
	class OPTIONS {
		const UNIQUE = true;
		const RATE_LEGEND = 'Valora esta página.';
	}
	
	$app->get("/widget/PRIVATE_KEY/{idData}", function($app, $idData) {
		$data = getData($idData);
		if (!$data) {
			newData($pid);
			$data["ratings"] = 0;
			$data["casts"] = 0;
		}
		$rating =  $data["ratings"] ? number_format((float)($data["ratings"]/$data["casts"]), 2, '.', '') : 0;
		$votos = $data["casts"];
		ob_start();
		?>
		<div class="msm-star-ratings bottom-left lft" data-id="<?=$idData ?>">
	        <div class="msm-stars msm-star gray">
	            <div class="msm-fuel msm-star yellow" style="width:0%;"></div>
	            <a href="#1"></a><a href="#2"></a><a href="#3"></a><a href="#4"></a><a href="#5"></a>
	        </div>
	        <div class="msm-legend">
	            <div itemprop="aggregateRating" itemscope="" itemtype="http://schema.org/AggregateRating">
	                <div itemprop="name" class="msm-title">Campuseducacion.com</div>
	                <span itemprop="ratingValue"><?=$rating ?></span> / 5  - <span itemprop="ratingCount"><?=$votos ?></span> votos 
	                <meta itemprop="bestRating" content="5">
	                <meta itemprop="worstRating" content="1">
	                <div itemprop="itemReviewed" itemscope="" itemtype="http://schema.org/CreativeWork"></div>
	            </div>
	        </div>
	    </div>
		<?php
		echo ob_get_clean();
	});

	$app->post("/", function($app) {
		$params = $app->getParameters();
		if (!isset($_POST['id'])) {
			$app->response('', 404);
		}
        $Response = array();
        $total_stars = 5;
        $stars = is_numeric($_POST['stars']) && ((int)$_POST['stars']>0) && ((int)$_POST['stars']<=$total_stars)
                ? $_POST['stars']:
                0;
        $ip = $_SERVER['REMOTE_ADDR'];
        $Ids = explode(',', $_POST['id']);
        foreach($Ids as $pid) {
	        $data = getData($_POST['id']);
			$ratings = $data["ratings"];
	        $casts = $data["casts"];
			$Ips = unserialize(base64_decode($data["ip"]));
			
	        if($stars==0 && $ratings==0) {
	            $Response[$pid]['legend'] = OPTIONS::RATE_LEGEND;
	            $Response[$pid]['disable'] = 'false';
	            $Response[$pid]['fuel'] = '0';
	        } else {
	            $nratings = $ratings + ($stars/($total_stars/5));
	            $ncasts = $casts + ($stars>0);
	            $avg = $nratings ? number_format((float)($nratings/$ncasts), 2, '.', '') : 0;
	            $per = $nratings ? number_format((float)((($nratings/$ncasts)/5)*100), 2, '.', '') : 0;
	            $Response[$pid]['disable'] = (in_array($ip, $Ips) && OPTIONS::UNIQUE) ? 'true' : 'false';
	            if($stars) {
	                if(!in_array($ip, $Ips)) {
	                    $Ips[] = $ip;
	                }
	                $ips = base64_encode(serialize($Ips));
	                updateData($pid, $nratings, $ncasts, $ips);
	                $Response[$pid]['disable'] = OPTIONS::UNIQUE;
	            }

	            $Response[$pid]['legend'] = $avg." / 5 - ".$ncasts." votos.";
	            $Response[$pid]['fuel'] = (float) $per;
	        }
	        $Response[$pid]['success'] = true;
        }
		
		$app->response($Response, 200);
	});
	
	function getData($idData) {
		$db = new CyberDB();
		$db->setDB(DBHOST, DBUSER, DBPASS, DBNAME);
		$query=$db->getQuery();
		$query->Select('*');
		$query->From("MSM_Ratings");
		$query->Where('id='.$idData);
		$db->setQuery($query);
		$data = $db->getRow();
		return $data;
	}
	
	function updateData($idData, $ratings, $casts, $ip) {
		$db = new CyberDB();
		$db->setDB(DBHOST, DBUSER, DBPASS, DBNAME);
		$query=$db->getQuery();
		$query->Update("MSM_Ratings");
		$query->Set(["ratings=".$ratings, "casts=".$casts, "ip='".$ip."'"]);
		$query->Where('id='.$idData);
		return $db->executeQuery();;
	}
	
	function newData($idData) {
		$db = new CyberDB();
		$db->setDB(DBHOST, DBUSER, DBPASS, DBNAME);
		$query=$db->getQuery();
		$columns = ['id', 'ip'];
		$values = [$idData, "''"];
		$query = $db->getQuery();
		$query->Insert('MSM_Ratings');
		$query->Columns($columns);
		$query->Values(implode(',', $values));
		$db->setQuery($query);
		return $db->executeQuery();
	}
	

?>
