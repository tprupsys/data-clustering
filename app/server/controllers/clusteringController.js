'use strict';

var ClusteringController = (function() {

	var UKWClusteringService = require('../services/ukw/ukwClusteringService');
	var KMeansClusteringService = require('../services/kmeans/kMeansClusteringService');
	var Data = require('../dao/data');

	function ClusteringController() {
		var data = new Data().get();
		this.ukwClusteringService = new UKWClusteringService(data);
		this.kMeansClusteringService = new KMeansClusteringService(data);
	}

	ClusteringController.prototype = {
		processResponse: function(timeStarted, res, jsonResponse) {
			var timeCompleted = new Date();
			var timeSpent = timeCompleted.getTime() - timeStarted.getTime();
			jsonResponse.timeSpent = timeSpent;
			res.json(jsonResponse);
		},

		getClustersByUkw: function(req, res) {
			var a = req.query.a;
			var oE = req.query.oE;
			var oM = req.query.oM;
			var oC = req.query.oC;
			var oV = req.query.oV;
			var oS = req.query.oS;
			var k = req.query.k;

			var that = this;
			var timeStarted = new Date();
			this.ukwClusteringService.getClustersUsingUKWAlgorithm(a, oE, oM, oC, oV, oS, k, function(jsonResponse) {
				that.processResponse(timeStarted, res, jsonResponse);
			});
		},

		getClustersByKMeans: function(req, res) {
			var k = req.query.k;
			var maxIterations = req.query.maxIterations;

			var that = this;
			var timeStarted = new Date();
			this.kMeansClusteringService.getClustersUsingKMeansAlgorithm(k, maxIterations, function(jsonResponse) {
				that.processResponse(timeStarted, res, jsonResponse);
			});
		}
	}

	return ClusteringController;
}());

module.exports = ClusteringController;