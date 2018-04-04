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
var ripple_model_1 = __webpack_require__(2);
var propagation_spring_model_1 = __webpack_require__(3);
var EVENT_KEYS = {
    ITERATE: 'x',
    RUN: 'y',
    RANDOM: 'z'
};

var Engine = function () {
    function Engine() {
        _classCallCheck(this, Engine);

        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.ROWS = 50;
        this.COLUMNS = 50;
        this.PLANE_WIDTH = 100;
        this.PLANE_HEIGHT = 100;
        this.CELL_HEIGHT = this.PLANE_HEIGHT / this.ROWS;
        this.CELL_WIDTH = this.PLANE_WIDTH / this.COLUMNS;
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
        this.propagationSpringModel = new propagation_spring_model_1.PropagationSpringModel(this.ROWS, this.COLUMNS);
        this.initRandomHeightmap();
        this.rippleModel = new ripple_model_1.RippleModel(this.ROWS, this.COLUMNS);
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
            this.propagationSpringModel.iterate();
            this.propagationSpringModel.iteratePropagation();
            // TODO: Add floating point rounding method
            // TODO: run this at half time step
            this.rippleModel.iterate();
            var rippleHeightMap = this.rippleModel.getHeightMap();
            for (var i = 0; i < this.ROWS; i++) {
                for (var j = 0; j < this.COLUMNS; j++) {
                    // TODO: maybe don't merge. keep a separate springModel heightmap and a ripplemodel heightmap
                    // and render the matrix addition
                    this.propagationSpringModel.heightMap[i][j] += rippleHeightMap[i][j];
                }
            }
            this.applyHeightmapToGeometry();
            this.applyWavesToGeometry();
            this.digestGeometry();
        }
    }, {
        key: "applyHeightmapToGeometry",
        value: function applyHeightmapToGeometry() {
            var heightMap = this.propagationSpringModel.heightMap;
            var rowNum = heightMap.length;
            while (rowNum--) {
                var row = heightMap[rowNum];
                var colNum = row.length;
                while (colNum--) {
                    var height = this.propagationSpringModel.heightMap[rowNum][colNum];
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
                        var currHeight = this.propagationSpringModel.heightMap[y][x];
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
        /** Return -1, 0, 1 */

    }, {
        key: "getRandomDirection",
        value: function getRandomDirection() {
            return Math.floor(3 * Math.random()) - 1;
        }
    }, {
        key: "initRandomHeightmap",
        value: function initRandomHeightmap() {
            // TODO: decouple the engine's heightmap from spring model.
            var heightMap = this.propagationSpringModel.heightMap;
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
            for (var _i = 1; _i < numRows; _i++) {
                var row = heightMap[_i];
                var rowAbove = heightMap[_i - 1];
                for (var _j = 1; _j < numCols; _j++) {
                    var topNeighbor = rowAbove[_j];
                    var leftNeighbor = row[_j - 1];
                    var midpoint = (topNeighbor + leftNeighbor) / 2;
                    heightMap[_i][_j] = Math.round(midpoint) + this.getRandomDirection();
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
                _this2.handleMouseup(e);
            }, false);
            window.addEventListener('keyup', function (e) {
                _this2.handleKeyUp(e);
            }, false);
        }
    }, {
        key: "handleKeyUp",
        value: function handleKeyUp(_ref) {
            var _this3 = this;

            var key = _ref.key;

            key = key.toLowerCase();
            switch (key) {
                case EVENT_KEYS.ITERATE:
                    {
                        this.iterate();
                        break;
                    }
                case EVENT_KEYS.RUN:
                    {
                        setInterval(function () {
                            _this3.iterate();
                        }, 100);
                        break;
                    }
                case EVENT_KEYS.ITERATE:
                    {
                        this.initRandomHeightmap();
                        break;
                    }
                default:
                    {}
            }
        }
    }, {
        key: "handleMouseup",
        value: function handleMouseup(_ref2) {
            var _this4 = this;

            var clientX = _ref2.clientX,
                clientY = _ref2.clientY;

            var mouse = {
                x: 2 * (clientX / this.width) - 1,
                y: -2 * (clientY / this.height) + 1
            };
            this.raycaster.setFromCamera(mouse, this.camera);
            var planeIntersect = this.raycaster.intersectObjects(this.scene.children).find(function (_ref3) {
                var uuid = _ref3.object.uuid;
                return uuid === _this4.planeUUID;
            });
            if (planeIntersect) {
                var _planeIntersect$point = planeIntersect.point,
                    x = _planeIntersect$point.x,
                    y = _planeIntersect$point.y;
                // Translate coordinates to vertices' indexing.

                var columnIndex = Math.round(x / this.CELL_WIDTH) + this.COLUMNS / 2;
                var rowIndex = -1 * Math.round(y / this.CELL_HEIGHT) + this.ROWS / 2;
                // this.waves.push( new Wave({x: columnIndex, y: rowIndex}) )
                this.rippleModel.applyImpression(rowIndex, columnIndex);
                this.iterate();
            }
        }
    }, {
        key: "getVerticeIndex",
        value: function getVerticeIndex(rowIndex, columnIndex) {
            var index = rowIndex * (this.COLUMNS + 1) + columnIndex;
            var maxIndex = (this.COLUMNS + 1) * (this.ROWS + 1);
            return index > maxIndex ? -1 : index;
        }
    }]);

    return Engine;
}();

