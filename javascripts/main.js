$(function(){
    //Arrow click (scroll to bottom)
    $(".arrow").click(function(){
        $('html, body').animate({
            scrollTop: $("#content").offset().top
        }, 1000)
    })
    
	//Check for canvas support
	if (!document.createElement('canvas').getContext) return;

	//Remove the fallback image and create the canvas =D
	$("#home .background").replaceWith("<canvas width='" + $(window).innerWidth() + "' height='" + $(window).innerHeight() + "'></canvas>");
	canvas = $("#home canvas")[0];
	 //Keep it the size of the screen
	 $(window).resize(function(){
	 	$("#home canvas").width($(window).innerWidth()).height($(window).innerHeight());
	 })

	var image, vertices=[];
	function doDelaunay(x, y){
		//Add to the list
		vertices.push({x: x, y: y});
		
		//Calculate delaunay
		var d = new Delaunay(canvas.width, canvas.height, vertices);
  		var triangles = d.split();
  		
  		//Get the drawing canvas
		ctx = canvas.getContext('2d');
		//Clear
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		//Draw the background image
		ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
		//Get the pixels we've just drawn
		region = ctx.getImageData(0, 0, canvas.width, canvas.height);

  		//Calculate average color and draw
  		var tri, box;
  		for(var i=0,n=triangles.length; i<n; i++){
  			tri = triangles[i];

  			//For this triangle, calculate the bounding box (performance)
  			box={x1:9999,y1:9999,x2:0,y2:0};
  			for (var j=0; j<3; j++) {
  				if(box.x1 > tri[j].x) box.x1 = tri[j].x;
  				if(box.y1 > tri[j].y) box.y1 = tri[j].y;
  				if(box.x2 < tri[j].x) box.x2 = tri[j].x;
  				if(box.y2 < tri[j].y) box.y2 = tri[j].y;
  			};
  			//Now that we have the bounding box, its time to loop through
  			//it and calculate the average color
  			box.w = box.x2-box.x1;
  			box.h = box.y2-box.y1;
  			initialOffset = (box.y1 * region.width + box.x1);
  			var r=0,g=0,b=0, color;
  			for(var h=0; h < box.h; h++){
  				for (var w = 0; w < box.w; w++) {
  				// 	color = region.data[w*region.height+h];
  				// 	r += (color & 0xff0000) >> 16;
						// g += (color & 0x00ff00) >> 8;
						// b += color & 0x0000ff;
						r += region.data[(initialOffset+(h*region.width+w))*4];
						g += region.data[(initialOffset+(h*region.width+w))*4+1];
						b += region.data[(initialOffset+(h*region.width+w))*4+2];
  				};
  			}
  			r /= box.w*box.h;
  			g /= box.w*box.h;
  			b /= box.w*box.h;
  			
  			//Draw the triangle
  			ctx.fillStyle = "rgba("+parseInt(r)+","+parseInt(g)+","+parseInt(b)+",0.8)";
  			ctx.beginPath();
    		ctx.moveTo(tri[0].x, tri[0].y);
			ctx.lineTo(tri[1].x, tri[1].y);
			ctx.lineTo(tri[2].x, tri[2].y);
			ctx.fill();
		}
	}
	function initializeDelaunay(){
		$(canvas).click(function(e){
			doDelaunay(e.pageX, e.pageY);
		});
		
		// Generate the first triangles (animation)
		setInterval(function(){
			if (vertices.length > 20) return

			var w = canvas.width/4;
			var h = canvas.height/4;
			doDelaunay(parseInt(w+Math.random()*w*2), parseInt(h+Math.random()*h*2));
		}, 250);
	}

	//Load background image
	(image = $("<img>").attr("src", "images/bg" + parseInt(Math.random()*7+1) +".jpg")).load(function(){
		initializeDelaunay();
	})
	image = image[0]
})
