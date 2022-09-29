    /**
 * Fonctions JS pour l'affichage de la carte sur la page de recherche de biens
 * Sources :
 *
 * NB
 *  - Alimentation du JS avec les données des DTO via ScriptData
 *      --> voir PPT DevBooster 3 "XAML avancé" diapo#38
 *      --> PIXIS "Rendre disponible un fragment d'instance en JavaScript (XAML)"
 */
 
 

/* DEBUG Informations */
var varDebug = false;
/*console.log('Google Maps API version: ' + google.maps.version);*/

/**
 * Variables globales
 */
var map;
var markers;
var markerBien;
var bounds;
var originalZoom;
var markersSearch; // permet de gérer les marker et les carteproduit lors de la recherche de biens
//var mapCollisionBehavior;
let tabInfoWindow;
let cityCircle;
var rechercheFrance = false;
var rechercheDepartemental = false;
var urlSite;
var parcours = null;
var rayon = null;
var urlProfil = null;
var urlMarkers = null;
var localisationDepartement = null;
const metierLouer = 1;
const metierNeuf = 3;
const metierAncien = 2;


/**
 * The CenterControl adds a control to the map that recenters the map on
 * Chicago.
 * This constructor takes the control DIV as an argument.
 * @constructor
 */
 function MyCustomControl(controlDiv, map) {
	// Set CSS for the control border.
	const controlUI = document.createElement("div");
	controlUI.style.backgroundColor = "#fff";
	controlUI.style.border = "2px solid #fff";
	controlUI.style.borderRadius = "3px";
	controlUI.style.boxShadow = "0 2px 6px rgba(0,0,0,.1)";
	controlUI.style.cursor = "pointer";
	controlUI.style.marginTop = "5px";
	controlUI.style.marginLeft = "5px";
	controlUI.style.marginBottom = "22px";
	controlUI.style.textAlign = "center";
	controlUI.title = "Options carte";
	controlDiv.appendChild(controlUI);
	
	// Set CSS for the control interior.
	const controlText = document.createElement("div");
	controlText.style.color = "rgb(102,102,102)";
	controlText.style.fontFamily = "Roboto,Arial,sans-serif";
	controlText.style.lineHeight = "31px";
	controlText.style.paddingLeft = "7px";
	controlText.style.paddingRight = "7px";
	controlText.style.paddingBottom = "5px";
	controlText.style.paddingTop = "1px";
	//controlText.style.width = "150px";
	controlText.style.fontSize = "23px";
	controlText.classList.add("ei_gly_ic_layers");
	controlUI.appendChild(controlText);

	var showState = false;
	//div contenant les checkbox satellite, bike et transit
	const divControl = document.createElement("div");
	divControl.Id = "divcontrol";
	divControl.hidden = true;
	divControl.style.textAlign = "left"; 

	//gestion affichage mode plan
	var labelPlan = document.createElement('label');
	labelPlan.htmlFor = "rbPlan";
	labelPlan.appendChild(document.createTextNode('Plan'));
	var rbPlan = document.createElement('input');
	rbPlan.type = 'radio';
	rbPlan.id = "rbPlan";
	rbPlan.value = "plan";
	rbPlan.checked = true;
	rbPlan.addEventListener("click", function () {
        if (typeof (trackEvent) != 'undefined') {
            trackEvent(
                {
                    category: 'CarteLocalisationBiens',
                    action: 'Clic',
                    label: 'Plan'
                })
        };
		rbSat.checked = false;
		map.setMapTypeId('roadmap');
	});

	//gestion affichage mode satellite
	var labelSat = document.createElement('label');
	labelSat.htmlFor = "rbSat";
	labelSat.appendChild(document.createTextNode('Satellite'));
	var rbSat = document.createElement('input');
    rbSat.type = 'radio';
	rbSat.id= "rbSat";
	rbPlan.value = "sat";
	rbSat.checked = false;
	rbSat.addEventListener("click", function () {
        if (typeof (trackEvent) != 'undefined') {
            trackEvent(
                {
                    category: 'CarteLocalisationBiens',
                    action: 'Clic',
                    label: 'Satellite'
                })
        };
		rbPlan.checked = false;
		cbBike.checked = false;
		cbTransit.checked = false;
		bikeLayer.setMap(null);
		transitLayer.setMap(null);
		map.setMapTypeId('satellite');
	});

	//gestion des pistes cyclables
	var labelBike = document.createElement('label');
	labelBike.htmlFor = "cbBike";
	labelBike.appendChild(document.createTextNode('Pistes cyclables'));
	var cbBike = document.createElement('input');
	cbBike.type = 'checkbox';
    cbBike.name = "bike";
	cbBike.id="cbBike";
	const bikeLayer = new google.maps.BicyclingLayer();
	cbBike.addEventListener("click", function () {
        if (typeof (trackEvent) != 'undefined') {
            trackEvent(
                {
                    category: 'CarteLocalisationBiens',
                    action: 'Clic',
                    label: 'Calque : Pistes cyclables'
                })
        };
		if(cbBike.checked)
		{
			bikeLayer.setMap(map);
			rbPlan.checked = true;
			rbSat.checked = false;
			map.setMapTypeId('roadmap');
		}
		else
			bikeLayer.setMap(null);
	  });
	
	// gestion des transport en commun
	var labelTransit = document.createElement('label');
	labelTransit.htmlFor = "cbTransit";
	labelTransit.appendChild(document.createTextNode('Transport en commun'));
	var cbTransit = document.createElement('input');
	cbTransit.type = 'checkbox';
    cbTransit.name = "transit";
	cbTransit.id="cbTransit";
    const transitLayer = new google.maps.TransitLayer();
    cbTransit.addEventListener("click", function () {
        if (typeof (trackEvent) != 'undefined') {
            trackEvent(
                {
                    category: 'CarteLocalisationBiens',
                    action: 'Clic',
                    label: 'Calque : Transports en commun'
                })
        };
		if(cbTransit.checked)
		{
			transitLayer.setMap(map);
			rbPlan.checked = true;
			rbSat.checked = false;
			map.setMapTypeId('roadmap');
		}
		else
			transitLayer.setMap(null);
	  });

	

	// gestion de la div à afficher (contient les radiobuttons & checkbox)
	divControl.appendChild(rbPlan);
	divControl.appendChild(labelPlan);
	divControl.appendChild(rbSat); 
	divControl.appendChild(labelSat); 
	divControl.appendChild(document.createElement("br"));
	divControl.appendChild(cbBike); 
	divControl.appendChild(labelBike); 
	divControl.appendChild(document.createElement("br"));
	divControl.appendChild(cbTransit); 
	divControl.appendChild(labelTransit);
	divControl.appendChild(document.createElement("br"));

	// div globale des checkbox
	controlUI.appendChild(divControl);
	controlUI.addEventListener("click", function()  {
	  if(showState)
	  {
		divControl.hidden = true;
		showState = false;
	  }
	  else
	  {
		divControl.hidden = false;
		showState = true;
	  }
	});
  }


/**
 * Fonction initialisant une div avec une carte Google Maps
 */
