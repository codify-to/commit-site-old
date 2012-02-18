var lucasdup = {
    initialize: function() {
        //Enable links
        $("nav a[href^='\\#']").click(lucasdup.menuClick);

        //get current area (from link or default)
        var url = document.location.href,
        initialArea = $("nav").attr("data-default");
        if (url.match('#')) {
            initialArea = url.split('#')[1].split('?')[0];
        }

        //Wait and load it
				if(initialArea)
        setTimeout(lucasdup.loadArea, 1000, initialArea);

        //animate menu
        $("#menu").css('opacity', 0);
        $("#menu").delay(1000).animate({
            opacity: 1
        },
        500);

    },

    //Handle menu clicks
    menuClick: function(event) {
        var item = event.target.href.split('#')[1];
        lucasdup.loadArea(item);
    },

    //Loads content
    loadingLock: false,

    loadArea: function(item) {
        if (lucasdup.loadingLock) return;
        lucasdup.loadingLock = true;

        lucasdup.bgLock = true;

        //fade current article and load next
        $("#content article").animate({
            opacity: 0.5
        },
        300, 'easeOutSine',
        function() {

            //Load next area
            $.get("works/" + item + ".html",
            function(result) {

                //Add to the page
                $("#content").append('<article></article>');
                $("#content article:last").html(result);

                //Animation...
                $("#content article:last").show('slide', {}, 500);
                $("#content article:first").hide('slide', {}, 500, function() {
                    $("#content article:first").remove();
                });

                //remove locks
                lucasdup.loadingLock = false;

            });

        });
    }
};

lucasdup.initialize();
