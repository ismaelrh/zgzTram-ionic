angular.module('tramApp')

  .service('FavsService', ['$localstorage',function ($localstorage) {

    var self = this;

    //Default is true
    self.isFav = function(postId){
      var value = $localstorage.get("fav" + postId,true);
      if(value=="true"){
        return true;
      }
      else if(value=="false"){
        return false;
      }
      else{
        return true;
      }
    };

    self.setFav = function(postId,value){

      return $localstorage.set("fav" + postId,value);
    };

  }]);
