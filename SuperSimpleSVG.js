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

    draw(s){
        if(!s){
            s=this.svg;
        }
        if(s){

            var e = this.element ? this.element : document.createElementNS('http://www.w3.org/2000/svg',this.elementName);
            for(var i in this.attributes){
                e.setAttribute(i,this.attributes[i]);
            }
            if(this.svg){
                this.svg.append(e);
            }
            this.element = e;

            return this;
        }else{
            return this;
        }
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

class Path extends SVG{
    constructor(svg){
        super("path",svg);
    }

    setPath(p){
        this.setAttribute("d",p);
        return this;
    }
}

class Group extends SVG{
    constructor(svg){
        super("g",svg)
    }

    add(svgObject){
        $(this.element).append(svgObject.element);
        return this;
    }

    setPosition(x,y){
        this.setAttribute("transform","translate("+x+","+y+")");
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