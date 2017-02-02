var currentWhisp = 0;

function whispPlayer(obj) {

    this.playing = false;

    var canvas, context, self, param, id;
    var x, y;
    var progress_width;
    var outer_width, outer_radius;
    var inner_width;
    var radius;
    var scrubber_width, scrubber_punto;
    var startAngle = -1.5,
        endAngle = -1.5;
    var sx, sy, arc, tmr, scrubber_text;
    var audioElement, duration, loaded, ended, mdown;

    this.init = function () {

        canvas = obj;
        context = canvas.getContext('2d');
        canvas.width = obj.offsetWidth;
        canvas.height = obj.offsetHeight;
        x = canvas.width / 2;
        y = canvas.height / 2;
        radius = x - (canvas.width / 10);
        progress_width = canvas.width / 80;
        outer_width = canvas.width / 30;
        outer_radius = radius + outer_width * 1.5;
        inner_width = canvas.width / 55;
        scrubber_width = canvas.width / 11;
        scrubber_punto = (canvas.width / 15).toString() + 'pt arial';
        duration = 0;
        loaded = false;
        self = this;
        ended = true;
        mdown = false;
        param = canvas.getAttribute('rel').toString().split('|');
        id = canvas.getAttribute('id').substr(5);
        currentWhisp = id;

        this.draw(true);

        audioElement = document.createElement('audio');
        audioElement.setAttribute('src', '//m.static.cdn.whispto.com/content/whisps/' + param[0] + '.mp3');
        audioElement.setAttribute('preload', 'none');

        audioElement.addEventListener("loadedmetadata", function (_event) {
            loaded = true;
        });

        audioElement.addEventListener("ended", function (_event) {
            ended = true;
            self.playing = false;
            self.pause();
        });

        canvas.onclick = function (e) {
            e = e || window.event;
            var pos = getMousePos(canvas, e);
            x1 = pos.x;
            y1 = pos.y;
            if (x1 >= canvas.width / 3 && x1 <= canvas.width / 1.42 && y1 >= canvas.width / 3.33 && y1 <= canvas.width / 1.42) {
                if (self.playing) {
                    self.pause();
                } else {
                    self.play();
                }
            } else if (self.playing) {
                arcVal = Math.atan2(y - y1, x - x1) * 180 / Math.PI;
                arcVal = 180 - arcVal;
                arcVal = arcVal < 90 ? 90 - arcVal : arcVal;
                arcVal = arcVal > 90 ? 90 + (360 - arcVal) : arcVal;
                arcVal = arcVal == 90 ? 0 : arcVal;
                endAngle = 6 / 360 * arcVal - 1.5;
                audioElement.currentTime = Math.round(param[1] / 360 * arcVal);
            }
        };

        canvas.onmousedown = function (e) {
            mdown = true;
        };

        canvas.onmouseup = function (e) {
            mdown = false;
        };

        canvas.onmousemove = function (e) {
            e = e || window.event;
            var pos = getMousePos(canvas, e);
            x1 = pos.x;
            y1 = pos.y;
            if ((x1 < canvas.width / 3 || x1 > canvas.width / 1.42 || y1 < canvas.width / 3.33 || y1 > canvas.width / 1.42) && self.playing && mdown) {
                arcVal = Math.atan2(y - y1, x - x1) * 180 / Math.PI;
                arcVal = 180 - arcVal;
                arcVal = arcVal < 90 ? 90 - arcVal : arcVal;
                arcVal = arcVal > 90 ? 90 + (360 - arcVal) : arcVal;
                arcVal = arcVal == 90 ? 0 : arcVal;
                endAngle = 6 / 360 * arcVal - 1.5;
                audioElement.currentTime = Math.round(param[1] / 360 * arcVal);
            }
        };

    };

    this.play = function () {

        if (ended) {
            startAngle = -1.5;
            endAngle = -1.5;
            ended = false;
            _gaq.push(['_trackEvent', 'UX', 'Whisp Play', id]);
            //if (window.console) console.log('Whisp Play:' + id);
        }

        currentWhisp = id;

        tmr = setInterval(function () {
            self.draw(false)
        }, param[1] * 1.5);

        audioElement.play();

        this.playing = true;

    };

    this.pause = function () {
        audioElement.pause();
        clearInterval(tmr);
        this.playing = false;
        context.clearRect(x - (radius / 2.5), y - (radius / 2), (radius / 1.2), radius);
        // play button
        context.fillStyle = "#" + param[2];
        context.beginPath();
        context.moveTo(x - (radius / 3), y - (radius / 2));
        context.lineTo(x + (radius / 2), y);
        context.lineTo(x - (radius / 3), y + (radius / 2));
        context.fill();

    };

    this.draw = function (preview) {

        if (!loaded && !preview) return;

        if (currentWhisp != id) {
            self.pause();
            return;
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        // inner circle
        context.beginPath();
        context.arc(x, y, radius - progress_width, 0, 2 * Math.PI, false);
        context.lineWidth = inner_width;
        context.strokeStyle = "#" + param[2];
        context.stroke();

        // outer circle
        context.beginPath();
        context.arc(x, y, outer_radius, 0, 2 * Math.PI, false);
        context.lineWidth = outer_width;
        context.strokeStyle = "#" + param[2];
        context.stroke();

        if (preview || ended) {
            // play button
            context.fillStyle = "#" + param[2];
            context.beginPath();
            context.moveTo(x - (radius / 3), y - (radius / 2));
            context.lineTo(x + (radius / 2), y);
            context.lineTo(x - (radius / 3), y + (radius / 2));
            context.fill();
        } else {
            // pause button
            context.beginPath();
            context.lineWidth = outer_width * 2;
            context.lineCap = 'square';
            context.moveTo(x - radius / 4, y - radius / 3);
            context.lineTo(x - radius / 4, y + radius / 3);
            context.moveTo(x + radius / 4, y - radius / 3);
            context.lineTo(x + radius / 4, y + radius / 3);
            context.stroke();
        }

        // progress
        endAngle += 0.01;
        if (endAngle > 4.5) endAngle = 4.5;

        context.beginPath();
        context.arc(x, y, radius, startAngle, endAngle, false);
        context.lineWidth = progress_width;
        context.lineCap = 'round';
        context.strokeStyle = "#" + param[2];
        context.stroke();

        // scrubber
        arc = endAngle * 240 / 4 + 90;
        sx = Math.sin(arc * Math.PI / 180) * radius + x - (scrubber_width / 9);
        sy = (Math.cos(arc * Math.PI / 180) * radius * -1) + y - (scrubber_width / 9);
        context.beginPath();
        context.arc(sx, sy, scrubber_width, 0, 2 * Math.PI, false);
        context.fillStyle = "#" + param[2];
        context.fill();
        context.font = scrubber_punto;
        context.textAlign = 'center';
        context.fillStyle = 'white';
        if (endAngle == -1.49) scrubber_text = param[1];
        else {
            curTime = Math.round(audioElement.currentTime);
            if (curTime > param[1]) curTime = param[1];
            scrubber_text = curTime;
        }
        context.fillText(scrubber_text, sx, sy + scrubber_width / 3);

    };

    function getMousePos(canvas, evt) {

        var rect = canvas.getBoundingClientRect();
        return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };

    }

}