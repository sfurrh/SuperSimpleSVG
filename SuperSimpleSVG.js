/**
 * written by Sean Furrh
 */
class SVG{
    constructor(e,s){
        if(typeof(e)=="string"){
            this.elementName = e;
        }else{
            if(e){
                s = e;
            }
        }
        if(s){
            this.svg = s;
        }
        this.attributes={};
        this.element = document.createElementNS('http://www.w3.org/2000/svg',this.elementName);
    }

    _draw(s){
        if(!s){
            s=this.svg;
        }
        if(s){

            var e = this.element ? this.element : document.createElementNS('http://www.w3.org/2000/svg',this.elementName);
            for(var i in this.attributes){
                e.setAttribute(i,this.attributes[i]);
            }

            s.append(e);

            this.element = e;

            return this;
        }else{
            return this;
        }
    }

    draw(s){
        return this._draw(s);
    }


    getElement(){
        if(this.element){
            return this.element;
        }else{
            draw();
            return this.element;
        }
    }

    setAttributes(a){
        this.attributes = a;
        return this;
    }

    setAttribute(a,v){
        this.attributes[a]=v;
        return this;
    }

    getAttribute(a){
        return this.attributes[a];
    }

    setFill(color){
        this.setAttribute("fill",color);
        return this;
    }
    setStroke(width,color){
        this.setAttribute("stroke-width",width);
        this.setAttribute("stroke",color);
        return this;
    }

    /**
     * Utility  functions
     */
     getPoint(radius, angle, origin, label){
          var rads = (angle - 90) * Math.PI / 180.0;
          var x = (radius * Math.cos(rads)) + origin.x;
          var y = (radius * Math.sin(rads)) + origin.y;

          return {x:x,y:y};
     }
}
class Group extends SVG{
    constructor(svg){
        super("g",svg);
    }

    add(svgObject){
        var elem = $(this.getElement());
        elem.append(svgObject.element?svgObject.element:svgObject.draw(elem).getElement());
        return this;
    }

    setPosition(x,y){
        this.setAttribute("transform","translate("+x+","+y+")");
        return this;
    }
}
class Text extends SVG{
    constructor(svg,x,y,text){
        super("text",svg);
        this.setAttribute("x",x);
        this.setAttribute("y",y);
        this.text=text;
    }

    draw(s){
        $(this._draw(s).getElement()).text(this.text);
    }
}
class Line extends SVG{
    constructor(svg){
        super("line",svg);
    }
    setStart(x,y){
        this.setAttribute("x1",x);
        this.setAttribute("y1",y);
        return this;
    }
    setEnd(x,y){
        this.setAttribute("x2",x);
        this.setAttribute("y2",y);
        return this;
    }
}
class Polygon extends SVG{
    constructor(svg){
        super("polygon",svg);
        this.points = [];
    }

    addPoint(x,y){
        this.points.push([x,y]);
        this.serializePoints();
        return this;
    }

    setPoints(arr){
        this.points = arr;
        this.serializePoints();
        return this;
    }

    serializePoints(){
        var pointString = "";
        var arr = this.points;
        for(var i=0;i<arr.length;i++){
            var p = arr[i];
            var ps = arr.join(",");
            if(i>0){
                pointString+=" ";
            }
            pointString+=ps;
        }
        this.setAttribute("points",pointString);
    }
}
class Circle extends SVG{
    constructor(svg){
        super("circle",svg);
    }
    setCenter(cx,cy){
        this.setAttribute("cx",cx);
        this.setAttribute("cy",cy);
        return this;
    }
    setWidth(w){
        this.setAttribute("r",w/2);
        return this;
    }
}

class Point extends Circle{
    constructor(svg){
        super(svg);
        this.setSize(2);
        this.setStroke(0);
    }
    setColor(color){
        this.setFill(color);
        return this;
    }
    setSize(size){
        this.setWidth(size);
        return this;
    }

}
class Rectangle extends SVG{
    constructor(svg){
        super("rect",svg);
    }
    setTopLeft(x,y){
        this.setAttribute("x",x);
        this.setAttribute("y",y);
        return this;
    }
    setWidth(w){
        this.setAttribute("width",w);
        return this;
    }
    setHeight(h){
        this.setAttribute("height",h);
        return this;
    }
}
class Rectangle3D extends Group{
    constructor(svg){
        super(svg);
        this.depth = 10;
    }
    setTopLeft(x,y){
        this.setAttribute("x",x);
        this.setAttribute("y",y);
        return this;
    }
    setWidth(w){
        this.setAttribute("width",w);
        return this;
    }
    setHeight(h){
        this.setAttribute("height",h);
        return this;
    }

    draw(s){
        var x = this.getAttribute("x");
        var y = this.getAttribute("y");
        var w = this.getAttribute("width");
        var h = this.getAttribute("height");
        var f = this.getAttribute("fill");
        var sw = this.getAttribute("stroke-width");
        var sc = this.getAttribute("stroke");
        var e = $(this._draw(s).getElement());

        var topPoly = new Polygon(e);
        var p = topPoly.getPoint(this.depth,213,{x:x,y:y});
        topPoly.setPoints([[x,y],[p.x,p.y],[p.x+w,p.y],[x+w,y]]).setStroke(sc,sw).setFill(f).draw(e);
        var rightPoly = (new Polygon(e)).setPoints([[p.x+w,p.y],[x+w,y],[x+w,y+h],[p.x+w,p.y+h]]).setStroke(sc,sw).setFill(f).draw(e);
        var rect = (new Rectangle(e)).setTopLeft(p.x,p.y).setWidth(w).setHeight(h).setStroke(sc,sw).setFill(f).draw(e);
    }

}
class Path extends SVG{
    constructor(svg){
        super("path",svg);
    }

    setPath(p){
        this.setAttribute("d",p);
        return this;
    }
}




class Pie extends Path{
    /**
     * c is an object that contains the properties of the circle: center x, center y, and radius.
     * for example: {x:100,y:100,radius:20}
     */
    constructor(svg,c,percent,startPercent){
        super(svg);

        if(startPercent === undefined){
            startPercent = 0;
        }

        var circleCenter = {x:c.x,y:c.y};
        var startPoint = startPercent ? getPoint(c.radius,startPercent * 360,circleCenter) : {x:c.x,y:c.y - c.radius};

        var angle = (startPercent+percent) * 360;
        var arcPoint = getPoint(c.radius,angle,circleCenter);

        var sweep = 0;
        if(percent>50){
            sweep = 1;
        }
        console.log("sweep: "+sweep);

        var path = "M "+startPoint.x+" "+startPoint.y+" A "+c.radius+" "+c.radius+", 0, "+sweep+", 1, "+arcPoint.x+" "+arcPoint.y+" L "+c.x+" "+c.y;

        this.setPath(path)
    }
}

class Grid extends SVG{
    constructor(s,size){
        super(s);

        var hsize = $(s).width();
        var vsize = $(s).height();

        var group = new Group(s);
        var e = group.draw().getElement();
        for(var i=size;i<=hsize;i+=size){
            var line = new Line();
            line.setStart(i,0).setEnd(i,vsize).setStroke(1,"#ccc").draw(e);
        }
        for(var i=size;i<=vsize;i+=size){
            var line = new Line();
            line.setStart(0,i).setEnd(hsize,i).setStroke(1,"#ccc").draw(e);
        }
        console.dir(group);
    }
}