function initialiserCarte(divmap, markerFromViewModel,streetview) {
	bounds = new google.maps.LatLngBounds();

	if (parcours != null) {
	    switch (parcours) {
	        case 1:
	            //cas louer
	            tabInfoWindow = new google.maps.InfoWindow({ minWidth: 250, maxWidth: 350, maxHeight: 50 });
	            break;
	        case 2:
	            //cas acheter
	            tabInfoWindow = new google.maps.InfoWindow({ minWidth: 300, maxWidth: 350, maxHeight: 240 });
	            break;
	        case 3:
	            //cas investir
	            tabInfoWindow = new google.maps.InfoWindow({ minWidth: 300, maxWidth: 350, maxHeight: 240 });
	            break;
	        default:
	            tabInfoWindow = new google.maps.InfoWindow({ minWidth: 450 });
	    }
	}
	else {
	    tabInfoWindow = new google.maps.InfoWindow({ minWidth: 450 });
	}
	markers = [];
    let mapOptions = {
        center: new google.maps.LatLng(latitude, longitude),
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        zoom: 12,
        minZoom: 5, /* minZoom: 5 pays , 13 ville, 15 quartier */
        streetViewControl: streetview,
		mapTypeControl: false,
        //mapTypeControlOptions: { mapTypeIds: ["roadmap", "satellite"] },
        scrollwheel: false,
        };
    	
	if(markerFromViewModel != null) {
		markerBien = new google.maps.LatLng(markerFromViewModel.Coordonnees.Latitude, markerFromViewModel.Coordonnees.Longitude);
        mapOptions.center = markerBien;
    }
    let div = divmap.element;
    map = new google.maps.Map(div, mapOptions);
	originalZoom = map.getZoom();

	//const transitLayer = new google.maps.TransitLayer();
  	//transitLayer.setMap(map);

	//const bikeLayer = new google.maps.BicyclingLayer();
  	//bikeLayer.setMap(map);

	//mapCollisionBehavior = google.maps.CollisionBehavior.REQUIRED; actuellement en beta non dispo

    /* Associate the styled map with the MapTypeId and set it to display. */
    /*map.mapTypes.set("afedim", afedimStyledMapType);
    map.setMapTypeId("afedim");*/

	//gestion du custom control en haut à gauche
	const customControlDiv = document.createElement("div");
	const control = new MyCustomControl(customControlDiv, map, map.getCenter());
	customControlDiv.index = 1;
	customControlDiv.style.paddingTop = "5px";
	customControlDiv.style.paddingLeft = "5px";
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(customControlDiv);
	if(rechercheFrance){ 
		markersForFranceBounds();
	}
	else if(rechercheDepartemental){
		map.setCenter(new google.maps.LatLng(localisationDepartement.Latitude, localisationDepartement.Longitude));
		map.setZoom(localisationDepartement.Zoom);
	}
}

/**
 * Set les markers fournis
 * @returns {} 
 */
function setMarkers(markersFromViewModel) {

    if(markersFromViewModel.length == 0) 
         return;

    if (varDebug) {
        console.log('simpleSetMarkers BEGIN');
        console.log(markersFromViewModel);
        console.log(JSON.stringify(markersFromViewModel));
    }

    for (let i = 0; i < markersFromViewModel.length; i++) {
        addMarkerPoi(markersFromViewModel[i]);
    }

    if (varDebug) {
        console.log('simpleSetMarkers END ' + bounds.length);
    }

    recalcBoundsMaj();
}

/**
 * Set le marker fourni
 * @returns {} 
 */
function addMarker(markerFromViewModel) {

    if (varDebug) {
        console.log('addMarker BEGIN');
        console.log(markerFromViewModel);
        console.log(JSON.stringify(markerFromViewModel));
    }
	
    let key = markerFromViewModel.Coordonnees.PoiId;
    let lat = markerFromViewModel.Coordonnees.Latitude;
    let long = markerFromViewModel.Coordonnees.Longitude;
    let urlImage = markerFromViewModel.Coordonnees.UrlImage;
    let scaledSizeImage = markerFromViewModel.Coordonnees.ScaledSizeImage;

    var image = {
        url: urlImage,
        scaledSize: new google.maps.Size(scaledSizeImage, scaledSizeImage),
		
    };

    var positionTemp = new google.maps.LatLng(lat, long);
    var marker = new google.maps.Marker({
        title: markerFromViewModel.NatureLieu,
        position: positionTemp,
        map: map,
        icon: image,
		metier: markerFromViewModel.Metier,
		isGpsExact: markerFromViewModel.IsGpsExact,
    });
	
	
	if (marker.metier == metierAncien && !marker.isGpsExact) {
		var circle = new google.maps.Circle({
		map: map,
		strokeColor: "#004494",
		strokeOpacity: 0.8,
		strokeWeight: 0.2,
		fillColor: "#004494",
		fillOpacity: 0.30,	
		radius: 250
		});
		circle.bindTo('center', marker, 'position'); }

    /* Ajoute un event click */
    google.maps.event.addListener(marker, 'click', function() {
        map.panTo(marker.getPosition());
    });

    /* Ajout de la position aux Bounds pour futur affichage de la carte avec tous les markers en vue */
    bounds.extend(marker.position);

    markers.push(marker);
	
    if (varDebug) {
        console.log('addMarker END');
    }
}

/**
 * Set le marker fourni
 * @returns {} 
 */
function addMarkerPoi(markerFromViewModel) {

    if (varDebug) {
        console.log('addMarker BEGIN');
        console.log(markerFromViewModel);
        console.log(JSON.stringify(markerFromViewModel));
    }

    let key = markerFromViewModel.Coordonnees.PoiId;
    let lat = markerFromViewModel.Coordonnees.Latitude;
    let long = markerFromViewModel.Coordonnees.Longitude;
    let urlImage = markerFromViewModel.Coordonnees.UrlImage;
    let scaledSizeImage = markerFromViewModel.Coordonnees.ScaledSizeImage;

    var image = {
        url: urlImage,
        scaledSize: new google.maps.Size(scaledSizeImage, scaledSizeImage)
    };

    var positionTemp = new google.maps.LatLng(lat, long);
    var marker = new google.maps.Marker({
        title: markerFromViewModel.NatureLieu,
        position: positionTemp,
        map: map,
        icon: image,
    });

    /* Ajoute un event click */
    google.maps.event.addListener(marker, 'click', (function (marker) {
        return function () {
            tabInfoWindow.close();
            tabInfoWindow.setContent(
                "<strong class='_c1 bigger _c1' style='color: red;'>" + markerFromViewModel.NatureLieu +
                "</strong><br/><br/><a href='" +
                urlProfil +
                "'>Accéder à la page du profil</a>");
            tabInfoWindow.open(map, marker);
        }
    })(marker));


    /* Ajout de la position aux Bounds pour futur affichage de la carte avec tous les markers en vue */
    bounds.extend(marker.position);

    markers.push(marker);

    if (varDebug) {
        console.log('addMarker END');
    }
}


/**
 * Set la position de la carte aux limites nécessessaires pour afficher tous les markers
 * @returns {} 
 */
function setMapPositionWithinBounds(){
	if(rechercheFrance){
		markersForFranceBounds();
	}
	else if(rechercheDepartemental){
		map.setCenter(new google.maps.LatLng(localisationDepartement.Latitude, localisationDepartement.Longitude));
		map.setZoom(localisationDepartement.Zoom);
	}
	else{
		if(markers.length >= 1) {
			if (rayon != null && rayon < 16) {
				if (rayon < 4) {
					map.setZoom(13);
				}
				else if (rayon < 8) {
					map.setZoom(12);
				}
				else {
					map.setZoom(11);
				}
			} else {
				map.setZoom(10);
			}
			var center = bounds.getCenter();
			map.setCenter(center);
		}
	} 
}

// Sets the map on all markers in the array.
function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Removes the markers from the map, but keeps them in the array.
function clearMarkers() {
  setMapOnAll(null);
}

// Shows any markers currently in the array.
function showMarkers() {
  setMapOnAll(map);
}

