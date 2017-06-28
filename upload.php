<?php
if(isset($_POST['html_canvas'])){
	$html_canvas = $_POST['html_canvas'];
	$image = base64_decode(substr($html_canvas, 22));
	header('Content-Type: image/png');
	$filename =  time().".png";
	$fp = fopen($filename, 'w');
	fwrite($fp, $image);
	fclose($fp);
}
?>