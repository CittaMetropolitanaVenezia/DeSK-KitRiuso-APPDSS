<?php 
class xtcpdf extends TCPDF {
}
	$pdf = new xtcpdf('L', PDF_UNIT, 'A3', true, 'UTF-8', false);
	$pdf->AddPage();
	$pdf->SetAutoPageBreak(false);
	$pdf->Cell(320,280,'',1,0);
	$pdf->Image($mapImage,12,12);
	$pdf->Cell(80,40,'',1,2);
	$pdf->Image('./resources/images/city.png',340,15,60);
	//$pdf->Cell(80,40,'Descrizione',1,2);
	$pdf->WriteHtmlCell(80,40,330,50,'<br><b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'.$projectName.'</b><br><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'.$descTitle.'<div style="font-size:10">'.$projectDesc.'</div>',1,2);
	$pdf->Line(330,60,410,60);
	//$pdf->Cell(80,50,'Legenda',1,2);
	$pdf->WriteHtmlCell(80,100,330,90, '<b>'.$legendTitle.'</b><br><div style="font-size:9">'.$legend.'</div>',1,2);
	$pdf->WriteHtmlCell(80,80,330,190,'<div style="font-size:10;">Inquadramento</div><br><img src="'.$quadroImage.'" width="183px" height="183px">',1,2,false,true,'C');
	$pdf->Line(330,195,410,195);
	$pdf->WriteHtmlCell(80,20,330,270,'<br><br><img src="./resources/images/logo.png" height="25px">',1,2,false,true,'C');
	$pdf->Output(ROOT.DS.'webroot'.DS.$fileName.'.pdf', 'F');
	unlink($mapImage);
	unlink($quadroImage);
	echo json_encode(array(
		'success' => true,
		'data' => $fileName.'.pdf',
		'msg' => ''));
	
?>