exports.Engine = Engine;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var utilities_1 = __webpack_require__(5);
/**
 * A heightfield based ripple model which updates points with average of neighbors from previous
 * iteration + delta from previous iteration.
 *
 * Reference: http://matthias-mueller-fischer.ch/talks/GDC2008.pdf
 */

var RippleModel = function () {
    function RippleModel(ROWS, COLUMNS) {
        _classCallCheck(this, RippleModel);

        this.ROWS = ROWS;
        this.COLUMNS = COLUMNS;
        this.rippleHeightMap = utilities_1.makeRowOrderMatrix(ROWS + 1, COLUMNS + 1);
        this.rippleHeightMap_prev = utilities_1.makeRowOrderMatrix(ROWS + 1, COLUMNS + 1);
    }

    _createClass(RippleModel, [{
        key: "iterate",
        value: function iterate() {
            // TODO: inspect these loop indexes. seem to be off by 1.
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
        }
    }, {
        key: "getHeightMap",
        value: function getHeightMap() {
            return this.rippleHeightMap;
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
    }]);

    return RippleModel;
}();

exports.RippleModel = RippleModel;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

Object.defineProperty(exports, "__esModule", { value: true });
var spring_model_1 = __webpack_require__(4);
var utilities_1 = __webpack_require__(5);
/**
 * SpringModel models each point in the plane as an independent spring without lateral interaction.
 * PropagationSpringModel causes the springs to pull on adjacent neighbors.
 */

var PropagationSpringModel = function (_spring_model_1$Sprin) {
    _inherits(PropagationSpringModel, _spring_model_1$Sprin);

    function PropagationSpringModel(ROWS, COLUMNS) {
        _classCallCheck(this, PropagationSpringModel);

        // Physics parameters.
        var _this = _possibleConstructorReturn(this, (PropagationSpringModel.__proto__ || Object.getPrototypeOf(PropagationSpringModel)).call(this, ROWS, COLUMNS));

        _this.S = 0.0005; // Wave spread.
        _this.BACK_PROPAGATIONS = 4;
        _this.propagationModelBuffers = {
            leftDelta: utilities_1.makeRowOrderMatrix(ROWS + 1, COLUMNS + 1),
            rightDelta: utilities_1.makeRowOrderMatrix(ROWS + 1, COLUMNS + 1),
            topDelta: utilities_1.makeRowOrderMatrix(ROWS + 1, COLUMNS + 1),
            bottomDelta: utilities_1.makeRowOrderMatrix(ROWS + 1, COLUMNS + 1)
        };
        return _this;
    }

    _createClass(PropagationSpringModel, [{
        key: "iteratePropagation",
        value: function iteratePropagation() {
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
            for (var _i = 0; _i < this.COLUMNS + 1; _i++) {
                topDelta[_i] = topDelta[_i].fill(0);
                bottomDelta[_i] = bottomDelta[_i].fill(0);
            }
            for (var l = 0; l < this.BACK_PROPAGATIONS; l++) {
                // Horizontal propagation
                for (var _i2 = 0; _i2 < heightMap.length; _i2++) {
                    var heightRow = heightMap[_i2];
                    var rowVelocity = velocityMap[_i2];
                    // Left velocity propagation.
                    for (var j = 1; j < heightRow.length; j++) {
                        leftDelta[_i2][j] = this.roundDecimal(this.S * (heightRow[j] - heightRow[j - 1]));
                        rowVelocity[j] += leftDelta[_i2][j];
                        if (rowVelocity[j] < 0) {
                            rowVelocity[j] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(rowVelocity[j]));
                        } else if (rowVelocity[j] > 0) {
                            rowVelocity[j] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(rowVelocity[j]));
                        }
                    }
                    // Right velocity propagation.
                    for (var _j = 0; _j < heightRow.length - 1; _j++) {
                        rightDelta[_i2][_j] = this.roundDecimal(this.S * (heightRow[_j] - heightRow[_j + 1]));
                        rowVelocity[_j] += rightDelta[_i2][_j];
                        if (rowVelocity[_j] < 0) {
                            rowVelocity[_j] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(rowVelocity[_j]));
                        } else if (rowVelocity[_j] > 0) {
                            rowVelocity[_j] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(rowVelocity[_j]));
                        }
                    }
                    // Left height propagation
                    for (var _j2 = 1; _j2 < heightRow.length; _j2++) {
                        heightMap[_i2][_j2 - 1] += leftDelta[_i2][_j2];
                    }
                    // Right height propagation
                    for (var _j3 = 0; _j3 < heightRow.length - 1; _j3++) {
                        heightMap[_i2][_j3 + 1] += rightDelta[_i2][_j3];
                    }
                }
                // End Horizontal propagation.
                // Vertical propagation.
                for (var _j4 = 0; _j4 < heightMap[0].length; _j4++) {
                    for (var _i3 = 1; _i3 < heightMap.length; _i3++) {
                        topDelta[_i3][_j4] = this.roundDecimal(this.S * (heightMap[_i3][_j4] - heightMap[_i3 - 1][_j4]));
                        velocityMap[_i3][_j4] += topDelta[_i3][_j4];
                        if (velocityMap[_i3][_j4] < 0) {
                            velocityMap[_i3][_j4] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[_i3][_j4]));
                        } else if (velocityMap[_i3][_j4] > 0) {
                            velocityMap[_i3][_j4] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[_i3][_j4]));
                        }
                    }
                    for (var _i4 = 0; _i4 < heightMap.length - 1; _i4++) {
                        bottomDelta[_i4][_j4] = this.S * (heightMap[_i4][_j4] - heightMap[_i4 + 1][_j4]);
                        velocityMap[_i4][_j4] += bottomDelta[_i4][_j4];
                        if (velocityMap[_i4][_j4] < 0) {
                            velocityMap[_i4][_j4] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[_i4][_j4]));
                        } else if (velocityMap[_i4][_j4] > 0) {
                            velocityMap[_i4][_j4] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[_i4][_j4]));
                        }
                    }
                    for (var _i5 = 1; _i5 < heightMap.length; _i5++) {
                        heightMap[_i5 - 1][_j4] += topDelta[_i5][_j4];
                    }
                    for (var _i6 = 0; _i6 < heightMap.length - 1; _i6++) {
                        heightMap[_i6 + 1][_j4] += bottomDelta[_i6][_j4];
                    }
                }
                // End vertical propagation
            }
        }
    }]);

    return PropagationSpringModel;
}(spring_model_1.SpringModel);

