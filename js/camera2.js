/* power and modify by huangxf */
var oriImg='';//存放原始图片base64
var canvas0 = document.createElement("canvas");//创建一个canvas压缩上传的原图
var canvas = document.getElementById("myCanvas");//用户缩放操作与合成的画布
var ctx=canvas.getContext("2d");
var canTouch = true;
var canvasStyleWidth = parseInt(canvas.width);
var scaleFactor = canvas.width / canvasStyleWidth;
var viewableArea = canvasStyleWidth * scaleFactor;
var currentSelection;
var relativeMouse;
var relativeTouch1;
var relativeTouch2;
var pointerOn = false;
var mouseDown = false;
var mouseMoving = false;
var touches = [];
var fingerSize = 24;
var touch = {
    touch1PosX: 0,
    touch1PosY: 0,
    touch2PosX: 0,
    touch2PosY: 0,
    initAngle: 0,
    angle: 0,
    angleChange: 0,
    initLength: 0,
    length: 0,
    fingerLength: 0,
    lengthChange: 0
};
var image1 = new Image();//上传的图
var image2 = new Image();//合成的图
image2.onload = function(){
     image2.xPos = canvas.width / 2;
     image2.yPos = canvas.height / 2;
     image2.initWidth = 300;
     image2.initHeight = 450;
     image2.currentWidth = 300;
     image2.currentHeight = 450;
     image2.initAngle = 0;
     image2.angle = 0;
     //update(image2);//缩放时在实时合成到最上层
};
image2.src='images/can.png';



function fileChange(e){
    var f = e.files[0];//一次只上传1个文件，其实可以上传多个的
    var FR = new FileReader();
    FR.onload = function(f){
    	compressImg(this.result,640);
    };
    FR.readAsDataURL(f);//先注册onload，再读取文件内容，否则读取内容是空的
}

function compressImg(imgData,maxWidth){//绘制上传的图片到画布并压缩原图可供保存
    if(!imgData)return;
    image1.onload = function(){
		//上传初始位于画布正中央
		image1.xPos = canvas.width / 2;//上传图中心点的x坐标
		image1.yPos = canvas.height / 2;//上传图中心点的y坐标
		image1.initWidth = image1.width;
		image1.initHeight = image1.height;
		//alert('原始图片宽高：'+image1.initWidth+' , '+image1.initHeight);//原始照片宽高
		image1.currentHeight = 450;
        image1.currentWidth = image1.initWidth / image1.initHeight * 450;
        if(image1.currentWidth<300){
            image1.currentWidth=300;
            image1.currentHeight=image1.initHeight/image1.initWidth*300;
        }
        // image1.currentWidth = scale(image1.initHeight, viewableArea, image1.initWidth);
		// image1.currentHeight = viewableArea;//上传图高度限制为画布高度
		// if (image1.currentWidth < viewableArea) {//如果宽度小于canvas可见宽度则等比缩放至宽度为画布可见宽度
		// 	image1.currentWidth = viewableArea;
		// 	image1.currentHeight = scale(image1.initWidth, viewableArea, image1.initHeight);
		// }
		//alert('最终绘制宽高：'+image1.currentWidth+' , '+image1.currentHeight);//最终绘制宽高
		image1.initAngle = 0;
		image1.angle = 0;
	    update(image1);
    };
    image1.src = imgData;
	//压缩原图
	var image0 = new Image();
	image0.onload = function () {
		canvas0.width=maxWidth;
        canvas0.height=canvas0.width*image0.height/image0.width;
		var ctx0=canvas0.getContext("2d");
		ctx0.drawImage(image0,0,0,image0.width,image0.height,0,0,canvas0.width,canvas0.height);
		oriImg=canvas0.toDataURL('image/jpeg',0.8);//原图统一宽度压缩后base64编码
    };
    image0.src = imgData;
}

function getCurrentSelection(position){//获取当前操作元素对象
    return image1;
	if(isSelect(position, image2))return image2;
    return image1;
}
function isSelect(position, image){//是否选择某对象
	//获取画布在文档中的位置以确定触摸点在画布中的坐标
	var canvasBox = canvas.getBoundingClientRect();
	var canvasXpos=canvasBox.left;
	var canvasYpos=canvasBox.top;
	//console.log(canvasXpos, canvasYpos);
	//$('#debug').html(position.clientX+' '+position.clientY+'<br>'+image.xPos+' '+image.yPos+'<br>'+image.initWidth+' '+image.initHeight);
	if(position.clientX-canvasXpos>(image.xPos - (image.currentWidth / 2)) && position.clientX-canvasXpos<(image.xPos + (image.currentWidth / 2)) && position.clientY-canvasYpos>(image.yPos - (image.currentHeight / 2)) && position.clientY-canvasYpos<(image.yPos + (image.currentHeight / 2)) ){
        return true;
    }else{
		return false;
	}
}

