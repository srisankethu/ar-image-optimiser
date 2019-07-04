function strip_exif_metadata(buffer, format){

    var dataview = new DataView(buffer);
    var i = 0, offset = 0, recess = 0;
    var chunks = [];
    if (dataview.getUint16(offset) == 0xffd8){
        offset += 2;
        var uint16_value = dataview.getUint16(offset);
        offset += 2;
        while (offset < dataview.byteLength){
            if (uint16_value == 0xffe1){

                chunks[i] = {recess:recess,offset:offset-2};
                recess = offset + dataview.getUint16(offset);
                i++;
            }
            else if (uint16_value == 0xffda){
                break;
            }
            offset += dataview.getUint16(offset);
            var uint16_value = dataview.getUint16(offset);
            offset += 2;
        }
        if (chunks.length > 0){
            var new_buffer = [];
            chunks.forEach(function(v){
                new_buffer.push(buffer.slice(v.recess, v.offset));
            }, this);
            new_buffer.push(buffer.slice(recess));
            var blob = new Blob(new_buffer, {type: format});
        }
        return blob;
    }
}

function compress(img, quality, format, maxWidth){

    if (maxWidth === undefined){
      maxWidth = img.naturalWidth;
    }
    else{
      maxWidth = maxWidth || img.naturalWidth;
    }

    if(quality === undefined){
      quality = 75;
    }

    if(format === undefined){
      format = 'image/webp';
    }

    var width = img.naturalWidth;
    var height = img.naturalHeight;
    var aspect = height / width;
    if (width > maxWidth) {
        width = maxWidth;
        height = aspect * width;
    }

    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    var context = canvas.getContext("2d")
    context.drawImage(img, 0, 0, width, height);
    var buffer = context.getImageData(0, 0, width, height).data.buffer;
    var strip = strip_exif_metadata(buffer, format);
    if (strip !== undefined){
      context.drawImage(strip, 0, 0, width, height);
    }
    var image_data = canvas.toDataURL(format, quality/100);
    var compressed_img = new Image();
    compressed_img.src = image_data;
    return compressed_img;
}
