var Delaunay = function(width, height, points){
  this.rect = [
    {x : 0,     y: 0     },
    {x : width, y: 0     },
    {x : 0,     y: height},
    {x : width, y: height}
  ];
  this.points = points;
  this.triangles = [ // Initial square to divide
    [this.rect[0], this.rect[1], this.rect[2]],
    [this.rect[1], this.rect[2], this.rect[3]]
  ];
}

Delaunay.prototype = {

  split : function(){
    var triangles = this.triangles;
    for(var i=0, n=this.points.length; i<n; i++){
      var p = this.points[i];
      // Find the triangles we'll need to split
      var t = this._chooseTriangles(triangles, p);
  
      // and split them
      var poly = this.trisToPolygon(t.ok);

      // Converto to triangles again, based on this point of the diagram
      triangles = t.ng.concat(this.triangulate(poly, p));
    }
    //Remove tris whom touch edges
    var internalTris = [];
    for (var i = triangles.length - 1; i >= 0; i--) {
      var tri = triangles[i]
      touches = false;
      for (var j = tri.length - 1; j >= 0; j--) {
        p = tri[j]
        if (p.x == 0 || p.x == this.rect[3].x || p.x == this.rect[3].y ||
            p.y == 0 || p.y == this.rect[3].x || p.y == this.rect[3].y){
          touches = true;
          break;
        }
      };
      if (!touches) internalTris.push(tri);
    };
    return internalTris;
  },
  
  isInCircle : function(t, p){
    // Gets the triangle for this circle
    var circle = this.getCircumscribedCircle(t);
    // Get dot product of the difference between the circle and the point
    // to check if this point influences this triangle
    var dot = Math.pow((p.x - circle.o.x), 2) + Math.pow((p.y - circle.o.y), 2);
    return circle.r2 >= dot;
  },

  // 点pが外接円に含まれるような三角形を選ぶ
  _chooseTriangles : function(triangles, p){
    var ok = [];
    var ng = [];
    for(var i=0, n=triangles.length; i<n; i++){
      if(this.isInCircle(triangles[i], p)){
        ok.push(triangles[i]);
      }else{
        ng.push(triangles[i]);
      }
    }
    return {ok:ok, ng:ng};
  },

  // 三角形の集合から辺の集合へ
  _triangles2edges : function(triangles){
    var edges = [];
    for(var i=0,n=triangles.length; i<n; i++){
      var t = triangles[i];
      edges.push(
        [t[0], t[1]],
        [t[1], t[2]],
        [t[2], t[0]]
      );
    }
    return edges;
  },

  // Receives a list of triangles and return one polygin
  trisToPolygon : function(triangles){
    var polygon = [];
    // Convert to edges
    var edges = this._triangles2edges(triangles);
    var n = edges.length;
    for(var i=0; i<n-1; i++){
      var e1 = edges[i];
      if(e1.skip) continue;
      var found = false;
      for(var j=i+1; j<n; j++){
        var e2 = edges[j];
        if(
          (e1[0].x == e2[0].x && e1[0].y == e2[0].y && e1[1].x == e2[1].x && e1[1].y == e2[1].y) ||
          (e1[0].x == e2[1].x && e1[0].y == e2[1].y && e1[1].x == e2[0].x && e1[1].y == e2[0].y) 
        ){
          edges[j].skip = true;// it's inside
          found = true;
          break;
        }
      }
      found || polygon.push([e1[0], e1[1]]);
    }
    // skip?
    if(!edges[n-1].skip) polygon.push([edges[n-1][0], edges[n-1][1]]);
    return polygon;
  },

  // Gets a polygon and creates tris for each combination of vertices
  triangulate : function(polygon, p){
    var triangles = [];
    for(var i=0,n=polygon.length; i<n; i++){
      var edge = polygon[i];
      triangles.push([edge[0], edge[1], p]);
    }
    return triangles;
  },

  /*
    Gets the circle in which this triangle is circumscribed
    return {
      o : origin
      r2: radius squared
    }
  */
  getCircumscribedCircle : function(triangle){
    var px,py,qx,qy,rx,ry;
    var ax,ay,bx,by;
    var d,a,b,pl2,ql2,rl2,o,r2;
  
    px = triangle[0].x;
    py = triangle[0].y;
    qx = triangle[1].x;
    qy = triangle[1].y;
    rx = triangle[2].x;
    ry = triangle[2].y;
    
    ax = px - rx;
    ay = py - ry;
    bx = qx - rx;
    by = qy - ry;
    d = ax * by - ay * bx;
    if(d===0) return null;
  
    pl2 = px * px + py * py;
    ql2 = qx * qx + qy * qy;
    rl2 = rx * rx + ry * ry;
    a = pl2 - rl2;
    b = ql2 - rl2;
  
    o = {
      x : ( by * a - ay * b)/d/2,
      y : (-bx * a + ax * b)/d/2
    };

    r2 = Math.pow((o.x - triangle[2].x), 2) + Math.pow((o.y - triangle[2].y), 2);
    
    return {
      o  : o,
      r2 : r2
    };
  }
};