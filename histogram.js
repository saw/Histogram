/*

Copyright (c) 2012,  Stephen Woods (http://github.com/saw)
All rights reserved.

(BSD Licence, see license.txt for details)
Usage: 

var h = new Histogram('http://farm8.staticflickr.com/7191/6907832697_d750e271ef.jpg', {height:50, width:255});

h.build(function(o){
	var histogramUrl = o.toDataURL();
});

note: width is ignored, currently it is always 255 pixels because I am too lazy to scale

*/

YUI.add('histogram', function (Y) {

	var DEFAULT_HEIGHT = 512,
		DEFAULT_WIDTH = 512,
		map = ['red','green','blue'];


	Histogram = function(url, config) {
		
		this.height = config.height || DEFAULT_HEIGHT;
		this.width  = config.width  || DEFAULT_WIDTH;
		this.url = url || 'bacon.jpg';
		console.log(this.height);
	}

	//build is async in case we need to fetch a file
	Histogram.prototype.build = function(callback){

		var canvas = document.createElement('canvas');
        ctx = canvas.getContext('2d'),
        img = new Image(),
        valHash = {
            red:[],
            blue:[],
            green:[]
        },
        url = this.url,
    	max = {red:0,green:0,blue:0},
    	that = this;



    	//when the image is ready...
    	img.onload = function(){
    		console.time('processing');
    		//draw it to the invisible canvas
	        ctx.drawImage(img, 0,0, img.height, img.width);

	        //get the data and start accumulating
	        var data = ctx.getImageData(0,0,img.width,img.height);
	        for (var i=1; i < img.height; i++) {
	            for (var j=0; j < img.width; j++) {
	                for (var k=0; k <= 2; k++) {
	                    var rVal = (data.data[((i*(data.width*4)) + (j*4)) + k]); //this is just getting the crap from the right offset
	                    if(!rVal){
	                        rVal = 0;  //should be a zero
	                    }
	                    if(valHash[map[k]][rVal]){
	                        valHash[map[k]][rVal] += 1;
	                    }else{
	                        valHash[map[k]][rVal] = 1;
	                    }
	                };
	            }
	        }

	        //need a new canvas to draw into
	        var c2 = document.createElement('canvas');
	        c2.height = that.height;
	        c2.width = 255;
	        ctx2 = c2.getContext('2d');
	        var holder;
	        
	        max = {red:0,green:0,blue:0};
	        var colorMap = {red:"255,0,0",green:"0,255,0",blue:"0,0,255"};
	        
	        for (var i=1; i < 255; i++) {
	            
	            for (var j=0; j < 3; j++) {
	                
	                if(valHash[map[j]][i] > max[map[j]]){
	                    max[map[j]] = valHash[map[j]][i];
	                }
	                
	            }
	        }
	        
	        for (var i=0; i < 255; i++) {
	            
	            for (var j=0; j < 3; j++) {
	                holder = valHash[map[j]][i]/max[map[j]];
	                  ctx2.fillStyle = "rgba("+colorMap[map[j]]+",0.5)";
	                  ctx2.fillRect(i,that.height, 1, -Math.round(holder * that.height));
	   
	            };
	        }
	        that.c2 = c2, that.canvas = canvas;
	        console.timeEnd('processing');
	        callback(that);
    	}

    	img.src = url;
    	
		
	}

	Histogram.prototype.toDataURI =  function(){
		// console.log(this);
		return this.c2.toDataURL();
	}





	Y.Histogram = Histogram;

});