canvas.addEventListener("touchstart", function(event) {
    pointerStart(event);
});
canvas.addEventListener("touchmove", function(event) {
    pointerMove(event);
});
canvas.addEventListener("touchend", function(event) {
    pointerEnd(event);
});
canvas.addEventListener("touchcancel", function(event) {
    pointerEnd(event);
});

function scale(oldSize, newSize, other) {
    var scaleFactor = newSize / oldSize;
    return other * scaleFactor;
}

function pointerStart(event) {
    if(!canTouch) return;
    currentSelection=getCurrentSelection(event.touches[0]);
    var relativeTouch1;
    var relativeTouch2;

    // single touch
    if (event.touches !== undefined && event.touches.length === 1) {
        relativeTouch1 = getRelative(event.touches[0]);
        //position
        touch.touch1PosX = relativeTouch1.x;
        touch.touch1PosY = relativeTouch1.y;
        touch.offsetX = touch.touch1PosX - currentSelection.xPos;
        touch.offsetY = touch.touch1PosY - currentSelection.yPos;
    }
    // multi touch
    else if (event.touches !== undefined && event.touches.length > 1) {
        currentSelection.initAngle = currentSelection.angle;
        currentSelection.initWidth = currentSelection.currentWidth;
        currentSelection.initHeight = currentSelection.currentHeight;
        relativeTouch1 = getRelative(event.touches[0]);
        relativeTouch2 = getRelative(event.touches[1]);

        //position
        touch.touch1PosX = relativeTouch1.x;
        touch.touch1PosY = relativeTouch1.y;
        touch.touch2PosX = relativeTouch2.x;
        touch.touch2PosY = relativeTouch2.y;

        var mid = findMidPoint(relativeTouch1, relativeTouch2);
        touch.offsetX = mid.x - currentSelection.xPos;
        touch.offsetY = mid.y - currentSelection.yPos;

        //angle
        touch.initAngle = slopeAngle(relativeTouch1, relativeTouch2);
        touch.angle = slopeAngle(relativeTouch1, relativeTouch2);
        touch.angleChange = 0;
        //length
        touch.initLength = findLength(relativeTouch1, relativeTouch2);
        touch.lengthChange = 0;
    }
}

function pointerMove(event) {
    if(!canTouch) return;

    var relativeTouch1;
    var relativeTouch2;
    event.preventDefault();
    touches = event.touches;
    // single touch
    if (event.touches !== undefined && event.touches.length === 1) {
        relativeTouch1 = getRelative(event.touches[0]);
        //position
        touch.touch1PosX = relativeTouch1.x;
        touch.touch1PosY = relativeTouch1.y;
        relativeTouch1 = {
            x: touch.touch1PosX - touch.offsetX,
            y: touch.touch1PosY - touch.offsetY
        };
        moveImage(currentSelection, relativeTouch1);
    }
    // multi touch
    if (event.touches !== undefined && event.touches.length > 1) {
        relativeTouch1 = getRelative(event.touches[0]);
        relativeTouch2 = getRelative(event.touches[1]);

        //position
        touch.touch1PosX = relativeTouch1.x;
        touch.touch1PosY = relativeTouch1.y;
        touch.touch2PosX = relativeTouch2.x;
        touch.touch2PosY = relativeTouch2.y;
        //angle
        touch.angle = slopeAngle(relativeTouch1, relativeTouch2);
        touch.angleChange = touch.angle - touch.initAngle;

        //length
        touch.length = findLength(relativeTouch1, relativeTouch2);
        touch.lengthChange = touch.length - touch.initLength;

        relativeTouch1 = {
            x: touch.touch1PosX,
            y: touch.touch1PosY
        };
        relativeTouch2 = {
            x: touch.touch2PosX,
            y: touch.touch2PosY
        };
        var mid = findMidPoint(relativeTouch1, relativeTouch2);

        twoFingerRotate(currentSelection, mid);
        twoFingerResize(currentSelection, mid);
        mid.x -= touch.offsetX;
        mid.y -= touch.offsetY;
        moveImage(currentSelection, mid);
    }

    // Mouse
    if (mouseDown) {
        relativeMouse = {
            x: touch.touch1PosX - touch.offsetX,
            y: touch.touch1PosY - touch.offsetY
        };
        moveImage(currentSelection, relativeMouse);
    }
    update(currentSelection);
}

