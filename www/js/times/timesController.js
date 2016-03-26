angular.module('tramApp')

  .controller('TimesCtrl', ['TimesDataService', '$window', 'FavsService', function (TimesDataService, $window,FavsService) {

    var self = this;
    self.stops = [];

    self.title = "Tiempos tranvía";

    self.editing = false;

    self.stopFilter = {};
    self.stopData =
    {
      title: "Titulo"
    };


    self.tituloParada = "";

    self.selectedStopId = 101; //Id of selected stop
    self.selectedStop = {}; //Selected stop data (Is updated on every data update)


    /**
     * Toggles show mode betwen edit and view times
     */
    self.toggleShowMode = function(){

      if(!self.editing){
        self.editing = true;
        self.title = "Editar visibles";
      }
      else{
        self.editing = false;
        self.title = "Tiempos tranvía";
      }
    };

    /**
     * Toggle the fav state of a stop.
     * @param stop
       */
    self.toggleFav = function(stop){
      stop.fav = !stop.fav;
      FavsService.setFav(stop.id,stop.fav);
    };

    /**
     * Returns the  list of stops from DataService.
     */
    self.getStops = function () {
      return TimesDataService.data;
    };


    /**
     * Sets the current stop to "stop" oject, modifying "selectedStop" and "selectedStopId".
     * Also, updates the led.
     * @param stop
     */
    self.setCurrentStop = function (stop) {
      self.selectedStopId = stop.id;
      self.selectedStop = stop;
      self.updateLed(stop);
    };


    /**
     * Sets the current stop to "stop" with id "stopId", modifying "selectedStop" and "selectedStopId".
     * Also, updates the led.
     */
    self.setCurrentStopById = function (stopId) {
      self.selectedStopId = stopId;
      self.selectedStop = TimesDataService.getStopById(stopID);
      self.updateLed(stop);
    };


    /**
     * Updates the led with current data for the stop object "stop".
     */
    self.updateLed = function (stop) {
      var currentStop = stop;
      drawTitle(stop.title);
      drawDestination(currentStop.destinos);
      drawMessages(currentStop.mensajes);
    };


    TimesDataService.updateData()
      .then(function (data) {
        self.selectedStop = TimesDataService.getStopById(self.selectedStopId);
        self.updateLed(self.selectedStop);
      });


    TimesDataService.startAutoUpdate(30000, function () {
      //When data is updated -> update current Led.
      //Update selectedStop
      self.selectedStop = TimesDataService.getStopById(self.selectedStopId);
      self.updateLed(self.selectedStop);
    });


    /**
     * Draws destinations (up to 2)
     * @param destinosArray
     */
    var drawDestination = function (destinosArray) {
      if (destinosArray != undefined) {

        if (destinosArray.length > 0) {
          var dest = destinosArray[0];

          $('#firstDestination').changeText(dest.linea + " " + dest.destino, "" + dest.minutos);
          //$('#firstDestination').changeMinutes("" + dest.minutos);
        }
        if (destinosArray.length > 1) {
          var dest = destinosArray[1];
          $('#secondDestination').changeText(dest.linea + " " + dest.destino, "" + dest.minutos);
          //$('#secondDestination').changeMinutes("" + dest.minutos);
        }

      }
      else {
        $('#firstDestination').changeText("SIN DATOS");
        $('#secondDestination').changeText("SIN DATOS");
      }




    };


    var drawTitle = function(title){
      $('#stopTitle').changeText(title);
    };

    /**
     * Draws moving message.
     * @param messages
     */
    var drawMessages = function (messages) {


    };


    function min(a, b) {
      if (a < b) return a;
      return b;
    }

    console.log($window.innerWidth);
    var destinationOptions = {
      horizontalPixelsCount: min(120, Math.floor($window.innerWidth / 3.7)),
      verticalPixelsCount: 5,
      pixelSize: 1,
      disabledPixelColor: '#404040',
      enabledPixelColor: 'white',
      stepDelay: 50,
      fixed: true,
      runImmidiatly: true
    };

    $('#stopTitle').leddisplay($.extend(destinationOptions, {pixelSize: 3.5}));
    $('#stopTitle').changeText("SIN DATOS", 0);

    $('#firstDestination').leddisplay($.extend(destinationOptions, {pixelSize: 3.5}));
    $('#firstDestination').changeText("SIN DATOS", 0);
    $('#secondDestination').leddisplay($.extend(destinationOptions, {pixelSize: 3.5}));
    $('#secondDestination').changeText("SIN DATOS", 0);


  }]);