exports.PropagationSpringModel = PropagationSpringModel;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Models as water surface as springs along the z-axis.
 *
 * Lower dimensional variant: https://gamedevelopment.tutsplus.com/tutorials/make-a-splash-with-dynamic-2d-water-effects--gamedev-236
 */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var utilities_1 = __webpack_require__(5);

var SpringModel = function () {
    function SpringModel(ROWS, COLUMNS) {
        _classCallCheck(this, SpringModel);

        this.ROWS = ROWS;
        this.COLUMNS = COLUMNS;
        // Physics parameters.
        this.K = 0.03; // "Hooke's constant"
        this.D = 0.025; // Dampening Factor
        this.TERMINAL_VELOCITY = 1.5;
        this.heightMap = utilities_1.makeRowOrderMatrix(ROWS + 1, COLUMNS + 1);
        this.velocityMap = utilities_1.makeRowOrderMatrix(ROWS + 1, COLUMNS + 1);
    }

    _createClass(SpringModel, [{
        key: "iterate",
        value: function iterate() {
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
        // TODO: refactor into utility

    }, {
        key: "roundDecimal",
        value: function roundDecimal(num) {
            return Math.round(num * 10000) / 10000;
        }
    }]);

    return SpringModel;
}();

exports.SpringModel = SpringModel;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Returns a row-order numeric matrix filled initialized with 0s
 * @param rows Number of rows
 * @param columns number of columns
 * @return
 */
function makeRowOrderMatrix(rows, columns) {
    var matrix = new Array(rows);
    while (rows--) {
        matrix[rows] = new Array(columns).fill(0);
    }return matrix;
}
exports.makeRowOrderMatrix = makeRowOrderMatrix;

/***/ })
/******/ ]);