function pointerEnd(event) {
    if(!canTouch) return;

    currentSelection.initAngle = currentSelection.angle;
    currentSelection.initWidth = currentSelection.currentWidth;
    currentSelection.initHeight = currentSelection.currentHeight;

    //position
    //angle
    touch.angle = 0;
    touch.angleChange = 0;
    //length
    touch.length = 0;
    touch.lengthChange = 0;

    if (event !== undefined) {
        if (event.touches !== undefined && event.touches.length == 1) {
            relativeTouch1 = getRelative(event.touches[0]);
            touch.touch1PosX = relativeTouch1.x;
            touch.touch1PosY = relativeTouch1.y;
            touch.offsetX = touch.touch1PosX - currentSelection.xPos;
            touch.offsetY = touch.touch1PosY - currentSelection.yPos;
        }
    }
}

function moveImage(image, location) {
    if (isInsideImage(image, location)) {
        image.xPos = location.x;
        // image.yPos = location.y;
    }
}
function getRelative(position) {
    return {
        x: makeRelative(position).x,
        y: makeRelative(position).y
    };
}

function makeRelative(object) {
    var relativeCoords;
    //touch
    if (typeof object.clientX !== "undefined") {
        relativeCoords = {
            x: (object.clientX - canvas.getBoundingClientRect().left) * scaleFactor,
            y: (object.clientY - canvas.getBoundingClientRect().top) * scaleFactor
        };
        // mouse
    } else {
        relativeCoords = {
            x: (object.x - canvas.getBoundingClientRect().left) * scaleFactor,
            y: (object.y - canvas.getBoundingClientRect().top) * scaleFactor
        };
    }
    return relativeCoords;
}
function isInsideImage(image, pointer) {
    return isInside(image.xPos - image.currentWidth / 2, image.yPos - image.currentHeight / 2, image.currentWidth, image.currentHeight, pointer.x, pointer.y);
}

function isInside(x1, y1, width1, height1, x2, y2) {
    return x2 >= x1 &&
        x2 < x1 + width1 &&
        y2 >= y1 &&
        y2 < y1 + height1;
}

function drawRotatedImage(image) {
	$('#debug').html('');
	$('#debug').append('main x:'+parseInt(image1.xPos - (image1.currentWidth / 2))+',y:'+parseInt(image1.yPos - (image1.currentHeight / 2))+',w:'+image1.currentWidth+',h:'+image1.currentHeight);
	$('#debug').append('<br>');
	$('#debug').append('logo x:'+parseInt(image2.xPos - (image2.currentWidth / 2))+',y:'+parseInt(image2.yPos - (image2.currentHeight / 2))+',w:'+image2.currentWidth+',h:'+image2.currentHeight);

	//如果操作的是上层的LOGO图，先把下层的图画到画布上
    if(image==image2){
		ctx.save();//在save和restore间通过操作画布绘制当前操作元素当前状态到画布上，操作完画布恢复正常坐标
		ctx.translate(image1.xPos, image1.yPos);
		// ctx.rotate(image1.angle);
		ctx.translate(-image1.xPos, -image1.yPos);
		drawImageIOSFix(ctx,image1, 0, 0, image1.width, image1.height, (image1.xPos - (image1.currentWidth / 2)), (image1.yPos - (image1.currentHeight / 2)), image1.currentWidth, image1.currentHeight);
		ctx.restore();
    }

	//把当前操作的图画到画布上
    ctx.save();//在save和restore间通过操作画布绘制当前操作元素当前状态到画布上，操作完画布恢复正常坐标
    ctx.translate(image.xPos, image.yPos);
    // ctx.rotate(image.angle);
    ctx.translate(-image.xPos, -image.yPos);
    if(image==image1){
        if( (image.xPos - (image.currentWidth / 2))>0 ){
            finx = 0;
             image.xPos = image.currentWidth / 2;
        }else{
            finx = (image.xPos - (image.currentWidth / 2));
        }
        if( image.xPos - image.currentWidth / 2 < -(image.currentWidth-300) ){
            finx = -(image.currentWidth-300);
            image.xPos = image.currentWidth / 2-(image.currentWidth-300);
        }else{
            finx = (image.xPos - (image.currentWidth / 2));
        }
		drawImageIOSFix(ctx,image, 0, 0, image.width, image.height, finx, (image.yPos - (image.currentHeight / 2)), image.currentWidth, image.currentHeight);
    }else{
		ctx.drawImage(image, 0, 0, image.width, image.height, (image.xPos - (image.currentWidth / 2)), (image.yPos - (image.currentHeight / 2)), image.currentWidth, image.currentHeight);
    }
    ctx.restore();

	//如果操作的是下层的图，最后再把上层的LOGO图画到画布上
    if(image==image1){
		ctx.save();//在save和restore间通过操作画布绘制当前操作元素当前状态到画布上，操作完画布恢复正常坐标
		ctx.translate(image2.xPos, image2.yPos);
		// ctx.rotate(image2.angle);
		ctx.translate(-image2.xPos, -image2.yPos);
		ctx.drawImage(image2, 0, 0, image2.width, image2.height, image2.xPos - (image2.currentWidth / 2), image2.yPos - (image2.currentHeight / 2), image2.currentWidth, image2.currentHeight);
		//drawImageIOSFix(ctx,image2, 0, 0, image2.width, image2.height, image2.xPos - (image2.currentWidth / 2), image2.yPos - (image2.currentHeight / 2), image2.currentWidth, image2.currentHeight);
		ctx.restore();
    }

}