// Deletes all markers in the array by removing references to them.
function deleteMarkers() {
  clearMarkers();
  markers = [];
}


  /**
   * Fonction de récupération des informations sur les biens devant être affichés sur la google map.
   * @param {*} productsFromViewModel 
   * @returns 
   */
  function setProductMarkers(productsFromViewModel) {
    if(productsFromViewModel.length == 0) 
         return;

	if(markersSearch == null)
		markersSearch=[];

		for (let i = 0; i < productsFromViewModel.length; i++) 
		{
			var dataMarker = productsFromViewModel[i];
			//création du marker google map
			var iconMarker = {
			    url: dataMarker.Coordonnees.UrlImage,
			    scaledSize: new google.maps.Size(dataMarker.Coordonnees.ScaledSizeImage, dataMarker.Coordonnees.ScaledSizeImage), // scaled size
			};
		    //création du marker google map
			var marker = new google.maps.Marker({
			    position: new google.maps.LatLng(dataMarker.Coordonnees.Latitude, dataMarker.Coordonnees.Longitude),
			    map: null,
			    title: dataMarker.Description,
			    icon: iconMarker,
			});
      
			google.maps.event.addListener(marker, 'click', (function (marker, i) {
			    return function () {
			        var pinData = productsFromViewModel[i];
					
					var urlImageLot;
					if(!pinData.ImagePath)
						urlImageLot = urlSite + "/fr/images/visuel-defaut.png";
					else
						urlImageLot = pinData.ImagePath;

			        tabInfoWindow.close();
			
			        if (parcours != null) {
			            switch (parcours) {
			                case 1:
			                    //Parcours louer
			                    if (pinData.Nature == "Appartement" && pinData.Etage != null) {
			                        tabInfoWindow
			                            .setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.Prix.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div class='ei_gly_ic_stairs' title='Etage' alt='Etage'>" + pinData.Etage + "</div> <div style='margin: 0;' class='ei_gly_ic_aspect_ratio' title='Surface' alt='Surface'> " + pinData.Taille + " m² </div> <br /> <br /> </div> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> </table>");
			                    } else {
			                        tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.Prix.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div style='margin: 0;' class='ei_gly_ic_aspect_ratio' title='Surface' alt='Surface'> " + pinData.Taille + " m² </div> <br /> <br /> </div> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> </table>");
			                    }
			                    break;

			                case 2:
			                    // parcours acheter
			                    if (pinData.Metier == metierAncien) {
			                        if (pinData.Nature == "Appartement" && pinData.Etage != null && !pinData.IsGpsExact) {
			                            tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div class='ei_gly_ic_stairs' title='Etage' alt='Etage'>" + pinData.Etage + "</div> <div style='margin: 0;' class='ei_gly_ic_aspect_ratio' title='Surface' alt='Surface'> " + pinData.Taille + " m² </div> <br /> <br /> </div> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> <tr> <td colspan='2' style='text-align:center; font-size: 11px;'> <span class='doux'> Positionnement approximatif du logement </span> </td> </tr>  </table>");
			                        }
									else if (pinData.Nature == "Appartement" && pinData.Etage != null && pinData.IsGpsExact) {
			                            tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div class='ei_gly_ic_stairs' title='Etage' alt='Etage'>" + pinData.Etage + "</div> <div style='margin: 0;' class='ei_gly_ic_aspect_ratio' title='Surface' alt='Surface'> " + pinData.Taille + " m² </div> <br /> <br /> </div> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> </table>");
			                        }
			                        else {
			                            tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div style='margin: 0;' class='ei_gly_ic_aspect_ratio' title='Surface' alt='Surface'> " + pinData.Taille + " m² </div> <br /> <br /> </div> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> <tr> <td colspan='2' style='text-align:center; font-size: 11px;'> <span class='doux'> Positionnement approximatif du logement </span> </td> </tr> </table>");
			                        }
			                    }
			                    else {
			                        if (pinData.EstProgramme === true) {
			                            tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div style='margin: 0;' class='ei_gly_building' title='Nombre de lots' alt='Nombre de lots'> " + pinData.Taille + " lots </div> <br /> <br /> </div> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> </table>");
			                        }
			                        else if (pinData.Nature == "Appartement" && pinData.Etage != null) {
			                            tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div class='ei_gly_ic_stairs' title='Etage' alt='Etage'>" + pinData.Etage + "</div> <div style='margin: 0;' class='ei_gly_ic_aspect_ratio' title='Surface' alt='Surface'> " + pinData.Taille + " m² </div> <br /> <br /> </div> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> </table>");
			                        }
			                        else {
			                            tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div style='margin: 0;' class='ei_gly_ic_aspect_ratio' title='Surface' alt='Surface'> " + pinData.Taille + " m² </div> <br /> <br /> </div> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> </table>");
			                        }
			                    }

			                    break;
			                case 3:
			                    //parcours investir
			                    if (pinData.Metier == metierAncien) {
			                        if (pinData.Nature == "Appartement" && pinData.Etage != null) {
			                            if (pinData.ListeFiscalite != null && pinData.ListeFiscalite.length > 0 && !pinData.IsGpsExact) {
			                                tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div class='ei_gly_ic_stairs' title='Etage' alt='Etage'>" + pinData.Etage + "</div> <div style='margin: 0;' class='ei_gly_ic_aspect_ratio' title='Surface' alt='Surface'> " + pinData.Taille + " m² </div> <br /> <br /> </div> <p style='font-size:11px;'>" + pinData.ListeFiscalite[0].FiscaStr + "</p> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> <tr> <td colspan='2' style='text-align:center; font-size: 11px;'> <span class='doux'> Positionnement approximatif du logement </span> </td> </tr> </table>");											
			                            }
										else if (pinData.ListeFiscalite != null && pinData.ListeFiscalite.length > 0 && pinData.IsGpsExact) {
											tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div class='ei_gly_ic_stairs' title='Etage' alt='Etage'>" + pinData.Etage + "</div> <div style='margin: 0;' class='ei_gly_ic_aspect_ratio' title='Surface' alt='Surface'> " + pinData.Taille + " m² </div> <br /> <br /> </div> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> </table>");											
										}
			                            else {
											if (pinData.IsGpsExact) {
												tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div class='ei_gly_ic_stairs' title='Etage' alt='Etage'>" + pinData.Etage + "</div> <div style='margin: 0;' class='ei_gly_ic_aspect_ratio' title='Surface' alt='Surface'> " + pinData.Taille + " m² </div> <br /> <br /> </div> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> </table>");												
											}
											else {
												tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div class='ei_gly_ic_stairs' title='Etage' alt='Etage'>" + pinData.Etage + "</div> <div style='margin: 0;' class='ei_gly_ic_aspect_ratio' title='Surface' alt='Surface'> " + pinData.Taille + " m² </div> <br /> <br /> </div> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> <tr> <td colspan='2' style='text-align:center; font-size: 11px;'> <span class='doux'> Positionnement approximatif du logement </span> </td> </tr> </table>");												
											}
			                            }
			                        }
			                        else {
			                            if (pinData.ListeFiscalite != null && pinData.ListeFiscalite.length > 0 && !pinData.IsGpsExact) {
			                                tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div style='margin: 0;' class='ei_gly_ic_aspect_ratio' title='Surface' alt='Surface'> " + pinData.Taille + " m² </div> <br /> <br /> </div> <p style='font-size:11px;'>" + pinData.ListeFiscalite[0].FiscaStr + "</p> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> <tr> <td colspan='2' style='text-align:center; font-size: 11px;'> <span class='doux'> Positionnement approximatif du logement </span> </td> </tr> </table>");											
			                            }
										else if (pinData.ListeFiscalite != null && pinData.ListeFiscalite.length > 0 && pinData.IsGpsExact) {
											tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div class='ei_gly_ic_stairs' title='Etage' alt='Etage'>" + pinData.Etage + "</div> <div style='margin: 0;' class='ei_gly_ic_aspect_ratio' title='Surface' alt='Surface'> " + pinData.Taille + " m² </div> <br /> <br /> </div> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> </table>");											
										}
			                            else {
											if (pinData.IsGpsExact) {
												tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div class='ei_gly_ic_stairs' title='Etage' alt='Etage'>" + pinData.Etage + "</div> <div style='margin: 0;' class='ei_gly_ic_aspect_ratio' title='Surface' alt='Surface'> " + pinData.Taille + " m² </div> <br /> <br /> </div> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> </table>");												
											}
											else {
												tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div style='margin: 0;' class='ei_gly_ic_aspect_ratio' title='Surface' alt='Surface'> " + pinData.Taille + " m² </div> <br /> <br /> </div> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> <tr> <td colspan='2' style='text-align:center; font-size: 11px;'> <span class='doux'> Positionnement approximatif du logement </span> </td> </tr> </table>");												
											}
			                            }
			                        }
			                    }
			                    else {
			                        if (pinData.EstProgramme === true) {
			                            if (pinData.ListeFiscalite != null && pinData.ListeFiscalite.length > 0) {
			                                tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div style='margin: 0;' class='ei_gly_building' title='Nombre de lots' alt='Nombre de lots'> " + pinData.Taille + " lots </div> <br /> <br /> </div> <p style='font-size:11px;'>" + pinData.ListeFiscalite[0].FiscaStr + "</p> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> </table>");
			                            }
			                            else {
			                                tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div style='margin: 0;' class='ei_gly_building' title='Nombre de lots' alt='Nombre de lots'> " + pinData.Taille + " lots </div> <br /> <br /> </div> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> </table>");
			                            }
			                        }
			                        else if (pinData.Nature == "Appartement" && pinData.Etage != null) {
			                            if (pinData.ListeFiscalite != null && pinData.ListeFiscalite.length > 0) {
			                                tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div class='ei_gly_ic_stairs' title='Etage' alt='Etage'>" + pinData.Etage + "</div> <div style='margin: 0;' class='ei_gly_ic_aspect_ratio' title='Surface' alt='Surface'> " + pinData.Taille + " m² </div> <br /> <br /> </div> <p style='font-size:11px;'>" + pinData.ListeFiscalite[0].FiscaStr + "</p> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> </table>");
			                            }
			                            else {
			                                tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div class='ei_gly_ic_stairs' title='Etage' alt='Etage'>" + pinData.Etage + "</div> <div style='margin: 0;' class='ei_gly_ic_aspect_ratio' title='Surface' alt='Surface'> " + pinData.Taille + " m² </div> <br /> <br /> </div> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> </table>");
			                            }
			                        }
			                        else {
			                            if (pinData.ListeFiscalite != null && pinData.ListeFiscalite.length > 0) {
			                                tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div style='margin: 0;' class='ei_gly_ic_aspect_ratio' title='Surface' alt='Surface'> " + pinData.Taille + " m² </div> <br /> <br /> </div> <p style='font-size:11px;'>" + pinData.ListeFiscalite[0].FiscaStr + "</p> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> </table>");
			                            }
			                            else {
			                                tabInfoWindow.setContent("<table style='width:100%'> <tr> <td style='width: 30%;'> <div style='background-image: url(" + urlImageLot + ");width:100%;height:80px;background-position: center;align-items: center;overflow: hidden;display: flex;background-repeat: no-repeat;background-size: cover;' /> </td> <td style='width:50%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='zonetext'> <p style='margin: 0'> <strong style='color: red;'>" + pinData.Nom + "</strong> </p> <p style='color: grey; margin: 0;'>" + pinData.Emplacement + "</p> <p style='margin: 0;'><strong>" + pinData.PrixFloat.toLocaleString() + " EUR</strong></p> <div style='font-size:11px; margin: 0;' class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='zonepicto'> <div style='margin: 0;' class='ei_gly_ic_aspect_ratio' title='Surface' alt='Surface'> " + pinData.Taille + " m² </div> <br /> <br /> </div> <a id='lien' href='" + pinData.UrlProduct + "'> Voir + </a> </div> </td> </tr> </table>");
			                            }
			                        }
			                    }
			                    break;

			                default:
			                    tabInfoWindow.setContent("<table style='width:100%'> <tr> <td> <img src='" + urlImageLot + "' style='width:100%' /> </td> <td style='width:64%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='C:P.C.F3_0.R7:D'> <p style='padding-top: 5%;'><strong class='_c1 bigger _c1' style='color: red;'>" + pinData.Nom + "</strong></p> <p style='padding: 2%; color: grey;'>" + pinData.Emplacement + "</p> <p style='padding: 2%;'><strong class='_c1 bigger _c1'>" + pinData.Prix + "</strong></p> <div class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='C:P.C.F3_0.R5:D'> <p><img width='20' title='Etage' alt='Etage' src='https://raw.githubusercontent.com/Actimage-Desbonnets-Allan/AfedimMaquettage/main/desbonal/iconebleue_etage.jpg'>" + pinData.Etage + "</p> <p><img width='20' title='Surface' alt='Surface' src='https://raw.githubusercontent.com/Actimage-Desbonnets-Allan/AfedimMaquettage/main/desbonal/iconebleue_surface.jpg'> " + pinData.Taille + " m²</p> </div><br><span class='ei_buttonbar' id='C:P.C.F3_0.B:S'><span class='ei_button' id='C:P.C.F3_0.R6:RootSpan'><a class='ei_btn ei_btn_fn_forward' id='C:P.C.F3_0.R6:link' href='" + pinData.UrlProduct + "'><span class='_c1 ei_btn_body _c1' id='C:P.C.F3_0.R6:labelsubmit'><span class='_c1 ei_btn_tlcorn _c1'></span><span class='_c1 ei_btn_label _c1'>Voir +</span><span class='_c1 ei_iblock ei_btn_pic _c1' aria-hidden='true'>&nbsp;</span></span><span class='_c1 ei_btn_footer _c1'><span class='_c1 ei_btn_blcorn _c1'></span></span></a></span></span> </div> </div> </td> </tr> <tr> <td colspan='2' style='text-align:center;'> <span class='doux' >Positionnement approximatif du logement </span> </td> </tr> </table>");								
			            }
			        }
			        else
			        {
			            tabInfoWindow.setContent("<table style='width:100%'> <tr> <td> <img src='" + urlImageLot + "' style='width:100%' /> </td> <td style='width:64%'> <div class='ei_flex ei_flex_justcenter ei_flex_col ei_flex_alcenter ei_flex_gutter' id='C:P.C.F3_0.R7:D'> <p style='padding-top: 5%;'><strong class='_c1 bigger _c1' style='color: red;'>" + pinData.Nom + "</strong></p> <p style='padding: 2%; color: grey;'>" + pinData.Emplacement + "</p> <p style='padding: 2%;'><strong class='_c1 bigger _c1'>" + pinData.Prix + "</strong></p> <div class='ei_flex ei_flex_justcenter ei_flex_alcenter ei_flex_gutter' id='C:P.C.F3_0.R5:D'> <p><img width='20' title='Etage' alt='Etage' src='https://raw.githubusercontent.com/Actimage-Desbonnets-Allan/AfedimMaquettage/main/desbonal/iconebleue_etage.jpg'>" + pinData.Etage + "</p> <p><img width='20' title='Surface' alt='Surface' src='https://raw.githubusercontent.com/Actimage-Desbonnets-Allan/AfedimMaquettage/main/desbonal/iconebleue_surface.jpg'> " + pinData.Taille + " m²</p> </div><br><span class='ei_buttonbar' id='C:P.C.F3_0.B:S'><span class='ei_button' id='C:P.C.F3_0.R6:RootSpan'><a class='ei_btn ei_btn_fn_forward' id='C:P.C.F3_0.R6:link' href='" + pinData.UrlProduct + "'><span class='_c1 ei_btn_body _c1' id='C:P.C.F3_0.R6:labelsubmit'><span class='_c1 ei_btn_tlcorn _c1'></span><span class='_c1 ei_btn_label _c1'>Voir +</span><span class='_c1 ei_iblock ei_btn_pic _c1' aria-hidden='true'>&nbsp;</span></span><span class='_c1 ei_btn_footer _c1'><span class='_c1 ei_btn_blcorn _c1'></span></span></a></span></span> </div> </div> </td> </tr> <tr> <td colspan='2' style='text-align:center;'> <span class='doux' >Positionnement approximatif du logement </span> </td> </tr> </table>");						
			        }

			        tabInfoWindow.open(map, marker);
			    }
			})(marker, i));
			
			//création d'un objet plus global contenant l'id généré côté c#, le marker google, l'élément du dom et des bool d'état
			var objMarker = 
			{
				id :dataMarker.IdCard,
				htmlElement : null,
				markerGoogle : marker,
				highlight : false,
				highlightCard : false,
				metier : dataMarker.Metier,
				isGpsExact : dataMarker.IsGpsExact,
			};
			

			//On sauvegarde l'objMarker créé dans le tableau
			markersSearch.push(objMarker);
    	}   
	//	appel à la fonction de rezoom de la carte en fonction des markers qu'elle contient
	//setMapPositionWithinBounds();
  }

  /**
   * Fonction d'ajout d'un élément de la page aux objets objMarker de markersSearch
   * Le but est de pouvoir sur des événements souris sur le markergoogle ou la productcard devbooster réaliser des animations graphiques
   * @param {*} element 
   * @param {*} idProductCard 
   */
   function addCardMarker(element,idProductCard)
   {
	 var found = false;
	 // on boucle sur le tableau d'objets objMarker créé lors du chargement des données depuis le modèle au niveau de la fonction  setProductMarkers
	 for(let i = 0; i < markersSearch.length; i++)
	 {
		 //On cherche l'objet ayant appelé addCardMarker dans le tableau pour le compléter. Id défini dans le c# du modèle.
		 if(markersSearch[i].id == idProductCard)
		 {
			 found = true;
			 markersSearch[i].htmlElement = element; // on ajoute l'élément html qui n'était pas dispo lors du setProductMarkers à l'objMarker
			 var objMarker = markersSearch[i];
			
			 //action executée lors du mouseover sur le marker google
			 google.maps.event.addListener(objMarker.markerGoogle, 'mouseover', (function (objMarker) {
				 return function () {
					 if (objMarker.metier == metierAncien && !objMarker.isGpsExact) {
						 cityCircle = new google.maps.Circle({
							 strokeColor: "#004494",
							 strokeOpacity: 0.8,
							 strokeWeight: 0.2,
							 fillColor: "#004494",
							 fillOpacity: 0.30,
							 map: map,
							 center: { lat: objMarker.markerGoogle.getPosition().lat(), lng: objMarker.markerGoogle.getPosition().lng() },
							 radius: 250
						 });
					 }
					 if (!objMarker.highlightCard) {
						 objMarker.highlightCard = true;
						 var classActives = objMarker.htmlElement.Attr('class');
						 classActives = classActives + " " + "ei_hlighted";
						 objMarker.htmlElement.Attr('class', classActives);
					 }
				 }
			 })(objMarker));
 
			 //action executée lors du mouseout sur le marker google
			 google.maps.event.addListener(objMarker.markerGoogle,'mouseout', (function(objMarker) {
				 return function () {
					 if (objMarker.metier == metierAncien && !objMarker.isGpsExact) {
          			 	cityCircle.setMap(null);
					 }
					 if(objMarker.highlightCard)
					 {
						 objMarker.highlightCard = false;
						 var classActives = objMarker.htmlElement.Attr('class');
						 classActives = classActives.replace("ei_hlighted", "");
						 objMarker.htmlElement.Attr('class',classActives);
					 }
				 }
			 })(objMarker));

			objMarker.markerGoogle.setMap(map);

			//on ajoute le marker google à la liste des marker de la page et à l'émlement bounds qui permet ensuitre de rezise la map pour afficher
			// tous les markers qu'elle contient
			markers.push(objMarker.markerGoogle);
			bounds.extend(objMarker.markerGoogle.position);
			setMapPositionWithinBounds();
		 }
	 }
   }

	

  /**
   * Fonction permettant de faire une animation lors du survol de la carte produit devbooster
   * @param {*} idProductCard 
   */
  function highlightMarker(idProductCard)
  {
	// on recherche l'objet qui nous intéresse dans le tableau chargé js
	for(let i = 0; i < markersSearch.length; i++)
	{
		if(markersSearch[i].id == idProductCard)
		{
			// on utilise un bool pour faire l'action une seule fois sur le mouseover et pas n fois.
			if(!markersSearch[i].highlight)
			{
				markersSearch[i].highlight = true;
				markersSearch[i].markerGoogle.setAnimation(google.maps.Animation.BOUNCE);
			}
		}
	}
  }

  function markersForFranceBounds()
  {
	// Liste contenant les points extrêmes de la france métropolitaine
	var listCoordsBorderFrance =
	[
		new google.maps.LatLng(51.07166667, 2.528333333),
		new google.maps.LatLng(42.28222222, 9.56),
		new google.maps.LatLng(41.31666667, 9.25),
		new google.maps.LatLng(48.44583333, -5.151111111)
	];

	// Initialisation des variables markers et bounds
	var boundsFrance = new google.maps.LatLngBounds();;
	var markerPoiFrance;

	// On boucle sur les extrêmes et on les ajoute sans icône
	for(let i = 0; i<4; i++)
	{
		markerPoiFrance = new google.maps.Marker({
			map: map,
			position: listCoordsBorderFrance[i],
			icon: {
				path: google.maps.SymbolPath.CIRCLE,
            	scale: 0
			}
		});
	
		objPoiFrance = 
		{
			markerGoogle : markerPoiFrance
		};

	    //ajout pour le recalcul du zoom
	    boundsFrance.extend(objPoiFrance.markerGoogle.position);
	}

	//recalcul du zoom
	map.fitBounds(boundsFrance);
  }

  /**
   * Fonction permettant de stopper l'animation lors de la fin du survol de la carte produit devbooster
   * @param {*} idProductCard 
   */
  function hideHighlightMarker(idProductCard)
  {
	// on recherche l'objet qui nous intéresse dans le tableau chargé js
	for(let i = 0; i < markersSearch.length; i++)
	{
		if(markersSearch[i].id == idProductCard)
		{
			// on recherche l'objet qui nous intéresse dans le tableau chargé js
			if(markersSearch[i].highlight)
			{
				markersSearch[i].highlight = false;
				markersSearch[i].markerGoogle.setAnimation(null);
			}
			
		}
	}
  }


