/**
 * Interface para obtencao do json, e renderizacao das latitudes no mapa
 * 
 */


function criaSmpPosition(latitude,longitude){
	//dada uma latitude/longitude WGS, converte para SMP
	
	var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transforma de WGS 1984
    var toProjection   = new OpenLayers.Projection("EPSG:900913"); // para Spherical Mercator Projection
    return new OpenLayers.LonLat(longitude, latitude).transform( fromProjection, toProjection);	
	
}

function obtemPosicaoCentro(dadosJson){

	//dado um conjunto de dados no formato json, retorna um unico ponto (no formato SMP)
	//representando o centro das latitudes/longitudes desses dados.
	//<Media aritimetica>
	
	var latMedia=0;
	var longiMedia=0;
	
	
	for(var i=0;i<dadosJson.length;i++){
		latMedia+=dadosJson[i].latitude;
		longiMedia+=dadosJson[i].longitude;
	}
	
	latMedia=latMedia/dadosJson.length;
	longiMedia=longiMedia/dadosJson.length;
	
	return criaSmpPosition(latMedia,longiMedia);
	
}

function adicionaSmpPositions(dadosJson){	
	//Dado o array que representa o json, adiciona mais um atributo (posicao Smp) em cada campo do json.    
    for(var i=0;i<dadosJson.length;i++)
        dadosJson[i].smpPosition = criaSmpPosition(dadosJson[i].latitude,dadosJson[i].longitude);
    
}


function adicionaMarcadoresNaLayer(layerMarcadores,dadosJson){
    
    var size = new OpenLayers.Size(21,25); 
    var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
    var icon;
    
    
    for(var i=0;i<dadosJson.length;i++){   
        icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset);
        //console.debug(dadosJson[i]);
        var marker =new OpenLayers.Marker(dadosJson[i].smpPosition,icon);        
        icon.imageDiv.dados=dadosJson[i]; //salva dados no proprio objeto
        
        $(icon.imageDiv).click(function(){
        	alert('Nome: '+this.dados.nome+'\nEndereco: '+this.dados.endereco); //exibe dados salvos no objeto
        	
        });
        layerMarcadores.addMarker(marker);
        
        
    }
}

function obtemDadosJsonERenderizaNoMapa(pathJson,zoom){
	//antiga obtemLatitudesCsvERenderizaNoMapa(..)
	    
	var pontos = new Array();
    var dadosJson = new Array();    
    
    
    //layer para marcadores(pontos)
    var layerMarcadores = new OpenLayers.Layer.Markers( "Markers" );
    map.addLayer(layerMarcadores);       
    
        
    $.getJSON(pathJson,function(result){
        $.each(result, function(key, field){        	
        	//console.debug(field);
        	//adiciona cada entrada do json no array de dados        	
        	dadosJson.push(field);
        });
        
        adicionaSmpPositions(dadosJson);        
        adicionaMarcadoresNaLayer(layerMarcadores,dadosJson);        
        posicaoCentro=obtemPosicaoCentro(dadosJson);        
        map.setCenter(posicaoCentro, zoom);        
        
     });   
	       
}

//manter a portabilidade com o html atual
function obtemLatitudesERenderizaNoMapa(pathJson, zoom){
	obtemDadosJsonERenderizaNoMapa(pathJson,zoom);	
}
	
$(document).ready(function(){	

    map = new OpenLayers.Map("tour");
    var mapnik = new OpenLayers.Layer.OSM();
    map.addLayer(mapnik);
    
    
});