$(function(){

  articles = $('article');
  window.allAnimations = {}

  // Get all phosphor animations
  $('article img[id^=anim_target_]').each(function(idx, it){
    myId = $(this).attr('id').replace('anim_target_','');
    myIdx = articles.index($(it).closest('article')[0])

    // Get the player
    player = new PhosphorCarouselItem(myId);

    // 
    allAnimations[myId] = {
      idx: myIdx,
      item: player
    }
  })
})

PhosphorCarouselItem = function( animationName ){
    /**
    * Instantiate the player.  The player supports a variate of callbacks for deeper integration into your site.
    */
    this.pp = new PhosphorPlayer('anim_target_' + animationName);

    // JSONP callback
    function callback(data,anim) {

      player = allAnimations[anim].item.pp
       framecount = data.frames.length;
       player.load_animation({
        imageArray:[anim + "_atlas000.jpg"],
        imagePath: "/images/work/",
        animationData: data,
        loop: true,
        onLoad: function() {
          if(allAnimations[anim].idx == 0)
            player.play();
        }
      });
    }

    var jsonpScript = document.createElement("script");
    jsonpScript.type = "text/javascript";
    jsonpScript.id = "jsonPinclude_" + animationName;
    jsonpScript.src = "javascripts/" + animationName + "_animationData.jsonp";
    document.getElementsByTagName("head")[0].appendChild(jsonpScript);
    window['phosphorCallback_'+animationName] = function(data){callback(data,animationName)};
}