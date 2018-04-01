/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/// <reference types='../typings/three' /> 

Object.defineProperty(exports, "__esModule", { value: true });
var engine_1 = __webpack_require__(1);
var init = function init() {
    var engine = new engine_1.Engine();
};
window.onload = init;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });

var Engine = function () {
    function Engine() {
        _classCallCheck(this, Engine);

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        // Physics parameters.
        this.K = 0.03; // "Hooke's constant"
        this.D = 0.025; // Dampening Factor
        this.S = 0.0005; // Wave spread.
        this.BACK_PROPAGATIONS = 4;
        this.TERMINAL_VELOCITY = 1.5;
        this.ROWS = 50;
        this.COLUMNS = 50;
        this.PLANE_WIDTH = 100;
        this.PLANE_HEIGHT = 100;
        this.CELL_HEIGHT = this.PLANE_HEIGHT / this.ROWS;
        this.CELL_WIDTH = this.PLANE_WIDTH / this.COLUMNS;
        // Key press to trigger a simulation cycle.
        this.ITERATION_TRIGGER_KEY = 'x';
        this.AUTOMATIC_TRIGGER_KEY = 'y';
        this.RANDOM_WALK_TRIGGER_KEY = 'z';
        // Instance Scene.
        this.scene = new THREE.Scene();
        // Instantiate Camera.
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
        this.camera.position.set(0, -70, 50);
        // Instantiate render.
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0xfff6e6);
        this.renderer.setSize(this.width, this.height);
        document.body.appendChild(this.renderer.domElement);
        // Instantiate controls.
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        // Instantiate raycaster.
        this.raycaster = new THREE.Raycaster();
        var geometry = new THREE.PlaneGeometry(this.PLANE_WIDTH, this.PLANE_HEIGHT, this.ROWS, this.COLUMNS);
        var material = new THREE.MeshPhongMaterial({
            color: 0x00EEEE,
            flatShading: true,
            shininess: 5
        });
        var plane = new THREE.Mesh(geometry, material);
        plane.position.z = 20;
        this.planeUUID = plane.uuid;
        this.geometry = plane.geometry;
        this.scene.add(plane);
        var axes = new THREE.AxisHelper(100);
        this.scene.add(axes);
        this.animate();
        this.addEventListeners();
        this.initializeHeightMap();
        this.initializeRandomHeight();
        this.renderer.gammaInput = true;
        this.renderer.gammaOutput = true;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.renderReverseSided = false;
        // Hemisphere Light
        var hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.6);
        hemiLight.groundColor.setHSL(0.1, 0.2, 0.2);
        this.scene.add(hemiLight);
        // // Directional Light
        var d = 50;
        var dirLight = new THREE.DirectionalLight(0x000000, 0.5);
        dirLight.color.setHSL(0.1, 1, 0.95);
        dirLight.position.set(-1, 1.75, 1);
        dirLight.position.multiplyScalar(30);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.left = -d;
        dirLight.shadow.camera.right = d;
        dirLight.shadow.camera.top = d;
        dirLight.shadow.camera.bottom = -d;
        dirLight.shadow.camera.far = 3500;
        dirLight.shadow.bias = -0.0001;
        this.scene.add(dirLight);
    }

    _createClass(Engine, [{
        key: "iterate",
        value: function iterate() {
            var heightMap = this.heightMap;
            var velocityMap = this.velocityMap;
            for (var i = 0; i < heightMap.length; i++) {
                var rowHeight = heightMap[i];
                var rowVelocity = velocityMap[i];
                for (var j = 0; j < rowHeight.length; j++) {
                    var velocity = rowVelocity[j];
                    rowHeight[j] += velocity;
                    var targetHeight = 0;
                    var height = rowHeight[j];
                    var x = height - targetHeight;
                    var acceleration = -1 * this.K * x - this.D * velocity;
                    rowVelocity[j] += this.roundDecimal(acceleration);
                    rowVelocity[j] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(rowVelocity[j]));
                    var verticeIndex = this.getVerticeIndex(i, j);
                    this.updateGeometry(verticeIndex, height);
                }
            }
            var leftDelta = new Array(this.ROWS + 1);
            var rightDelta = new Array(this.ROWS + 1);
            for (var _i = 0; _i < this.ROWS + 1; _i++) {
                leftDelta[_i] = new Array(this.COLUMNS + 1).fill(0);
                rightDelta[_i] = new Array(this.COLUMNS + 1).fill(0);
            }
            for (var l = 0; l < this.BACK_PROPAGATIONS; l++) {
                for (var _i2 = 0; _i2 < heightMap.length; _i2++) {
                    var _rowHeight = heightMap[_i2];
                    var _rowVelocity = velocityMap[_i2];
                    for (var _j = 1; _j < _rowHeight.length; _j++) {
                        leftDelta[_i2][_j] = this.roundDecimal(this.S * (_rowHeight[_j] - _rowHeight[_j - 1]));
                        _rowVelocity[_j] += leftDelta[_i2][_j];
                        if (_rowVelocity[_j] < 0) {
                            _rowVelocity[_j] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(_rowVelocity[_j]));
                        } else if (_rowVelocity[_j] > 0) {
                            _rowVelocity[_j] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(_rowVelocity[_j]));
                        }
                    }
                    for (var _j2 = 0; _j2 < _rowHeight.length - 1; _j2++) {
                        rightDelta[_i2][_j2] = this.roundDecimal(this.S * (_rowHeight[_j2] - _rowHeight[_j2 + 1]));
                        _rowVelocity[_j2] += rightDelta[_i2][_j2];
                        if (_rowVelocity[_j2] < 0) {
                            _rowVelocity[_j2] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(_rowVelocity[_j2]));
                        } else if (_rowVelocity[_j2] > 0) {
                            _rowVelocity[_j2] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(_rowVelocity[_j2]));
                        }
                    }
                }
                for (var _i3 = 0; _i3 < heightMap.length; _i3++) {
                    var _rowHeight2 = heightMap[_i3];
                    for (var _j3 = 1; _j3 < _rowHeight2.length; _j3++) {
                        heightMap[_i3][_j3 - 1] += leftDelta[_i3][_j3];
                    }
                    for (var _j4 = 0; _j4 < _rowHeight2.length - 1; _j4++) {
                        heightMap[_i3][_j4 + 1] += rightDelta[_i3][_j4];
                    }
                }
            }
            var topDelta = new Array(this.COLUMNS + 1);
            var bottomDelta = new Array(this.COLUMNS + 1);
            for (var _i4 = 0; _i4 < this.COLUMNS + 1; _i4++) {
                topDelta[_i4] = new Array(this.ROWS + 1).fill(0);
                bottomDelta[_i4] = new Array(this.ROWS + 1).fill(0);
            }
            for (var _l = 0; _l < this.BACK_PROPAGATIONS; _l++) {
                for (var _j5 = 0; _j5 < heightMap[0].length; _j5++) {
                    for (var _i5 = 1; _i5 < heightMap.length; _i5++) {
                        topDelta[_i5][_j5] = this.roundDecimal(this.S * (heightMap[_i5][_j5] - heightMap[_i5 - 1][_j5]));
                        velocityMap[_i5][_j5] += topDelta[_i5][_j5];
                        if (velocityMap[_i5][_j5] < 0) {
                            velocityMap[_i5][_j5] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[_i5][_j5]));
                        } else if (velocityMap[_i5][_j5] > 0) {
                            velocityMap[_i5][_j5] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[_i5][_j5]));
                        }
                    }
                    for (var _i6 = 0; _i6 < heightMap.length - 1; _i6++) {
                        bottomDelta[_i6][_j5] = this.S * (heightMap[_i6][_j5] - heightMap[_i6 + 1][_j5]);
                        velocityMap[_i6][_j5] += bottomDelta[_i6][_j5];
                        if (velocityMap[_i6][_j5] < 0) {
                            velocityMap[_i6][_j5] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[_i6][_j5]));
                        } else if (velocityMap[_i6][_j5] > 0) {
                            velocityMap[_i6][_j5] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[_i6][_j5]));
                        }
                    }
                }
            }
            this.refreshGeometry();
        }
        /** Return -1, 0, 1 */

    }, {
        key: "getRandomDirection",
        value: function getRandomDirection() {
            return Math.floor(3 * Math.random()) - 1;
        }
    }, {
        key: "roundDecimal",
        value: function roundDecimal(num) {
            return Math.round(num * 10000) / 10000;
        }
    }, {
        key: "initializeHeightMap",
        value: function initializeHeightMap() {
            var heightMap = new Array(this.ROWS + 1);
            for (var i = 0; i < heightMap.length; i++) {
                heightMap[i] = new Array(this.COLUMNS + 1).fill(0);
            }
            this.heightMap = heightMap;
            var velocityMap = new Array(this.ROWS + 1);
            for (var _i7 = 0; _i7 < velocityMap.length; _i7++) {
                velocityMap[_i7] = new Array(this.COLUMNS + 1).fill(0);
            }
            this.velocityMap = velocityMap;
        }
    }, {
        key: "initializeRandomHeight",
        value: function initializeRandomHeight() {
            var heightMap = this.heightMap;
            // Seed the first cell.
            heightMap[0][0] = Math.floor(5 * Math.random()) * this.getRandomDirection();
            // Random walk along first row.
            for (var j = 1; j < this.COLUMNS + 1; j++) {
                var prev = heightMap[0][j - 1];
                var height = prev + this.getRandomDirection();
                heightMap[0][j] = height;
            }
            // Random walk along first column.
            for (var i = 1; i < this.ROWS + 1; i++) {
                var _prev = heightMap[i - 1][0];
                var _height = _prev + this.getRandomDirection();
                heightMap[i][0] = _height;
            }
            // Loop over inner rows, assigning height as +-1 from midpoint of top and left neighbor
            for (var _j6 = 1; _j6 < this.COLUMNS + 1; _j6++) {
                for (var _i8 = 1; _i8 < this.ROWS + 1; _i8++) {
                    var topNeighbor = heightMap[_i8 - 1][_j6];
                    var leftNeighbor = heightMap[_i8][_j6 - 1];
                    var midpoint = (topNeighbor + leftNeighbor) / 2;
                    heightMap[_i8][_j6] = Math.round(midpoint) + this.getRandomDirection();
                }
            }
            // Map heightMap to geometry
            for (var _i9 = 0; _i9 < heightMap.length; _i9++) {
                var row = heightMap[_i9];
                for (var _j7 = 0; _j7 < row.length; _j7++) {
                    var _height2 = row[_j7];
                    var verticeIndex = this.getVerticeIndex(_i9, _j7);
                    this.updateGeometry(verticeIndex, _height2);
                }
            }
            this.refreshGeometry();
        }
    }, {
        key: "animate",
        value: function animate() {
            var _this = this;

            requestAnimationFrame(function () {
                _this.animate();
            });
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        }
    }, {
        key: "updateGeometry",
        value: function updateGeometry(verticeIndex, height) {
            if (height != undefined && height != null) {
                this.geometry.vertices[verticeIndex].z = height;
            } else {
                this.geometry.vertices[verticeIndex].z++;
            }
        }
    }, {
        key: "refreshGeometry",
        value: function refreshGeometry() {
            this.geometry.verticesNeedUpdate = true;
        }
    }, {
        key: "addEventListeners",
        value: function addEventListeners() {
            var _this2 = this;

            window.addEventListener('mouseup', function (e) {
                _this2.handleClick(e);
            }, false);
            window.addEventListener('keyup', function (e) {
                _this2.handleKeyUp(e);
            }, false);
        }
    }, {
        key: "handleKeyUp",
        value: function handleKeyUp(event) {
            var _this3 = this;

            var key = event.key;

            if (key.toLowerCase() == this.ITERATION_TRIGGER_KEY) {
                this.iterate();
            }
            if (key.toLowerCase() == this.AUTOMATIC_TRIGGER_KEY) {
                setInterval(function () {
                    _this3.iterate();
                }, 100);
            }
            if (key.toLowerCase() == this.RANDOM_WALK_TRIGGER_KEY) {
                this.initializeRandomHeight();
            }
        }
    }, {
        key: "handleClick",
        value: function handleClick(event) {
            var _this4 = this;

            // calculate mouse position in normalized device coordinates
            // (-1 to +1) for both components
            var x = event.clientX / window.innerWidth * 2 - 1;
            var y = -(event.clientY / window.innerHeight) * 2 + 1;
            var mouse = { x: x, y: y };
            this.raycaster.setFromCamera(mouse, this.camera);
            var intersects = this.raycaster.intersectObjects(this.scene.children);
            var planeIntersect = intersects.find(function (intersect) {
                return intersect.object.uuid === _this4.planeUUID;
            });
            if (planeIntersect) {
                var _planeIntersect$point = planeIntersect.point,
                    _x = _planeIntersect$point.x,
                    _y = _planeIntersect$point.y;
                // These are sequenced to match the vertices indexing.

                var columnIndex = Math.round(_x / this.CELL_WIDTH) + this.COLUMNS / 2;
                var rowIndex = -1 * Math.round(_y / this.CELL_HEIGHT) + this.ROWS / 2;
                var points = this.getRasterizedCircle({ x: rowIndex, y: columnIndex });
                points.filter(function (_ref) {
                    var x = _ref.x,
                        y = _ref.y;
                    return x >= 0 && x < _this4.COLUMNS && y >= 0 && y <= _this4.ROWS;
                }).forEach(function (point) {
                    _this4.heightMap[point.x][point.y] = point.z;
                });
                this.refreshGeometry();
            }
        }
    }, {
        key: "getVerticeIndex",
        value: function getVerticeIndex(rowIndex, columnIndex) {
            return rowIndex * (this.COLUMNS + 1) + columnIndex;
        }
        // TODO: Use midpoint circle algorithm

    }, {
        key: "getRasterizedCircle",
        value: function getRasterizedCircle(center) {
            var summit = 6;
            var points = [];
            points.push({
                x: center.x,
                y: center.y,
                z: summit
            });
            points.push({
                x: center.x - 1,
                y: center.y,
                z: summit - 1
            });
            points.push({
                x: center.x + 1,
                y: center.y,
                z: summit - 1
            });
            points.push({
                x: center.x,
                y: center.y - 1,
                z: summit - 1
            });
            points.push({
                x: center.x,
                y: center.y + 1,
                z: summit - 1
            });
            points.push({
                x: center.x - 1,
                y: center.y - 1,
                z: summit - 2
            });
            points.push({
                x: center.x + 1,
                y: center.y + 1,
                z: summit - 2
            });
            points.push({
                x: center.x - 1,
                y: center.y + 1,
                z: summit - 2
            });
            points.push({
                x: center.x + 1,
                y: center.y - 1,
                z: summit - 2
            });
            return points;
        }
    }]);

    return Engine;
}();

exports.Engine = Engine;

/***/ })
/******/ ]);