/**
 * Script para execucao das funcoes javascript após todos os componentes html
 * já estarem carregados.
 * 
 * 
 */

function coordenada(lat,lon){
    // ponto = coordenada
    this.latitude=lat;
    this.longitude=lon;
}

function obtemCoordenadaCentro(pontos){
    //dado um conjunto de pontos, retorna um unico ponto
    //localizado no centro desse conjunto.

    var latMedia,longiMedia,latMax,longiMax,latMin,longiMin;
    latMax=-9999999999;
    latMin= 999999999;

    longiMax=-9999999999;
    longiMin= 999999999;

    latMedia=-99999999999;
    longiMedia=-9999999999;


    for(var i=0;i<pontos.length;i++){
        if(pontos[i].latitude < latMin) latMin = pontos[i].latitude;        
        if(pontos[i].latitude > latMax) latMax = pontos[i].latitude;
        if(pontos[i].longitude < longiMin) longiMin = pontos[i].longitude;
        if(pontos[i].longitude > longiMax) longiMax = pontos[i].longitude;
        
        if(Math.abs(latMedia-(latMax+latMin)/2) > Math.abs(pontos[i].latitude - (latMax+latMin)/2))
            latMedia=pontos[i].latitude;
        
        if (Math.abs(longiMedia-(longiMax+longiMin)/2) > Math.abs(pontos[i].longitude-(longiMax+longiMin)/2))                    
            longiMedia=pontos[i].longitude;
        
    }

    return new coordenada(latMedia,longiMedia);

}

function pontoToPosition(ponto){
    var positions=new Array();
    var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transforma de WGS 1984
    var toProjection   = new OpenLayers.Projection("EPSG:900913"); // para Spherical Mercator Projection   

    position = new OpenLayers.LonLat(ponto.longitude, ponto.latitude).transform( fromProjection, toProjection);

    return position;
}


function pontosToPositions(pontos){
    //transforma array de pontos/coordenadas (lat,long) em uma 'position' (formato SPM)

    var positions=new Array();
    var fromProjection = new OpenLayers.Projection("EPSG:4326");   // Transforma de WGS 1984
    var toProjection   = new OpenLayers.Projection("EPSG:900913"); // para Spherical Mercator Projection

    for(var i=0;i<pontos.length;i++)
        positions[i] = new OpenLayers.LonLat(pontos[i].longitude, pontos[i].latitude).transform( fromProjection, toProjection);

    return positions;
}



function adicionaMarcadoresNaLayer(layerMarcadores,positions){
    var size = new OpenLayers.Size(21,25);
    var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
    var icon;

    for(var i=0;i<positions.length;i++){
        icon = new OpenLayers.Icon('http://www.openlayers.org/dev/img/marker.png', size, offset);
        layerMarcadores.addMarker(new OpenLayers.Marker(positions[i],icon)); 
    }
}

function obtemLatitudesCsvERenderizaNoMapa(pathJson,map,zoom){
    var pontos = new Array();
    var positions;

    //layer para marcadores(pontos)
    var layerMarcadores = new OpenLayers.Layer.Markers( "Markers" );
    map.addLayer(layerMarcadores);

    //pontos para teste (6 primeiras lat,long de oleos.json)
    /*
    pontos[0]= new coordenada(-30.047009708,-51.2172603422);
    pontos[1]= new coordenada(-30.0494363151,-51.213368848);
    pontos[2]= new coordenada(-30.028117645,-51.168128152);
    pontos[3]= new coordenada(-30.2060986637,-51.1793673208);
    pontos[4]= new coordenada(-30.1157345234,-51.1788731001);
    pontos[5]= new coordenada(-30.0345027779,-51.2110262746);
    pontos[6]= new coordenada(-30.0477696456,-51.1549648444);
    */

    $.getJSON(pathJson,function(result){
        $.each(result, function(key, field){
            //console.debug(field);
            //adiciona cada ponto do json no array de pontos
            pontos.push(new coordenada(field.latitude,field.longitude));

        });

        positions=pontosToPositions(pontos); 
        adicionaMarcadoresNaLayer(layerMarcadores,positions);

        posicaoCentro=pontoToPosition(obtemCoordenadaCentro(pontos));

        console.debug(posicaoCentro)
        map.setCenter(posicaoCentro, zoom);

     });
}

$(document).ready(function(){
    var zoom = 13;
    map = new OpenLayers.Map("tour");
    var mapnik = new OpenLayers.Layer.OSM();
    map.addLayer(mapnik);
    obtemLatitudesCsvERenderizaNoMapa('data/pilhas.json', map, zoom);
});