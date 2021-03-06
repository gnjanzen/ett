var edgeXdr = angular.module('ttt.edge.xdr', []);

edgeXdr.config(['$stateProvider',
	function($stateProvider) {
		$stateProvider.state('edge.xdr.main', {
				url: '',
				views: {
					"xdr": {
						templateUrl: 'edge/xdr/xdrMain.tpl.html'
					}
				}
			})
			.state('edge.xdr.description', {
				url: '/description/:id',
				views: {
					"xdr": {
						templateUrl: 'edge/xdr/description/xdrTestDescription.tpl.html'
					}
				}
			})
			.state('edge.xdr.logs', {
				url: '/logs',
				views: {
					"xdr": {
						templateUrl: 'edge/xdr/logs/xdrTestLog.tpl.html'
					}
				}
			});

	}
]);

edgeXdr.controller('XdrCtrl', ['$scope', 'XDRTestCasesDescription', 'growl', '$q', '$timeout', 'XDRTestCases', 'XDRRunTestCases', 'XDRCheckStatus', 'XDRTestCasesTemplate', '$state', '$window',
	function($scope, XDRTestCasesDescription, growl, $q, $timeout, XDRTestCases, XDRRunTestCases, XDRCheckStatus, XDRTestCasesTemplate, $state, $window) {

		$scope.senderTests = [];
		$scope.receiverTests = [];

		// Check type Edge or Hisp
		$scope.isEdge = $state.current.data.sutEge;
		if ($scope.isEdge) {
			$scope.testSystem = "edge";
		} else {
			$scope.testSystem = "hisp";
		}

		XDRTestCasesTemplate.getTestCasesDescription(function(response) {
			var result = response.data;

			angular.forEach(result, function(test) {
				if (!test.status) {
					test.status = 'na';
				} else if(test.status === 'configure') {
					$scope.configureXdr(test);
				}
				if ((test.sutEdge && $scope.isEdge) || (test.sutHisp && !$scope.isEdge)) {
					if (test.sutRole === 'sender') {
						$scope.senderTests.push(test);
					} else if (test.sutRole === 'receiver') {
						$scope.receiverTests.push(test);
					}
				}
			});

		});

		$scope.displayGrowl = function(text) {
			growl.success(text);
		};

		$scope.$watch('transactionType', function() {
			if ($scope.transactionType === 'sender') {
				$scope.testBench = $scope.senderTests;
				$scope.runText = 'Hit Run to generate your endpoint';
			} else {
				$scope.testBench = $scope.receiverTests;
				$scope.runText = 'Hit Run to send XDR message';
			}
		});

		$scope.displayLog = function(test) {
			$scope.logToDisplay = test;
		};

		$scope.reset = function(test) {
			if (!test.results.$resolved) {
				test.results.cancel();
			}
			test.status = 'na';
		};

		$scope.validateXdr = function(test, validation) {
			test.status = validation;
		};

		$scope.scrollTop = function() {
			$window.scrollTo(0, 0);
		};

		$scope.configureXdr = function(test) {
			test.status = "loading";
			var properties = {};
			XDRTestCases.configure({
				id: test.id
			}, function(data) {
				if(data.content) {
					test.endpoint = data.content.value.endpoint;
					test.endpointTLS = data.content.value.endpointTLS;
				}
				test.status = 'na';
			}, function(data) {
				test.status = 'error';
				if (data.data) {
					throw {
						code: data.data.code,
						url: data.data.url,
						message: data.data.message
					};
				}
			});
		};

		$scope.runXdr = function(test) {
			test.status = "loading";
			var properties = {};
			angular.forEach(test.inputs, function(property) {
				properties[property.key] = test[property.key];
			});
			test.results = XDRRunTestCases.run({
				id: test.id
			}, properties, function(data) {
				test.results = data;
				if (data.content !== null && data.content !== undefined) {
					if (data.content.criteriaMet.toLowerCase() === 'pending') {
						test.status = "pending";
						if(data.content) {
							test.endpoint = data.content.value.endpoint;
							test.endpointTLS = data.content.value.endpointTLS;
						}
					} else if (data.content.criteriaMet.toLowerCase() === 'manual') {
						test.status = "manual";
					} else if (data.content.criteriaMet.toLowerCase() === 'passed') {
						test.status = "success";
					} else {
						test.status = "error";
					}
				} else {
					if (data.status.toLowerCase() === 'passed') {
						test.status = "success";
					} else {
						test.status = "error";
						throw {
							code: '0x0020',
							url: 'xdr',
							message: data.message
						};
					}
				}
			}, function(data) {
				test.status = 'error';
				if (data.data) {
					throw {
						code: data.data.code,
						url: data.data.url,
						message: data.data.message
					};
				}
			});
		};

		$scope.checkXdrStatus = function(test) {
			test.status = "loading";
			test.results = XDRCheckStatus.checkStatus({
				id: test.id
			}, function(data) {
				test.results = data;
				if (data.content.criteriaMet.toLowerCase() === "passed") {
					test.status = "success";
				} else if (data.content.criteriaMet.toLowerCase() === "failed") {
					test.status = "error";
				} else if (data.content.criteriaMet.toLowerCase() === "pending") {
					test.status = "pending";
				} else if (data.content.criteriaMet.toLowerCase() === "manual") {
					test.status = "manual";
				} else {
					test.status = "error";
				}
			}, function(data) {
				test.status = "error";
				if (data.data) {
					throw {
						code: data.data.code,
						url: data.data.url,
						message: data.data.message
					};
				}
			});
		};

	}
]);
