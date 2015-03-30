(function () {
    'use strict';

    var GraphController = function($scope, $rootScope, GRAPH_SETTINGS, GRAPH_TYPES) {
        var that = this;

        that.scope = $scope;
        that.scope.width = GRAPH_SETTINGS.width;
        that.scope.height = GRAPH_SETTINGS.height;
        that.scope.GRAPH_TYPES = GRAPH_TYPES;

        that.pointSize = 3;
        that.xParticle = 1;
        that.yParticle = 1;
        this.paddingFromAxis = 10;

        that.paper = new Raphael(
                document.getElementById('canvasContainer'), 
                this.scope.width, 
                this.scope.height);

        that.scope.$watch(
            function() { return $rootScope.graphData; }, 
            function(newData, oldData) { that.drawNewGraph(newData); }, 
            true);

        return(that);
    };

    GraphController.prototype = {

        randomDarkColor: function() {
            var randomTwoLettersOfColor = function() {
                var randomHexNumber = Math.floor(Math.random() * 228).toString(16);
                return (randomHexNumber.length < 2 ? '0'.concat(randomHexNumber) : randomHexNumber);
            };

            return ('#' + randomTwoLettersOfColor() + randomTwoLettersOfColor() + randomTwoLettersOfColor());
        },

        calcLineLength: function(fromPoint, toPoint) {
            return Math.abs(fromPoint - toPoint);
        },

        drawByUkw: function(data, set) {
            // Drawing data points
            this.paper.setStart();
            
            angular.forEach(data.dataPoints, function(point) {
                this.paper.circle(
                    (point.x * this.xParticle) + this.paddingFromAxis, 
                    (point.y * this.yParticle) + this.paddingFromAxis, 
                    this.pointSize);
            }, this);

            set = this.paper.setFinish();
            set.attr({
                'fill': this.randomDarkColor(),
                'stroke-width': 0
            });

            // Drawing windows
            this.paper.setStart();

            angular.forEach(data.kWindows, function(kWindow) {
                this.paper.rect(
                    (kWindow.fromX * this.xParticle) + this.paddingFromAxis, 
                    (kWindow.fromY * this.yParticle) + this.paddingFromAxis, 
                    this.calcLineLength(kWindow.fromX, kWindow.toX) * this.xParticle,
                    this.calcLineLength(kWindow.fromY, kWindow.toY) * this.yParticle);
            }, this);

            set = this.paper.setFinish();
            set.attr({
                'stroke': this.randomDarkColor(),
                'stroke-width': 1
            });
        },

        drawByKMeans: function(data, set) {
            data.centroidsWithPoints.forEach(function(centroidsWithPoint) {
                var color = this.randomDarkColor();

                // Drawing centroid
                var centerPoint = centroidsWithPoint.centroid.centerPoint;                
                this.paper.setStart();
                this.paper.rect(
                    (centerPoint.x * this.xParticle) + this.paddingFromAxis,
                    (centerPoint.y * this.yParticle) + this.paddingFromAxis,
                    this.pointSize * 2,
                    this.pointSize * 2);
                set = this.paper.setFinish();
                set.attr({
                    'fill': color,
                    'stroke': color,
                    'stroke-width': 3,
                });

                // Drawing points around centroid
                this.paper.setStart();
                centroidsWithPoint.dataItems.forEach(function(dataItem) {
                    this.paper.circle(
                        (dataItem.x * this.xParticle) + this.paddingFromAxis, 
                        (dataItem.y * this.yParticle) + this.paddingFromAxis, 
                        this.pointSize);
                }, this);
                set = this.paper.setFinish();
                set.attr({
                    'fill': color,
                    'stroke': color,
                });
            }, this);
        },

    	drawNewGraph: function(graphData) {
            if (!graphData) {
                return;
            }            

            var data = graphData.data;

            this.paper.clear();
            var set = undefined;

            // Calculating max allowed size of one particle of the graph
            this.xParticle = (this.scope.width / this.calcLineLength(data.minX, data.maxX));
            this.yParticle = (this.scope.height / this.calcLineLength(data.minY, data.maxY));

            // Writing text of data
            var yCenter = parseInt(this.scope.height / 2);
            var xCenter = parseInt(this.scope.width / 2)

            var xLabel = data.xName + '  [' + data.minX + '..' + data.maxX + ']';
            var yLabel = data.yName + '  [' + data.minY + '..' + data.maxY + ']';

            this.paper.setStart();
            this.paper.text(this.paddingFromAxis, yCenter, yLabel).rotate(90, this.paddingFromAxis, yCenter);
            this.paper.text(xCenter, this.paddingFromAxis, xLabel);
            set = this.paper.setFinish();
            set.attr({
                fill: '#444444'
            });

            if (graphData.type === this.scope.GRAPH_TYPES['ukw']) {
                this.drawByUkw(data, set);
            } else if (graphData.type === this.scope.GRAPH_TYPES['kmeans']) {
                this.drawByKMeans(data, set);
            }
        }

    };

    angular
    	.module('graph.controller', [])
    	.controller('GraphController', GraphController);

})();