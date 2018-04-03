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
        this.waves = [];
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
        var texture = new THREE.TextureLoader().load("textures/water.jpg");
        var geometry = new THREE.PlaneGeometry(this.PLANE_WIDTH, this.PLANE_HEIGHT, this.ROWS, this.COLUMNS);
        var material = new THREE.MeshPhongMaterial({
            // color: 0x00EEEE,
            flatShading: true,
            shininess: 5,
            map: texture
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
        this.initSpringModel();
        this.initPropagationModel();
        this.initRandomHeightmap();
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
            this.updateSpringModel();
            this.updatePropagationModel();
            // TODO: Add floating point rounding method
            // TODO: run this at half time step
            // TODO: refactor into method
            // Calculate Ripple Model
            for (var i = 0; i < this.ROWS; i++) {
                for (var j = 0; j <= this.COLUMNS; j++) {
                    var elements = [this.rippleHeightMap_prev[Math.min(i + 1, this.ROWS)][j], this.rippleHeightMap_prev[Math.max(i - 1, 0)][j], this.rippleHeightMap_prev[i][Math.max(j - 1, 0)], this.rippleHeightMap_prev[i][Math.min(this.ROWS - 1, j + 1)], this.rippleHeightMap_prev[Math.min(i + 1, this.ROWS)][Math.max(j - 1, 0)], this.rippleHeightMap_prev[Math.min(i + 1, this.ROWS)][Math.min(this.ROWS - 1, j + 1)], this.rippleHeightMap_prev[Math.max(i - 1, 0)][Math.max(j - 1, 0)], this.rippleHeightMap_prev[Math.max(i - 1, 0)][Math.min(this.ROWS - 1, j + 1)]];
                    // TODO: Don't give each each neighbor equal weight
                    this.rippleHeightMap[i][j] += elements.reduce(function (total, num) {
                        return total + num;
                    }) / 8 - this.rippleHeightMap_prev[i][j];
                    this.rippleHeightMap[i][j] *= .95;
                }
            }
            for (var _i = 0; _i < this.ROWS; _i++) {
                for (var _j = 0; _j < this.COLUMNS; _j++) {
                    this.rippleHeightMap_prev[_i][_j] += this.rippleHeightMap[_i][_j];
                }
            }
            for (var _i2 = 0; _i2 < this.ROWS; _i2++) {
                for (var _j2 = 0; _j2 < this.COLUMNS; _j2++) {
                    // TODO: maybe don't merge. keep a separate springModel heightmap and a ripplemodel heightmap
                    // and render the matrix addition
                    this.heightMap[_i2][_j2] += this.rippleHeightMap[_i2][_j2];
                }
            }
            // End ripple model
            this.applyHeightmapToGeometry();
            this.applyWavesToGeometry();
            this.digestGeometry();
        }
    }, {
        key: "applyHeightmapToGeometry",
        value: function applyHeightmapToGeometry() {
            var heightMap = this.heightMap;
            var rowNum = heightMap.length;
            while (rowNum--) {
                var row = heightMap[rowNum];
                var colNum = row.length;
                while (colNum--) {
                    var height = this.heightMap[rowNum][colNum];
                    var verticeIndex = this.getVerticeIndex(rowNum, colNum);
                    this.updateVertex(verticeIndex, height);
                }
            }
        }
    }, {
        key: "applyWavesToGeometry",
        value: function applyWavesToGeometry() {
            var numWaves = this.waves.length;
            while (numWaves--) {
                var wave = this.waves[numWaves];
                var points = wave.getPoints();
                var numPoints = points.length;
                while (numPoints--) {
                    var _points$numPoints = points[numPoints],
                        x = _points$numPoints.x,
                        y = _points$numPoints.y,
                        z = _points$numPoints.z;

                    var verticeIndex = this.getVerticeIndex(y, x);
                    // Avoid wave points outside boundary plane.
                    if (verticeIndex >= 0) {
                        var currHeight = this.heightMap[y][x];
                        var aggregate = z + currHeight;
                        this.updateVertex(verticeIndex, aggregate);
                    }
                }
                // State step wave, removing from collection if reached end of lifecycle.
                if (wave.step()) {
                    this.waves.splice(numWaves, 1);
                }
            }
        }
    }, {
        key: "updateSpringModel",
        value: function updateSpringModel() {
            var heightMap = this.heightMap;
            var velocityMap = this.velocityMap;
            console.assert(heightMap.length == velocityMap.length);
            var rowNum = heightMap.length;
            while (rowNum--) {
                var heightRow = heightMap[rowNum];
                var velocityRow = velocityMap[rowNum];
                console.assert(heightRow.length == velocityRow.length);
                var colNum = heightRow.length;
                while (colNum--) {
                    var velocity = velocityRow[colNum];
                    heightRow[colNum] += velocity;
                    var targetHeight = 0;
                    var height = heightRow[colNum];
                    var x = height - targetHeight;
                    var acceleration = -1 * this.K * x - this.D * velocity;
                    velocityRow[colNum] += this.roundDecimal(acceleration);
                    velocityRow[colNum] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityRow[colNum]));
                }
            }
        }
    }, {
        key: "updatePropagationModel",
        value: function updatePropagationModel() {
            var heightMap = this.heightMap;
            var velocityMap = this.velocityMap;
            var _propagationModelBuff = this.propagationModelBuffers,
                leftDelta = _propagationModelBuff.leftDelta,
                rightDelta = _propagationModelBuff.rightDelta,
                topDelta = _propagationModelBuff.topDelta,
                bottomDelta = _propagationModelBuff.bottomDelta;
            // Clear deltas.

            for (var i = 0; i < this.ROWS + 1; i++) {
                leftDelta[i] = leftDelta[i].fill(0);
                rightDelta[i] = rightDelta[i].fill(0);
            }
            for (var _i3 = 0; _i3 < this.COLUMNS + 1; _i3++) {
                topDelta[_i3] = topDelta[_i3].fill(0);
                bottomDelta[_i3] = bottomDelta[_i3].fill(0);
            }
            for (var l = 0; l < this.BACK_PROPAGATIONS; l++) {
                // Horizontal propagation
                for (var _i4 = 0; _i4 < heightMap.length; _i4++) {
                    var heightRow = heightMap[_i4];
                    var rowVelocity = velocityMap[_i4];
                    // Left velocity propagation.
                    for (var j = 1; j < heightRow.length; j++) {
                        leftDelta[_i4][j] = this.roundDecimal(this.S * (heightRow[j] - heightRow[j - 1]));
                        rowVelocity[j] += leftDelta[_i4][j];
                        if (rowVelocity[j] < 0) {
                            rowVelocity[j] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(rowVelocity[j]));
                        } else if (rowVelocity[j] > 0) {
                            rowVelocity[j] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(rowVelocity[j]));
                        }
                    }
                    // Right velocity propagation.
                    for (var _j3 = 0; _j3 < heightRow.length - 1; _j3++) {
                        rightDelta[_i4][_j3] = this.roundDecimal(this.S * (heightRow[_j3] - heightRow[_j3 + 1]));
                        rowVelocity[_j3] += rightDelta[_i4][_j3];
                        if (rowVelocity[_j3] < 0) {
                            rowVelocity[_j3] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(rowVelocity[_j3]));
                        } else if (rowVelocity[_j3] > 0) {
                            rowVelocity[_j3] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(rowVelocity[_j3]));
                        }
                    }
                    // Left height propagation
                    for (var _j4 = 1; _j4 < heightRow.length; _j4++) {
                        heightMap[_i4][_j4 - 1] += leftDelta[_i4][_j4];
                    }
                    // Right height propagation
                    for (var _j5 = 0; _j5 < heightRow.length - 1; _j5++) {
                        heightMap[_i4][_j5 + 1] += rightDelta[_i4][_j5];
                    }
                }
                // End Horizontal propagation.
                // Vertical propagation.
                for (var _j6 = 0; _j6 < heightMap[0].length; _j6++) {
                    for (var _i5 = 1; _i5 < heightMap.length; _i5++) {
                        topDelta[_i5][_j6] = this.roundDecimal(this.S * (heightMap[_i5][_j6] - heightMap[_i5 - 1][_j6]));
                        velocityMap[_i5][_j6] += topDelta[_i5][_j6];
                        if (velocityMap[_i5][_j6] < 0) {
                            velocityMap[_i5][_j6] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[_i5][_j6]));
                        } else if (velocityMap[_i5][_j6] > 0) {
                            velocityMap[_i5][_j6] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[_i5][_j6]));
                        }
                    }
                    for (var _i6 = 0; _i6 < heightMap.length - 1; _i6++) {
                        bottomDelta[_i6][_j6] = this.S * (heightMap[_i6][_j6] - heightMap[_i6 + 1][_j6]);
                        velocityMap[_i6][_j6] += bottomDelta[_i6][_j6];
                        if (velocityMap[_i6][_j6] < 0) {
                            velocityMap[_i6][_j6] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[_i6][_j6]));
                        } else if (velocityMap[_i6][_j6] > 0) {
                            velocityMap[_i6][_j6] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[_i6][_j6]));
                        }
                    }
                    for (var _i7 = 1; _i7 < heightMap.length; _i7++) {
                        heightMap[_i7 - 1][_j6] += topDelta[_i7][_j6];
                    }
                    for (var _i8 = 0; _i8 < heightMap.length - 1; _i8++) {
                        heightMap[_i8 + 1][_j6] += bottomDelta[_i8][_j6];
                    }
                }
                // End vertical propagation
            }
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
        key: "initSpringModel",
        value: function initSpringModel() {
            var numRows = this.ROWS + 1;
            var numCols = this.COLUMNS + 1;
            var heightMap = new Array(numRows);
            var velocityMap = new Array(numRows);
            var rippleHeightMap = new Array(numRows);
            var rippleHeightMap_prev = new Array(numRows);
            while (numRows--) {
                heightMap[numRows] = new Array(numCols).fill(0);
                velocityMap[numRows] = new Array(numCols).fill(0);
                rippleHeightMap[numRows] = new Array(numCols).fill(0);
                rippleHeightMap_prev[numRows] = new Array(numCols).fill(0);
            }
            this.heightMap = heightMap;
            this.velocityMap = velocityMap;
            this.rippleHeightMap = rippleHeightMap;
            this.rippleHeightMap_prev = rippleHeightMap_prev;
        }
    }, {
        key: "initPropagationModel",
        value: function initPropagationModel() {
            var leftDelta = new Array(this.ROWS + 1);
            var rightDelta = new Array(this.ROWS + 1);
            for (var i = 0; i < this.ROWS + 1; i++) {
                leftDelta[i] = new Array(this.COLUMNS + 1).fill(0);
                rightDelta[i] = new Array(this.COLUMNS + 1).fill(0);
            }
            var topDelta = new Array(this.COLUMNS + 1);
            var bottomDelta = new Array(this.COLUMNS + 1);
            for (var _i9 = 0; _i9 < this.COLUMNS + 1; _i9++) {
                topDelta[_i9] = new Array(this.ROWS + 1).fill(0);
                bottomDelta[_i9] = new Array(this.ROWS + 1).fill(0);
            }
            this.propagationModelBuffers = {
                leftDelta: leftDelta,
                rightDelta: rightDelta,
                topDelta: topDelta,
                bottomDelta: bottomDelta
            };
        }
    }, {
        key: "initRandomHeightmap",
        value: function initRandomHeightmap() {
            var heightMap = this.heightMap;
            var numCols = this.COLUMNS + 1;
            var numRows = this.ROWS + 1;
            // Seed the first cell.
            heightMap[0][0] = Math.floor(5 * Math.random()) * this.getRandomDirection();
            // Random walk along first row.
            var firstRow = heightMap[0];
            for (var j = 1; j < numCols; j++) {
                var neighborHeight = firstRow[j - 1];
                firstRow[j] = neighborHeight + this.getRandomDirection();
            }
            // Random walk along first column.
            for (var i = 1; i < numRows; i++) {
                var _neighborHeight = heightMap[i - 1][0];
                heightMap[i][0] = _neighborHeight + this.getRandomDirection();
            }
            // Loop over inner cells, assigning height as +-1 from midpoint of top and left neighbor
            for (var _i10 = 1; _i10 < numRows; _i10++) {
                var row = heightMap[_i10];
                var rowAbove = heightMap[_i10 - 1];
                for (var _j7 = 1; _j7 < numCols; _j7++) {
                    var topNeighbor = rowAbove[_j7];
                    var leftNeighbor = row[_j7 - 1];
                    var midpoint = (topNeighbor + leftNeighbor) / 2;
                    heightMap[_i10][_j7] = Math.round(midpoint) + this.getRandomDirection();
                }
            }
            this.applyHeightmapToGeometry();
            this.digestGeometry();
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
        key: "updateVertex",
        value: function updateVertex(verticeIndex, height) {
            if (height != undefined && height != null) {
                this.geometry.vertices[verticeIndex].z = height;
            } else {
                this.geometry.vertices[verticeIndex].z++;
            }
        }
    }, {
        key: "digestGeometry",
        value: function digestGeometry() {
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
                this.initRandomHeightmap();
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
                // this.waves.push( new Wave({x: columnIndex, y: rowIndex}) )
                this.applyImpression(rowIndex, columnIndex);
                this.iterate();
                // const points = this.getRasterizedCircle({x: rowIndex, y: columnIndex})
                // points.filter(({x, y}) => x >= 0 && x < this.COLUMNS && y >= 0 && y <= this.ROWS)
                //   .forEach(point => {
                //     this.heightMap[point.x][point.y] = point.z
                //   });
                // this.refreshGeometry()
            }
        }
    }, {
        key: "applyImpression",
        value: function applyImpression(rowIndex, columnIndex) {
            if (this.rippleHeightMap_prev[rowIndex][columnIndex] < 0) {
                this.rippleHeightMap_prev[rowIndex][columnIndex] -= 10;
            } else {
                this.rippleHeightMap_prev[rowIndex][columnIndex] += 10;
            }
        }
    }, {
        key: "getVerticeIndex",
        value: function getVerticeIndex(rowIndex, columnIndex) {
            var index = rowIndex * (this.COLUMNS + 1) + columnIndex;
            var maxIndex = (this.COLUMNS + 1) * (this.ROWS + 1);
            if (index > maxIndex) return -1;
            return index;
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