var Triangle = function(loc){
	
	MAX_DISTANCE = 300; //How far do I get from the origin
	WILL_STRENGTH = 0.3; //How independent I am
	
	this.loc = loc;
	this.vel = new toxi.Vec2D(0,0 );
	this.particleWill = toxi.Vec2D.randomVector().scale(WILL_STRENGTH);
	this.decay = 0.01;
	this.acc = new toxi.Vec2D(0, 0);
	this.dir = toxi.Vec2D.randomVector();
	this.heading = this.dir.heading();
	this.mass = 0.0001;
	
	
	var VERTEX_SPACING = 5;
	var p2 = {
		x: VERTEX_SPACING*2 + (Math.random() * VERTEX_SPACING),
		y: - (Math.random() * VERTEX_SPACING)
	};
	var p3 = {
		x: VERTEX_SPACING*2 + (Math.random() * VERTEX_SPACING),
		y: (Math.random() * VERTEX_SPACING)
	};
	
	this.draw = function(ctx, attractionCenter){
		/**
		 * Update
		 **/
		this.vel.addSelf(this.acc);
		this.loc.addSelf(this.vel);
		this.loc.addSelf(this.particleWill);
		this.vel.scaleSelf(1-this.decay);
		this.acc.set(0, 0);
		
		//Keep not to far from center
		this.attract(attractionCenter)
		
		//Change my will
		this.particleWill.rotate(Math.PI/100);

		//point particles to
		this.dir = this.loc.sub(attractionCenter);
		
		//Ease rotation
		// shortestRot = Math.atan2(Math.sin(this.dir.heading() - this.heading), Math.cos(this.dir.heading() - this.heading))
		//this.heading += (this.dir.heading() - this.heading) * 0.15;
		this.heading = this.dir.heading();
		
		/**
		 * Draw
		 **/
		ctx.beginPath();
		//Draw in the correct direction
		ctx.translate(this.loc.x, this.loc.y);
		ctx.rotate(this.heading);
		//DrawDriangle
		ctx.moveTo(0, 0);
		ctx.lineTo(p2.x, p2.y);
		ctx.lineTo(p3.x, p3.y);
		ctx.fill();
		//Rotate back
		ctx.rotate(-this.heading);
		ctx.translate(-this.loc.x, -this.loc.y);
		
		
	};
	
	this.attract = function( center ){
	    var dirToCenter   = this.loc.sub(center);
	    var distToCenter  = dirToCenter.magnitude();

	    if( distToCenter > MAX_DISTANCE ){
	        var pullStrength = 0.00004;
	        this.vel.subSelf(dirToCenter.normalize().scale((distToCenter - MAX_DISTANCE) *pullStrength));
	    }
	}
	
};


var Flocker = function(numParticles){
	
	//No canvas support
	if (!document.createElement('canvas').getContext) return;
	
	//Create the canvas
	$("body").prepend("<canvas width='" + $(document).width() + "' height='" + $(document).height() + "'></canvas>");
	
	//Particles list
	particles = [];
	//Canvas
	canvas = $("canvas")[0];
	//Canvas context
	context = canvas.getContext('2d');
	//particle attraction center
	attractionCenter = new toxi.Vec2D($(document).width()/2, $(document).height()/2);
	
	//initial fade
	particlesAlpha=0;
	
	$(window).resize(function(){
		$("canvas").width($(document).width()).height($(document).height());
	});
	//Attraction force center
	$(document).mousemove(function(e){
		attractionCenter = new toxi.Vec2D(e.pageX, e.pageY);
	})
	
	//Create particles
	for (var i=0; i < numParticles; i++) {
		particles.push(new Triangle(
			new toxi.Vec2D(Math.random()*$(document).width(), Math.random()*$(document).height())
		));
	}
	
        this.draw= function(){

		if(lucasdup.bgLock) return;
		
		zonesRadius = 600;
		sepZone = 0.6;
		
		if(particlesAlpha < 1) particlesAlpha += 0.005;
		
		/***
		 * Repulsion
		 **/
		var i, j, p1, p2, percent;
		for( var i=0; i < particles.length; ++i) {
			p1 = particles[i];
			for (j = i+1; j < particles.length; j++) {
				p2 = particles[j];
				
				dir = p1.loc.sub(p2.loc);
				distSqrd = dir.magSquared();
				
				//Check if these particles are close enough to attract/respuls
				if(distSqrd < zonesRadius){
					//How close?
					percent = distSqrd / zonesRadius;
					
					//Too close
					if (percent < sepZone) {
						//Separate
						F = ( sepZone/percent - 1 ) * 1;
						dir.normalize().scaleSelf(F);
						p1.acc.addSelf(dir);
						p2.acc.subSelf(dir);
					} else {
						//Attract
						sepInv = 1.0 - sepZone;
						adjustedPercent = ( percent - sepZone )/sepInv;
						F = ( 1.0 - ( Math.cos( adjustedPercent * Math.PI*2.0 ) * -0.5 + 0.5 ) ) * 0.04;
						dir = dir.normalize().scale(F);
						p1.acc.addSelf(dir);
						p2.acc.subSelf(dir);
					}
										
				}
			}
		}
		
		//Clear last frame
		context.clearRect(0, 0, canvas.width, canvas.height)
		
		//Setup Color
		context.fillStyle = "rgba(255, 255, 255, " + particlesAlpha + ")";
		
		//Draw each particle
		for (i=0; i < particles.length; i++) {
			
			//Colorful particle
			if(i >= particles.length-5)
				context.fillStyle = "rgba(253, 184, 19, " + particlesAlpha + ")";		
			//Draw
			particles[i].draw(context, attractionCenter);
			
		}
		
	}
	
};

var background;
$(function(){
	background = new Flocker(200);
	
	//Setup draw loop
	setInterval(background.draw, 1000/30);
});