/**
 * *************************************************
 * 
 * Fin - Gestion partie recherche
 * 
 * *************************************************
 */
/*


/**
 * --------------------------------------------------------------------------------
 * --------------------------------------------------------------------------------
 * Zone Immocot / Lecture automatique des points d'intérêts prédéfinis
 * 
 * Pour fonctionner, la var map doit déja être définie cf. fonction plus haut
 * idem pour markerBien;
 * --------------------------------------------------------------------------------
 * * ------------------------------------------------------------------------------
 */


 var markersGare,markersBus,markersTram,markersMetro,markersAeroport,markersParking,markersParkingRelais,markersCovoiturage;
 var markersGareDispo,markersBusDispo,markersTramDispo,markersMetroDispo,markersAeroportDispo,markersParkingDispo,markersParkingRelaisDispo,markersCovoiturageDispo;
 
 var markersCreche, markersMaternelle, markersPrimaire,markersCollege,markersLycee,markersEnsSup;
 var markersCrecheDispo, markersMaternelleDispo, markersPrimaireDispo,markersCollegeDispo,markersLyceeDispo,markersEnsSupDispo;
 
 var markersBiblio, markersMusee, markersCine, markersTheatre, markersConcert, markersPiscine, markersSport, markersEquitation, markersParc, markersRestau, markersBar,markersDiscotheque, markersCulte;
 var markersBiblioDispo, markersMuseeDispo, markersCineDispo, markersTheatreDispo, markersConcertDispo, markersPiscineDispo, markersSportDispo, markersEquitationDispo, markersParcDispo, markersRestauDispo, markersBarDispo,markersDiscothequeDispo, markersCulteDispo;
 
 var markersBoulangerie, markersSupermarche,markersCentreCom,markersBanque,markersStationServ,markersPresse;
 var markersBoulangerieDispo, markersSupermarcheDispo,markersCentreComDispo,markersBanqueDispo,markersStationServDispo,markersPresseDispo;
 
 var markersPharma, markersMedecin, markersHopitaux;
 var markersPharmaDispo, markersMedecinDispo, markersHopitauxDispo;
 
 var ssCatTransport = ["T01","T02","T03","T04","T05","T06","T07","T08"];
 var ssCatEnseignement = ["E01","E02","E03","E04","E05","E06"];
 var ssCatCommerces = ["C01","C02","C03","C04","C05","C06"];
 var ssCatMedical = ["M01","M02","M03"];
 var ssCatLoisirs = ["L01","L02","L03","L04","L05","L06","L07","L08","L09","L10","L11","L12","L13"];
 
 var markersTransportDispo,markersEnseignementDispo,markersCommercesDispo,markersMedicalDispo,markersLoisirsDispo;

 var service;
 var immocotMarker;
 var marker;
 var markersVisiblesBounds;
 var directionsDisplayOptions;
 var calcTrajetFait;
 var lat;
 var lng;
 var infowindow;
 
 /**
  * Initialisation système recherche automatique de points d'intérêts prédéfinis
  */
 function initializeImmocotMap() {
	 markersVisiblesBounds = {};
	 lat = markerBien.lat();
	 lng = markerBien.lng();

	 service = new google.maps.places.PlacesService(map);
	 
	 infowindow = new google.maps.InfoWindow();

	 initBoolMarkers();
 }
 
 //initialisation des bool permettant de savoir si le calcul des pois a deja été fait
 function initBoolMarkers()
 {
	 markersGareDispo = 0;
	 markersBusDispo = 0;
	 markersTramDispo = 0;
	 markersMetroDispo = 0;
	 markersAeroportDispo = 0;
	 markersParkingDispo = 0;
	 markersParkingRelaisDispo = 0;
	 markersCovoiturageDispo = 0;
	 
	 markersCrecheDispo = 0;
	 markersMaternelleDispo = 0;
	 markersPrimaireDispo = 0;
	 markersCollegeDispo = 0;
	 markersLyceeDispo = 0;
	 markersEnsSupDispo = 0;
	 
	 markersBiblioDispo = 0;
	 markersMuseeDispo = 0;
	 markersCineDispo = 0;
	 markersTheatreDispo = 0;
	 markersConcertDispo = 0;
	 markersPiscineDispo = 0;
	 markersSportDispo = 0;
	 markersEquitationDispo = 0;
	 markersParcDispo = 0;	
	 markersRestauDispo = 0;	
	 markersBarDispo = 0;	
	 markersDiscothequeDispo = 0;
	 markersCulteDispo = 0;
 
	 markersBoulangerieDispo = 0;
	 markersSupermarcheDispo = 0;
	 markersCentreComDispo = 0;
	 markersBanqueDispo = 0;
	 markersStationServDispo = 0;
	 markersPresseDispo = 0;
	 
	 markersPharmaDispo = 0;
	 markersMedecinDispo = 0;
	 markersHopitauxDispo = 0;	
	 
	 markersTransportDispo = 0;
	 markersEnseignementDispo = 0;
	 markersCommercesDispo = 0;
	 markersMedicalDispo = 0;
	 markersLoisirsDispo = 0;
 }
 
 //définitions des marqueurs pour une catégorie
 function defineMarkersCateg(categ)
 {
	 switch(categ)
	 {
		 case "T":
			 if(markersTransportDispo == 0)
			 {
				 defineMarkersTransport();
				 markersTransportDispo = 1;
			 }
			 break;
		 case "E":
			 if(markersEnseignementDispo == 0)
			 {
				 defineMarkersEnseignement();
				 markersEnseignementDispo = 1;
			 }
			 break;
		 case "C":
			 if(markersCommercesDispo == 0)
			 {
				 defineMarkersCommerce();
				 markersCommercesDispo = 1;
			 }
			 break;
		 case "M":
			 if(markersMedicalDispo == 0)
			 {
				 defineMarkersMedical();
				 markersMedicalDispo = 1;
			 }
			 break;
		 case "L":
			 if(markersLoisirsDispo == 0)
			 {
				 defineMarkersLoisirs();
				 markersLoisirsDispo = 1;
			 }
			 break;
	 }
 }
 
 //definition des markers tranpsport
 function defineMarkersTransport()
 {	
	 //Transport
	 //gare
	 markersGare=[];
	 RecherchePois('train','train_station',"T01",markersGare,1,1500,5);
	 //bus
	 markersBus=[];
	 RecherchePois('bus arret','',"T02",markersBus,1,1500,5);
	 //tram
	 markersTram=[];
	 RecherchePois('tramway arret','',"T03",markersTram,1,1500,5);
	 //metro
	 markersMetro=[];
	 RecherchePois('metro','subway_station',"T04",markersMetro,1,1500,5);
	 //aeroport
	 markersAeroport=[];
	 RecherchePois('aeroport','airport',"T05",markersAeroport,1,1500,5);
	 //parking
	 markersParking=[];
	 RecherchePois('parking','parking',"T06",markersParking,1,1500,5);
	 //parking relais
	 markersParkingRelais=[];
	 RecherchePois('parking relais p+r','parking',"T07",markersParkingRelais,1,1500,5);
	 //covoiturage
	 markersCovoiturage=[];
	 RecherchePois('covoiturage','',"T08",markersCovoiturage,1,1500,5);
 }
 
 //definition des markers enseignement
 function defineMarkersEnseignement()
 {
	 //Enseignement 
	 //creche
	 markersCreche=[];
	 RecherchePois('creche','',"E01",markersCreche,1,1500,5);
	 //maternelle
	 markersMaternelle=[];
	 RecherchePois('maternelle','school',"E02",markersMaternelle,1,1500,5);
	 //primaire
	 markersPrimaire=[];
	 RecherchePois('primaire elementaire','school',"E03",markersPrimaire,1,1500,5);
	 //collège
	 markersCollege=[];
	 RecherchePois('college','school',"E04",markersCollege,1,1500,5);
	 //lycée
	 markersLycee=[];
	 RecherchePois("lycee",'',"E05",markersLycee,1,1500,5);
	 //enseignement supérieur
	 markersEnsSup=[];
	 RecherchePois('faculte ecole superieure universite','',"E06",markersEnsSup,1,1500,5);
 }
 
 //definition des markers commerce
 function defineMarkersCommerce()
 {
	 //Commerce et services 
	 //boulangerie
	 markersBoulangerie=[];
	 RecherchePois('boulangerie','bakery',"C01",markersBoulangerie,1,1500,5);
	 //supermarché
	 markersSupermarche=[];
	 RecherchePois('supermarche hypermarche','supermarket',"C02",markersSupermarche,1,1500,5);
	 //centre commercial
	 markersCentreCom=[];
	 RecherchePois('centre commercial','shopping_mall',"C03",markersCentreCom,1,1500,5);
	 //banque
	 markersBanque=[];
	 RecherchePois('banque distributeur','bank',"C04",markersBanque,1,1500,5);
	 //station services
	 markersStationServ=[];
	 RecherchePois('station service','gas_station',"C05",markersStationServ,1,1500,5);
	 //tabac / presse
	 markersPresse=[];
	 RecherchePois('magazines tabac','',"C06",markersPresse,1,1500,5);
 }
 
 //definition des markers medical
 function defineMarkersMedical()
 {
	 //Medical
	 //pharmacie
	 markersPharma=[];
	 RecherchePois('pharmacie','pharmacy',"M01",markersPharma,1,1500,5);
	 //medecin
	 markersMedecin=[];
	 RecherchePois('medecin generaliste','doctor',"M02",markersMedecin,1,1500,5);
	 //hopitaux
	 markersHopitaux=[];
	 RecherchePois('centre hospitalier CH CHU CHRU','hospital',"M03",markersHopitaux,1,1500,5);
 }
 
  //definition des markers loisirs
  function defineMarkersLoisirs()
  {
	  //Loisirs
	  //bibliothèque
	  markersBiblio=[];
	  RecherchePois('bibliotheque mediatheque','library',"L01",markersBiblio,1,1500,5);
	  //musee
	  markersMusee=[];
	  RecherchePois('musee','museum',"L02",markersMusee,1,1500,5);
	  //cinema
	  markersCine=[];
	  RecherchePois('cinema complexe','movie_theater',"L03",markersCine,1,1500,5);
	  //theatre
	  markersTheatre=[];
	  RecherchePois('theatre salle','',"L04",markersTheatre,1,1500,5);
	  //concert
	  markersConcert=[];
	  RecherchePois('(salle de spectacles) OR (salle de concerts)','',"L05",markersConcert,1,1500,5);
	  //piscine
	  markersPiscine=[];
	  RecherchePois('piscine olympique','',"L06",markersPiscine,1,1500,5);
	  //salle de sport
	  markersSport=[];
	  RecherchePois('salle fitness musculation','gym',"L07",markersSport,1,1500,5);
	  //centre equestre
	  markersEquitation=[];
	  RecherchePois('equitation cheval centre equestre','',"L08",markersEquitation,1,1500,5);
	  //parc
	  markersParc=[];
	  RecherchePois('parc public','park',"L09",markersParc,1,1500,5);
	  //restaurant
	  markersRestau=[];
	  RecherchePois('restaurant brasserie','restaurant',"L10",markersRestau,1,1500,5);
	  //bar
	  markersBar=[];
	  RecherchePois('pub bar biere cocktails cafe','bar cafe',"L11",markersBar,1,1500,5);
	  //discothèque
	  markersDiscotheque=[];
	  RecherchePois('discotheque','night_club',"L12",markersDiscotheque,1,1500,5);
	  //lieu de culte
	  markersCulte=[];
	  RecherchePois('(synagogue) OR (mosquee) OR (eglise) OR (temple)','church mosque synagogue',"L13",markersCulte,1,1500,5);
  }

 //fonction de recherche des points d'interets
 // motscles : mots clés du poi
 // typePoi : type google map du POI (cf doc developpeur GoogleMapAPI). Parametre optionnel
 // code : code de la sous catégorie (permet de différencier les icones a afficher et de distinguer les POI sous catégorie d'une catégorie)
 // markers : tableau de marqueurs à passer qui sera MAJ par la fonction
 // type : type de recherche 1 : recherche nearby via le rayon et par ordre d'importance du POI decroissant. 2 : recherche nearby des POI classé par distance croissante
 // rayon : rayon de la recherche en metres. Obligatoire pour la recherche de type 1
 // maxres : nombre max de résultats demandés
 function RecherchePois(motscles,typePoi,code,markers,type,rayon,maxres)
 {	
	 var request;
	 //recherche par rayon pour aller plus loin dans la recherche en distance, pour le cas des facultés par ex
	 if(type == 1)
	 {
		 request = {
			 location: new google.maps.LatLng(lat, lng), 
			 keyword: motscles,
			 type : typePoi,
			 radius : rayon
		 };
	 }
	 else
	 {
		 request = {
			 location: new google.maps.LatLng(lat, lng), 
			 keyword: motscles,
			 type : typePoi,
			 rankBy:google.maps.places.RankBy.DISTANCE
		 };
	 }
 
	 service.nearbySearch(request, function(results, status)
	 {
		 callback(results,status,code,markers,maxres)
	 });
 }
 
 /** 
  * callback de nearbySearch 
  * contient la gestion des icones des markers perso
 */
 function callback(results, status,code,markers,maxres) {  
	 //affectation de l'icone correspondant au point d'intérêt
	 var iconePoi,titrePoi;
	 switch(code)
	 {
		 case "T01":
			 iconePoi = urlMarkers + "/poiauto/Picto-T-gare.png";
			 titrePoi = "Gare";
			 break;
		 case "T02":
			 iconePoi = urlMarkers + "/poiauto/Picto-T-bus.png";
			 titrePoi = "Bus";
			 break;
		 case "T03":
			 iconePoi = urlMarkers + "/poiauto/Picto-T-tramway.png";
			 titrePoi = "Tram";
			 break;
		 case "T04":
			 iconePoi = urlMarkers + "/poiauto/Picto-T-metro.png";
			 titrePoi = "Métro";
			 break;
		 case "T05":
			 iconePoi = urlMarkers + "/poiauto/Picto-T-aeroport.png";
			 titrePoi = "Aéroport";
			 break;
		 case "T06":
			 iconePoi = urlMarkers + "/poiauto/Picto-T-parking.png";
			 titrePoi = "Parking";
			 break;
		 case "T07":
			 iconePoi = urlMarkers + "/poiauto/Picto-T-parking-relais.png";
			 titrePoi = "Parking relais";
			 break;
		 case "T08":
			 iconePoi = urlMarkers + "/poiauto/Picto-T-covoiturage.png";
			 titrePoi = "Aire de covoiturage";
			 break;
			 
		 case "E01":
			 iconePoi = urlMarkers + "/poiauto/Picto-E-Creche.png";
			 titrePoi = "Crèche";
			 break;
		 case "E02":
			 iconePoi = urlMarkers + "/poiauto/Picto-E-Maternelle.png";
			 titrePoi = "Maternelle";
			 break;
		 case "E03":
			 iconePoi = urlMarkers + "/poiauto/Picto-E-primaire.png";
			 titrePoi = "Ecole primaire";
			 break;
		 case "E04":
			 iconePoi = urlMarkers + "/poiauto/Picto-E-college.png";
			 titrePoi = "Collège";
			 break;
		 case "E05":
			 iconePoi = urlMarkers + "/poiauto/Picto-E-lycee.png";
			 titrePoi = "Lycée";
			 break;
		 case "E06":
			 iconePoi = urlMarkers + "/poiauto/Picto-E-eSuperieur.png";
			 titrePoi = "Enseignement supérieur";
			 break;
		 
		 case "L01":
			 iconePoi = urlMarkers + "/poiauto/Picto-L-bibliotheque.png";
			 titrePoi = "Bibliothèque / Médiathèque";
			 break;
		 case "L02":
			 iconePoi = urlMarkers + "/poiauto/Picto-L-musee.png";
			 titrePoi = "Musée";
			 break;
		 case "L03":
			 iconePoi = urlMarkers + "/poiauto/Picto-L-cinema.png";
			 titrePoi = "Cinéma";
			 break;
		 case "L04":
			 iconePoi = urlMarkers + "/poiauto/Picto-L-theatre.png";
			 titrePoi = "Théatre";
			 break;
		 case "L05":
			 iconePoi = urlMarkers + "/poiauto/Picto-L-concert.png";
			 titrePoi = "Salle de concert / Opéra";
			 break;
		 case "L06":
			 iconePoi = urlMarkers + "/poiauto/Picto-L-piscine.png";
			 titrePoi = "Piscine";
			 break;
		 case "L07":
			 iconePoi = urlMarkers + "/poiauto/Picto-L-salle-sport.png";
			 titrePoi = "Salle de sport";
			 break;
		 case "L08":
			 iconePoi = urlMarkers + "/poiauto/Picto-L-centre-equestre.png";
			 titrePoi = "Centre équestre";
			 break;
		 case "L09":
			 iconePoi = urlMarkers + "/poiauto/Picto-L-aire-jeu-enfants.png";
			 titrePoi = "Parc";
			 break;
		 case "L10":
			 iconePoi = urlMarkers + "/poiauto/Picto-L-Restaurant.png";
			 titrePoi = "Restaurant";
			 break;
		 case "L11":
			 iconePoi = urlMarkers + "/poiauto/Picto-L-bar.png";
			 titrePoi = "Bar";
			 break;
		 case "L12":
			 iconePoi = urlMarkers + "/poiauto/Picto-L-discotheque.png";
			 titrePoi = "Discothèque";
			 break;
		 case "L13":
			 iconePoi = urlMarkers + "/poiauto/Picto-L-lieu-culte.png";
			 titrePoi = "Lieu de culte";
			 break;
			 
		 case "C01":
			 iconePoi = urlMarkers + "/poiauto/Picto-C-boulangerie.png";
			 titrePoi = "Boulangerie";
			 break;
		 case "C02":
			 iconePoi = urlMarkers + "/poiauto/Picto-C-supermarche.png";
			 titrePoi = "Supermarché";
			 break;
		 case "C03":
			 iconePoi = urlMarkers + "/poiauto/Picto-C-centre-commercial.png";
			 titrePoi = "Centre commercial";
			 break;
		 case "C04":
			 iconePoi = urlMarkers + "/poiauto/Picto-C-banque.png";
			 titrePoi = "Banque";
			 break;
		 case "C05":
			 iconePoi = urlMarkers + "/poiauto/Picto-C-station-service.png";
			 titrePoi = "Station-service";
			 break;
		 case "C06":
			 iconePoi = urlMarkers + "/poiauto/Picto-C-tabac-presse.png";
			 titrePoi = "Tabac Presse";
			 break;
			 
		 case "M01":
			 iconePoi = urlMarkers + "/poiauto/Picto-M-pharmacie.png";
			 titrePoi = "Pharmacie";
			 break;
		 case "M02":
			 iconePoi = urlMarkers + "/poiauto/Picto-M-medecin.png";
			 titrePoi = "Médecin";
			 break;
		 case "M03":
			 iconePoi = urlMarkers + "/poiauto/Picto-M-hopital.png";
			 titrePoi = "Hôpital";
			 break;
	 }
	 
	 var max;
	 if(results == null || results.length > maxres)
		 max=maxres;
	 else
		 max=results.length;

	 var markerPoi;
	 var objPoi;
	 var geocoder = new google.maps.Geocoder;
	 
	 if (status == google.maps.places.PlacesServiceStatus.OK) {
		 
		 for (var i = 0; i < max; i++) {
			//resize de la taille de l'image du marker
			var iconResize = {
				url: iconePoi,
				scaledSize: new google.maps.Size(30, 35),
			};

			 markerPoi = new google.maps.Marker({
						 map: map,
						 icon : iconResize,
						 position: results[i].geometry.location,
						 title:results[i].name,
						 //collisionBehavior : mapCollisionBehavior
			 });
			 
			 objPoi = 
			 {
				 markerGoogle : markerPoi,
				 nom : results[i].name,
				 adresse : results[i].vicinity,
				 type : results[i].types.toString()
			 };
			
			 if (objPoi.type && !objPoi.type.includes('station','parking') && objPoi.adresse && (!objPoi.adresse.includes(',') || objPoi.adresse.length < 19)) {
				 //cas ou l'adresse donnée par Google semble manquer de précision
				 //amélioration de la précision de l'adresse
			     //on fait un géocodage inversé pour obtenir plus de précsions sur l'adresse
                 //on ne fait pas l'amélioration pour les arret bus,tram ou les parking, provoque des erreurs query limit
				 geocoder.geocode({ 'location': objPoi.markerGoogle.position }, (function (objPoi) {
					 return function (resultsGeocode, status) {
						 if (status === 'OK') {
							 objPoi.adresse = resultsGeocode[0].formatted_address;
						 }
						 //si ca ne fonctionne pas, on garde le vicinity remonté par le nearbySearch (un peu moins précs)
					 }
				 })(objPoi));
			 }
			
			//Ajout de l'infobulle du marker
			 google.maps.event.addListener(objPoi.markerGoogle, 'click', (function (objPoi) {
				return function () {
					//var contenubulle = "<b>" + titrePoi + "<br/>" + objPoi.nom + "</b>" + "<br/>" + objPoi.adresse;
					var contenubulle = "<b>" + objPoi.nom + "</b>" + "<br/>" + objPoi.adresse;
					infowindow.setContent(contenubulle);
					infowindow.open(map, objPoi.markerGoogle);
				}
			})(objPoi));

			//ajout du POI au tableau
			 markers.push(objPoi);
			 //ajout pour le recalcul du zoom
			 bounds.extend(objPoi.markerGoogle.position);
		 }
		 
		 //recalcul du zoom
		 map.fitBounds(bounds);
	 }
   }

 /**
  * permet de récupérer la liste des markers (deja calculés) d une sous categorie
  */
 function defineMarkersMaj(sscat)
 {
	 var markersMaj;
	 switch(sscat)
	 {
		 //transport
		 case "T01":
			 markersMaj = markersGare;
			 break;
		 case "T02":
			 markersMaj = markersBus;
			 break;
		 case "T03":
			 markersMaj = markersTram;
			 break;
		 case "T04":
			 markersMaj = markersMetro;
			 break;
		 case "T05":
			 markersMaj = markersAeroport;
			 break;
		 case "T06":
			 markersMaj = markersParking;
			 break;
		 case "T07":
			 markersMaj = markersParkingRelais;
			 break;
		 case "T08":
			 markersMaj = markersCovoiturage;
			 break;
		 
		 //education		
		 case "E01":
			 markersMaj = markersCreche;
			 break;
		 case "E02":
			 markersMaj = markersMaternelle;
			 break;
		 case "E03":
			 markersMaj = markersPrimaire;
			 break;
		 case "E04":
			 markersMaj = markersCollege;
			 break;
		 case "E05":
			 markersMaj = markersLycee;
			 break;
		 case "E06":
			 markersMaj = markersEnsSup;
			 break;
		 
		 //loisirs		
		 case "L01":
			 markersMaj = markersBiblio;
			 break;
		 case "L02":
			 markersMaj = markersMusee;
			 break;
		 case "L03":
			 markersMaj = markersCine;
			 break;
		 case "L04":
			 markersMaj = markersTheatre;
			 break;
		 case "L05":
			 markersMaj = markersConcert;
			 break;
		 case "L06":
			 markersMaj = markersPiscine;
			 break;
		 case "L07":
			 markersMaj = markersSport;
			 break;
		 case "L08":
			 markersMaj = markersEquitation;
			 break;
		 case "L09":
			 markersMaj = markersParc;
			 break;
		 case "L10":
			markersMaj = markersRestau;
			break;
		 case "L11":
			markersMaj = markersBar;
			break;
		 case "L12":
			markersMaj = markersDiscotheque;
			break;
		 case "L13":
			 markersMaj = markersCulte;
			 break;

		 //commerce et services
		 case "C01":
			 markersMaj = markersBoulangerie;
			 break;
		 case "C02":
			 markersMaj = markersSupermarche;
			 break;
		 case "C03":
			 markersMaj = markersCentreCom;
			 break;
		 case "C04":
			 markersMaj = markersBanque;
			 break;
		 case "C05":
			 markersMaj = markersStationServ;
			 break;
		 case "C06":
 			 markersMaj = markersPresse;
			 break;

		 //medical
		 case "M01":
			 markersMaj = markersPharma;
			 break;
		 case "M02":
			 markersMaj = markersMedecin;
			 break;
		 case "M03":
			 markersMaj = markersHopitaux;
			 break;
	 }
	 return markersMaj;
 }
  
 /**
  * Gestion de l'affichage des POI
  * passage de la catégorie souhaitée et si on souhaite afficher ou non les éléments
  */
 function doMajCatMobile(cat,visu)
 {
	if(visu=='false')
	 {
		 MajPoiCatMobile(cat,0);
	 }
	 else
	 {
		 defineMarkersCateg(cat);
		 MajPoiCatMobile(cat,1);
	 }
 }
 
 /**
  * pour gérer le masquage ou l'affichage des pois de l'ensemble de la catégorie
  */
 function MajPoiCatMobile(cat,action)
 {
	 var markersSsCatSelec;
	 var boolMarkersSsCatDispo;	
	 
	 switch(cat)
	 {
		 case "T":
			 markersSsCatSelec = ssCatTransport;
			 boolMarkersSsCatDispo = markersTransportDispo;
			 break;
		 case "E":
			 markersSsCatSelec = ssCatEnseignement;
			 boolMarkersSsCatDispo = markersEnseignementDispo;
			 break;
		 case "C":
			 markersSsCatSelec = ssCatCommerces;
			 boolMarkersSsCatDispo = markersCommercesDispo;
			 break;
		 case "M":
			 markersSsCatSelec = ssCatMedical;
			 boolMarkersSsCatDispo = markersMedicalDispo;
			 break;
		 case "L":
			 markersSsCatSelec = ssCatLoisirs;
			 boolMarkersSsCatDispo = markersLoisirsDispo;
			 break;
	 }
	 
	 var sscat;
	 for(var iter = 0; iter < markersSsCatSelec.length; iter++)
	 {
		 sscat = markersSsCatSelec[iter];
 
		 var markersMaj = defineMarkersMaj(sscat);
		 
		 if(action == 0)//hide
		 {
			 if(markersMaj != null && markersMaj.length > 0 )
			 {
				 for (var i = 0; i < markersMaj.length; i++) 
				 {
					 if(markersMaj[i].markerGoogle != null)
						 markersMaj[i].markerGoogle.setMap(null);
				 }
			 }
			 //suppression des POI pour le zoom auto
			 if(sscat in markersVisiblesBounds)
			 {
				 delete markersVisiblesBounds[sscat];
			 }
			 recalcBoundsMaj();
		 }
		 else
		 {
			 //seulement dans le cas ou les points ont déjà été recherchés.Car sinon l'ajout se fait directement 
			 // au niveau de defineMarkersCateg de la fonction doMajCatMobile
			 if(boolMarkersSsCatDispo == 1)
			 {
				 //show
				 if(markersMaj.length > 0 )
				 {
					 for (var i = 0; i < markersMaj.length; i++) 
					 {
						 if(markersMaj[i].markerGoogle != null)
							 markersMaj[i].markerGoogle.setMap(map);
					 }
				 }
				 //ajout des POI pour le zoom auto
				 if(sscat in markersVisiblesBounds == false)
				 {
					 markersVisiblesBounds[sscat] = markersMaj;
				 }

				 recalcBoundsMaj();
			 }
		 }	
	 }
 }
 
 /**
  * fonction de calcul automatique du zoom en fonction des points a afficher
  */
 function recalcBoundsMaj()
 {
	 //boucle pour faire le zoom auto par rapport aux POIs qu'on doit afficher
	 bounds = new google.maps.LatLngBounds();

	 var compteur=0;
	 for(var occ in markersVisiblesBounds)
	 {	
		 var occurence = markersVisiblesBounds[occ];
		 for(var iocc = 0; iocc < occurence.length; iocc++) 
		 {	
			 bounds.extend(occurence[iocc].markerGoogle.position);
			 compteur++;
		 }
	 }

	 // reprise des markers d'origine de la map : position bien + poi perso
	 for(var iocc2 = 0; iocc2 < markers.length; iocc2++) 
		 {	
			 bounds.extend(markers[iocc2].position);
			 compteur++;
		 }

		 map.fitBounds(bounds);

	 //si on n'a pas de POI, on reprend le zoom orginal
	 if(compteur <= 1)
	 {
		map.setZoom(originalZoom);
	 } 
 }

 /**
 * --------------------------------------------------------------------------------
 * --------------------------------------------------------------------------------
 * Fin Zone Immocot / Lecture automatique des points d'intérêts prédéfinis
 * --------------------------------------------------------------------------------
 * * ------------------------------------------------------------------------------
 */