function findLength(start, end) {
    var a = end.x - start.x;
    var b = end.y - start.y;
    var csq = (a * a) + (b * b);
    return Math.floor(Math.sqrt(csq));
}

function findMidPoint(start, end) {
    return {
        x: (start.x + end.x) / 2,
        y: (start.y + end.y) / 2
    };
}

function slopeAngle(start, end) {
    var run = end.x - start.x;
    var rise = end.y - start.y;
    return Math.atan2(run, rise);
}


function resizeImage(image, newWidth) {
    var origHeight = image.currentHeight;
    var origWidth = image.currentWidth;

    if (newWidth < 100) {
        newWidth = 100;
    } else {
        newWidth = newWidth;
    }
    image.currentWidth = newWidth;
    image.currentHeight = (origHeight / origWidth) * newWidth;
}

function twoFingerResize(image, location) {
    if (isInsideImage(image, location)) {
        touch.lengthChange = touch.length - touch.initLength;
        resizeImage(image, image.initWidth + touch.lengthChange);
    }
}

function twoFingerRotate(image, location) {
    if (isInsideImage(image, location)) {
        image.angle = image.initAngle - touch.angleChange;
    }
}

function update(image) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);//操作前先清除画布，所以操作任一元素时所有元素都要按上下层关系先后绘制到画布里
    drawRotatedImage(image);
}

/*滤镜调整*/

var brighterMatrix =
[
1, 0, 0, 0, 30,
0, 1, 0, 0, 30,
0, 0, 1, 0, 30,
0, 0, 0, 1, 0,
];

var darkerMatrix =
[
1, 0, 0, 0, -30,
0, 1, 0, 0, -30,
0, 0, 1, 0, -30,
0, 0, 0, 1, 0,
];

var identityMatrix =
[
  1, 0, 0, 0, 0,
  0, 1, 0, 0, 0,
  0, 0, 1, 0, 0,
  0, 0, 0, 1, 0,
];

function loadColorMatrix(matrix){
  var imageData=ctx.getImageData(0, 0, canvas.width, canvas.height);
  ctx.putImageData(colorMatrixFilter(imageData,matrix),0,0);
}

function colorMatrixFilter(pixels, m) {
	var d = pixels.data;
	for (var i = 0; i < d.length; i += 4) {
	  var r = d[i];
	  var g = d[i + 1];
	  var b = d[i + 2];
	  var a = d[i + 3];

	  d[i]   = r * m[0] + g * m[1] + b * m[2] + a * m[3] + m[4];
	  d[i+1] = r * m[5] + g * m[6] + b * m[7] + a * m[8] + m[9];
	  d[i+2] = r * m[10]+ g * m[11]+ b * m[12]+ a * m[13]+ m[14];
	  d[i+3] = r * m[15]+ g * m[16]+ b * m[17]+ a * m[18]+ m[19];
	}
	return pixels;
};



/**
 * Detecting vertical squash in loaded image.
 * Fixes a bug which squash image vertically while drawing into canvas for some images.
 * This is a bug in iOS6 devices. This function from https://github.com/stomita/ios-imagefile-megapixel
 *
 */
function detectVerticalSquash(img) {
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = ih;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    var data = ctx.getImageData(0, 0, 1, ih).data;
    // search image edge pixel position in case it is squashed vertically.
    var sy = 0;
    var ey = ih;
    var py = ih;
    while (py > sy) {
        var alpha = data[(py - 1) * 4 + 3];
        if (alpha === 0) {
            ey = py;
        } else {
            sy = py;
        }
        py = (ey + sy) >> 1;
    }
    var ratio = (py / ih);
    return (ratio===0)?1:ratio;
}

/**
 * A replacement for context.drawImage
 * (args are for source and destination).
 */
function drawImageIOSFix(ctx, img, sx, sy, sw, sh, dx, dy, dw, dh) {
    var vertSquashRatio = detectVerticalSquash(img);
 // Works only if whole image is displayed:
 // ctx.drawImage(img, sx, sy, sw, sh, dx, dy, dw, dh / vertSquashRatio);
 // The following works correct also when only a part of the image is displayed:
    ctx.drawImage(img, sx * vertSquashRatio, sy * vertSquashRatio,
                       sw * vertSquashRatio, sh * vertSquashRatio,
                       dx, dy, dw, dh );
}