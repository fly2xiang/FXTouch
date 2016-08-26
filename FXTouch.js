
(function() {
    $.fn.getMatrix = function (n) {
        if (this.css("transform") === "none") return 0;
        var array = this.css("transform").split("(")[1].split(")")[0].split(",");
        return array[n] || array;
    };

    function FXTouch(node, options) {

        this.node = typeof node == 'object' ? node : document.querySelector(node);
        this.$node = $(node);

        this.options = {
            dragable : true,
            scalable : true,
            rotatable : true,
            opacity : true
        };

        if (typeof options == 'object') {
            for (var i in options) {
                if(options.hasOwnProperty(i)) {
                    this.options[i] = options[i];
                }
            }
        }

        this.supportsWebkit3dTransform = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix());
    }

    FXTouch.zIndexCount = 1;

    FXTouch.prototype.init = function () {

        this.rotation = 0;
        this.scale = 1.0;
        this.gesture = false;
        this.curX = 0;
        this.curY = 0;
        this.node.addEventListener('touchstart', this, false);
    };

    FXTouch.prototype.touchstart = function (e) {
        e.preventDefault();

        // this.node.style.zIndex = FXTouch.zIndexCount++;
        this.node.addEventListener('touchmove', this, false);
        this.node.addEventListener('touchend', this, false);
        this.node.addEventListener('touchcancel', this, false);

        if (this.options.opacity) {
            this.node.style.opacity = '0.5';
        }

        this.start0X = this.$node.getMatrix(4) - e.targetTouches[0].pageX;
        this.start0Y = this.$node.getMatrix(5) - e.targetTouches[0].pageY;
        if(!e.targetTouches[1]) return;
        this.start1X = this.$node.getMatrix(4) - e.targetTouches[1].pageX;
        this.start1Y = this.$node.getMatrix(5) - e.targetTouches[1].pageY;

        this.len = Math.sqrt(Math.pow(this.start1X - this.start0X, 2) + Math.pow(this.start1Y - this.start0Y, 2));
        this.angle = Math.atan((this.start1Y - this.start0Y) / (this.start1X - this.start0X)) / Math.PI * 180;
        if(this.start1X - this.start0X < 0 && this.angle < 0){
            this.angle += 180;
        }else if(this.start1X - this.start0X < 0 && this.angle > 0){
            this.angle += 180;
        }
        this.angle -= 180;
    };

    FXTouch.prototype.touchmove = function (e) {
        e.preventDefault();

        var myTransform = "",
            x1 = 0,
            y1 = 0,
            x2 = 0,
            y2 = 0;

        var touches = e.targetTouches;

        if ((touches.length === 1) && (this.options.dragable)) {

            this.curX = this.start0X + touches[0].pageX;
            this.curY = this.start0Y + touches[0].pageY;

            if (this.supportsWebkit3dTransform) {
                myTransform += 'translate3d(' + this.curX + 'px,' + this.curY + 'px, 0)';

            } else {
                myTransform += 'translate(' + this.curX + 'px,' + this.curY + 'px)';
            }

            if (this.options.scalable) {
                myTransform += "scale(" + (this.scale) + ")";
            }

            if (this.options.rotatable) {
                myTransform += "rotate(" + ((this.rotation) % 360) + "deg)";
            }
        }
        else if ((touches.length > 1) && ((this.options.scalable) || (this.options.rotatable))) {

            this.gesture = true;

            x1 = touches[0].pageX + this.start0X;
            y1 = touches[0].pageY + this.start0Y;
            x2 = touches[1].pageX + this.start1X;
            y2 = touches[1].pageY + this.start1Y;
            this.curX = (x1 + x2) / 2;
            this.curY = (y1 + y2) / 2;

            if (this.supportsWebkit3dTransform) {
                myTransform += 'translate3d(' + this.curX + 'px,' + this.curY + 'px, 0)';

            } else {
                myTransform += 'translate(' + this.curX + 'px,' + this.curY + 'px)';
            }


            len = Math.sqrt(Math.pow(touches[1].pageX - touches[0].pageX, 2) + Math.pow(touches[1].pageY - touches[0].pageY, 2));
            angle = Math.atan((touches[1].pageY - touches[0].pageY) / (touches[1].pageX - touches[0].pageX)) / Math.PI * 180;
            if(touches[1].pageX - touches[0].pageX < 0 && angle < 0){
                angle += 180;
            }else if(touches[1].pageX - touches[0].pageX < 0 && angle > 0){
                angle += 180;
            }
            e.scale = e.scale || (len / this.len);
            e.rotation = e.rotation || (angle - this.angle);

            if (this.options.scalable) {
                myTransform += "scale(" + (this.scale * e.scale) + ")";
            }

            if (this.options.rotatable) {
                myTransform += "rotate(" + ((this.rotation + e.rotation) % 360) + "deg)";
            }
        }

        this.node.style.webkitTransform = this.node.style.MozTransform = this.node.style.msTransform = this.node.style.OTransform = this.node.style.transform = myTransform;
    };

    FXTouch.prototype.touchend = function (e) {

        e.preventDefault();

        this.node.removeEventListener('touchmove', this, false);
        this.node.removeEventListener('touchend', this, false);
        this.node.removeEventListener('touchcancel', this, false);

        len = typeof len === 'undefined' ? 0 : len;
        angle = typeof angle === 'undefined' ? 0 : angle;
        e.scale = e.scale || (len / this.len);
        e.rotation = e.rotation || (angle - this.angle);

        if (this.gesture) {
            this.scale *= e.scale;
            this.rotation = (this.rotation + e.rotation) % 360;
            this.gesture = false;
        }

        if (this.options.opacity) {
            this.node.style.opacity = '1';
        }
    };

    FXTouch.prototype.touchcancel = function (e) {

        e.preventDefault();

        this.node.removeEventListener('touchmove', this, false);
        this.node.removeEventListener('touchend', this, false);
        this.node.removeEventListener('touchcancel', this, false);

        len = typeof len === 'undefined' ? 0 : len;
        angle = typeof angle === 'undefined' ? 0 : angle;
        e.scale = e.scale || (len / this.len);
        e.rotation = e.rotation || (angle - this.angle);

        if (this.gesture) {
            this.scale *= e.scale;
            this.rotation = (this.rotation + e.rotation) % 360;
            this.gesture = false;
        }

        if (this.options.opacity) {
            this.node.style.opacity = '1';
        }
    };

    FXTouch.prototype.handleEvent = function (e) {

        if (typeof(this[e.type]) === 'function' ) {
            return this[e.type](e);
        }
    };

    window.FXTouch = FXTouch;

})();