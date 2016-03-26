angular.module('tramApp')
  .service('TimesDataService', ['$http', '$interval','FavsService', function ($http, $interval,FavsService) {


    var self = this;


    self.data = [];

    var timer = null;


    /**
     * Returns a stop from stored data by ID, or null if it is not found.
     */
    self.getStopById = function (id) {

      var found = false;
      var stop = null;
      for (var i = 0; i < self.data.length && !found; i++) {
        if (self.data[i].id == id) {
          found = true;
          stop = self.data[i];
        }
      }
      return stop;
    };


    function compareStops(a,b) {
      a = parseInt(a.id);
      b = parseInt(b.id);
      if (a < b)
        return -1;
      else if (a> b)
        return 1;
      else
        return 0;
    }


    /**
     * Retrieves data for all stops. Data is updated at server every 2 minutes.
     */
    self.updateData = function () {

      var savedStops = [];

      //Retrieve saved stops
      return $http.get("/data/stops.json")
        .then(function(response){

          savedStops = response.data;
          savedStops.sort(compareStops);

          //Retrieve real-time data
          return $http.get('http://www.zaragoza.es/api/recurso/urbanismo-infraestructuras/tranvia.json?srsname=utm30n');
        })
        .then(function success(response) {


          //For each retrieved stop, attach its data to the savedStops array

          //Sort alphabetically by title
          var retrievedData = response.data.result;
          retrievedData.sort(compareStops);



          for(var j = 0; j < savedStops.length; j++){
            var found = false;
            var i = 0;
            while(!found && i < retrievedData.length){

              if(savedStops[j].id == retrievedData[i].id){

                if(retrievedData[i].destinos && retrievedData[i].destinos[0].minutos == 0){
                  retrievedData[i].destinos[0].minutos = "<<";
                }

                if(retrievedData[i].destinos && retrievedData[i].destinos[0].destino.indexOf("ACADEMIA") > -1){
                  retrievedData[i].destinos[0].destino = "AVDA. ACADEMIA";
                }
                if(retrievedData[i].destinos && retrievedData[i].destinos[1].destino.indexOf("ACADEMIA") > -1){
                  retrievedData[i].destinos[1].destino = "AVDA. ACADEMIA";
                }

                savedStops[j].destinos = retrievedData[i].destinos;
                savedStops[j].mensajes = retrievedData[i].mensajes;


                found = true;
              }
              i++;
            }

            //Get Fav State
            savedStops[j].fav = FavsService.isFav(savedStops[j].id);
          }


          if(response.data.totalCount<=0){
            console.error("Totalcount returned by webservice is 0!");
          }

          self.data = savedStops;
          return savedStops;

        },function error(response){
          //Error retrieving data
          console.error("Error retrieving data: " + response);
          return null;
        });

    };


    /**
     * Starts a new auto update timer every msPeriod ms.
     * When msPeriod ms pass, data is updated and "periodicCallback" function is
     * called with data argument that is the list of stops or null if an error has ocurred.
     */
    self.startAutoUpdate = function (msPeriod, periodicCallback) {


      self.cancelAutoUpdate();

      timer = $interval(function () {

        self.updateData()
          .then(function (data) {
            periodicCallback(data);
          });

      }, msPeriod);


    };


    /**
     * Cancels an auto-update timer if exists.
     */
    self.cancelAutoUpdate = function () {
      if (timer != null) {
        $interval.cancel(timer);
      }
    };


    self.stopData = function (stopID) {

      return $http({
        method: 'GET',
        url: 'http://www.zaragoza.es/api/recurso/urbanismo-infraestructuras/tranvia/' + stopID + '.json?srsname=wgs84'
      }).then(function successCallback(response) {

        return response.data;
        /*return {
         "destinos":
         [
         {"linea":"L1","destino":"ACADEMIA","minutos":1},
         {"linea":"L1","destino":"ACADEMIA","minutos":12}
         ],
         "mensajes": ["Un mensaje jaja","Otro mensaje jeje"]
         }*/
      }, function errorCallback(response) {
        return null;
      });
    }


  }]);
