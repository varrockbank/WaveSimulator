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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @param m number of columns
 * @return function for indexing into 1-d buffer representing ( m x n ) matrix
 */
function getSingleBufferRowMajorMatrixIndexer(m) {
  return function (i, j) {
    return i * m + j;
  };
}
exports.getSingleBufferRowMajorMatrixIndexer = getSingleBufferRowMajorMatrixIndexer;
/**
 * @return Random number in [-1, 0, 1]
 */
function getRandomDirection() {
  return Math.floor(3 * Math.random()) - 1;
}
exports.getRandomDirection = getRandomDirection;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/// <reference types='../typings/three' /> 

Object.defineProperty(exports, "__esModule", { value: true });
var engine_1 = __webpack_require__(2);
var init = function init() {
    var engine = new engine_1.Engine();
};
window.onload = init;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var ripple_model_1 = __webpack_require__(3);
var propagation_spring_model_1 = __webpack_require__(4);
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
        this.ROW_VERTICES = this.ROWS + 1;
        this.COLUMN_VERTICES = this.COLUMNS + 1;
        this.NUM_VERTICES = this.ROW_VERTICES * this.COLUMN_VERTICES;
        this.PLANE_WIDTH = 100;
        this.PLANE_HEIGHT = 100;
        this.CELL_HEIGHT = this.PLANE_HEIGHT / this.ROWS;
        this.CELL_WIDTH = this.PLANE_WIDTH / this.COLUMNS;
        console.assert(this.ROWS > 0);
        console.assert(this.COLUMNS > 0);
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
        this.propagationSpringModel = new propagation_spring_model_1.PropagationSpringModel(this.ROWS + 1, this.COLUMNS + 1);
        this.heightMap = new Array(this.ROW_VERTICES * this.COLUMN_VERTICES).fill(0);
        this.initRandomHeightmap();
        this.rippleModel = new ripple_model_1.RippleModel(this.ROWS + 1, this.COLUMNS + 1);
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
            var rippleHeightBuffer = this.rippleModel.getHeightBuffer();
            this.heightMap = this.propagationSpringModel.getHeightBuffer();
            var i = this.heightMap.length;
            while (i--) {
                this.heightMap[i] += rippleHeightBuffer[i];
            }this.applyHeightmapToGeometry();
            this.digestGeometry();
        }
    }, {
        key: "applyHeightmapToGeometry",
        value: function applyHeightmapToGeometry() {
            var heightMap = this.heightMap;
            var i = heightMap.length;
            while (i--) {
                this.geometry.vertices[i].z = this.heightMap[i];
            }
        }
    }, {
        key: "initRandomHeightmap",
        value: function initRandomHeightmap() {
            this.propagationSpringModel.initRandomHeight();
            this.heightMap = this.propagationSpringModel.getHeightBuffer();
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
                case EVENT_KEYS.RANDOM:
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
                this.rippleModel.applyImpression(rowIndex, columnIndex);
                this.iterate();
            }
        }
    }]);

    return Engine;
}();

exports.Engine = Engine;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var utilities_1 = __webpack_require__(0);
/**
 * A heightfield based ripple model which updates points with average of neighbors from previous
 * iteration + delta from previous iteration.
 *
 * Reference: http://matthias-mueller-fischer.ch/talks/GDC2008.pdf
 */

var RippleModel = function () {
    function RippleModel(M, N) {
        _classCallCheck(this, RippleModel);

        this.M = M;
        this.N = N;
        // Physics constants:
        // Dampening value between 0 and 1 inclusive.
        this.D = .95;
        this.heightField = new Array(M * N).fill(0);
        this.heightField_prev = new Array(M * N).fill(0);
        this.indexer = utilities_1.getSingleBufferRowMajorMatrixIndexer(N);
    }

    _createClass(RippleModel, [{
        key: "iterate",
        value: function iterate() {
            {
                var indexer = this.indexer;
                var N = this.N;
                var i = this.M;
                while (i--) {
                    var j = N;
                    while (j--) {
                        var index = indexer(i, j);
                        var elements = [this.heightField_prev[indexer(Math.min(i + 1, this.M - 1), j)], this.heightField_prev[indexer(Math.max(i - 1, 0), j)], this.heightField_prev[indexer(i, Math.max(j - 1, 0))], this.heightField_prev[indexer(i, Math.min(j + 1, this.N - 1))], this.heightField_prev[indexer(Math.min(i + 1, this.M - 1), Math.max(j - 1, 0))], this.heightField_prev[indexer(Math.min(i + 1, this.M - 1), Math.min(j + 1, this.N - 1))], this.heightField_prev[indexer(Math.max(i - 1, 0), Math.max(j - 1, 0))], this.heightField_prev[indexer(Math.max(i - 1, 0), Math.min(j + 1, this.N - 1))]];
                        // TODO: Don't give each each neighbor equal weight
                        this.heightField[index] += elements.reduce(function (total, num) {
                            return total + num;
                        }) / 8 - this.heightField_prev[index];
                        this.heightField[i] *= this.D;
                    }
                }
            }
            {
                var _i = this.heightField.length;
                while (_i--) {
                    this.heightField_prev[_i] += this.heightField[_i];
                }
            }
        }
        /**
         * @return copy of height buffer
         */

    }, {
        key: "getHeightBuffer",
        value: function getHeightBuffer() {
            var i = this.heightField.length;
            var heightBuffer = new Array(i);
            while (i--) {
                heightBuffer[i] = this.heightField[i];
            }return heightBuffer;
        }
    }, {
        key: "applyImpression",
        value: function applyImpression(rowIndex, columnIndex) {
            var index = this.indexer(rowIndex, columnIndex);
            if (this.heightField_prev[index] < 0) {
                this.heightField_prev[index] -= 10;
            } else {
                this.heightField_prev[index] += 10;
            }
        }
    }]);

    return RippleModel;
}();

exports.RippleModel = RippleModel;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

Object.defineProperty(exports, "__esModule", { value: true });
var spring_model_1 = __webpack_require__(5);
/**
 * SpringModel models each point in the plane as an independent spring without lateral interaction.
 * PropagationSpringModel has points pull on neighbors making wave oscillate laterally.
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
            leftDelta: new Array(ROWS * COLUMNS),
            rightDelta: new Array(ROWS * COLUMNS),
            topDelta: new Array(ROWS * COLUMNS),
            bottomDelta: new Array(ROWS * COLUMNS)
        };
        return _this;
    }

    _createClass(PropagationSpringModel, [{
        key: "iteratePropagation",
        value: function iteratePropagation() {
            var indexer = this.indexer;
            var heightMap = this.heightMap;
            var velocityMap = this.velocityMap;
            var _propagationModelBuff = this.propagationModelBuffers,
                leftDelta = _propagationModelBuff.leftDelta,
                rightDelta = _propagationModelBuff.rightDelta,
                topDelta = _propagationModelBuff.topDelta,
                bottomDelta = _propagationModelBuff.bottomDelta;
            // Clear deltas.

            leftDelta = leftDelta.fill(0);
            rightDelta = rightDelta.fill(0);
            topDelta = topDelta.fill(0);
            bottomDelta = bottomDelta.fill(0);
            for (var l = 0; l < this.BACK_PROPAGATIONS; l++) {
                // Horizontal propagation
                for (var i = 0; i < this.ROWS; i++) {
                    // Left velocity propagation.
                    for (var j = 1; j < this.COLUMNS; j++) {
                        leftDelta[indexer(i, j)] = this.roundDecimal(this.S * (heightMap[indexer(i, j)] - heightMap[indexer(i, j - 1)]));
                        velocityMap[indexer(i, j)] += leftDelta[indexer(i, j)];
                        if (velocityMap[indexer(i, j)] < 0) {
                            velocityMap[indexer(i, j)] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[indexer(i, j)]));
                        } else if (velocityMap[indexer(i, j)] > 0) {
                            velocityMap[indexer(i, j)] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[indexer(i, j)]));
                        }
                    }
                    // Right velocity propagation.
                    for (var _j = 0; _j < this.COLUMNS - 1; _j++) {
                        rightDelta[indexer(i, _j)] = this.roundDecimal(this.S * (heightMap[indexer(i, _j)] - heightMap[indexer(i, _j + 1)]));
                        velocityMap[indexer(i, _j)] += rightDelta[indexer(i, _j)];
                        if (velocityMap[indexer(i, _j)] < 0) {
                            velocityMap[indexer(i, _j)] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[indexer(i, _j)]));
                        } else if (velocityMap[indexer(i, _j)] > 0) {
                            velocityMap[indexer(i, _j)] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[indexer(i, _j)]));
                        }
                    }
                    // Left height propagation
                    for (var _j2 = 1; _j2 < this.COLUMNS - 1; _j2++) {
                        heightMap[indexer(i, _j2 - 1)] += leftDelta[indexer(i, _j2)];
                    }
                    // Right height propagation
                    for (var _j3 = 0; _j3 < this.COLUMNS - 1; _j3++) {
                        heightMap[indexer(i, _j3 + 1)] += rightDelta[indexer(i, _j3)];
                    }
                }
                // End Horizontal propagation.
                // Vertical propagation.
                for (var _j4 = 0; _j4 < this.COLUMNS; _j4++) {
                    for (var _i = 1; _i < this.ROWS; _i++) {
                        topDelta[indexer(_i, _j4)] = this.roundDecimal(this.S * (heightMap[indexer(_i, _j4)] - heightMap[indexer(_i - 1, _j4)]));
                        velocityMap[indexer(_i, _j4)] += topDelta[indexer(_i, _j4)];
                        if (velocityMap[indexer(_i, _j4)] < 0) {
                            velocityMap[indexer(_i, _j4)] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[indexer(_i, _j4)]));
                        } else if (velocityMap[indexer(_i, _j4)] > 0) {
                            velocityMap[indexer(_i, _j4)] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[indexer(_i, _j4)]));
                        }
                    }
                    for (var _i2 = 0; _i2 < this.ROWS - 1; _i2++) {
                        bottomDelta[indexer(_i2, _j4)] = this.S * (heightMap[indexer(_i2, _j4)] - heightMap[indexer(_i2 + 1, _j4)]);
                        velocityMap[indexer(_i2, _j4)] += bottomDelta[indexer(_i2, _j4)];
                        if (velocityMap[indexer(_i2, _j4)] < 0) {
                            velocityMap[indexer(_i2, _j4)] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[indexer(_i2, _j4)]));
                        } else if (velocityMap[indexer(_i2, _j4)] > 0) {
                            velocityMap[indexer(_i2, _j4)] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[indexer(_i2, _j4)]));
                        }
                    }
                    for (var _i3 = 1; _i3 < this.ROWS; _i3++) {
                        heightMap[indexer(_i3 - 1, _j4)] += topDelta[indexer(_i3, _j4)];
                    }
                    for (var _i4 = 0; _i4 < this.ROWS - 1; _i4++) {
                        heightMap[indexer(_i4 + 1, _j4)] += bottomDelta[indexer(_i4, _j4)];
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
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

Object.defineProperty(exports, "__esModule", { value: true });
var utilities_1 = __webpack_require__(0);
/**
 * Models water surface as springs along the z-axis.
 *
 * Lower dimensional variant: https://gamedevelopment.tutsplus.com/tutorials/make-a-splash-with-dynamic-2d-water-effects--gamedev-236
 */

var SpringModel = function () {
    function SpringModel(ROWS, COLUMNS) {
        _classCallCheck(this, SpringModel);

        this.ROWS = ROWS;
        this.COLUMNS = COLUMNS;
        // Physics parameters.
        this.K = 0.03; // Hooke's constant
        this.D = 0.025; // Dampening Factor
        this.TERMINAL_VELOCITY = 1.5;
        this.heightMap = new Array(ROWS * COLUMNS).fill(0);
        this.velocityMap = new Array(ROWS * COLUMNS).fill(0);
        this.indexer = utilities_1.getSingleBufferRowMajorMatrixIndexer(COLUMNS);
    }

    _createClass(SpringModel, [{
        key: "iterate",
        value: function iterate() {
            var indexer = this.indexer;
            var heightMap = this.heightMap;
            var velocityMap = this.velocityMap;
            var rowNum = this.ROWS;
            while (rowNum--) {
                var colNum = this.COLUMNS;
                while (colNum--) {
                    var index = indexer(rowNum, colNum);
                    var velocity = velocityMap[index];
                    heightMap[index] += velocity;
                    var targetHeight = 0;
                    var height = heightMap[index];
                    var x = height - targetHeight;
                    var acceleration = -1 * this.K * x - this.D * velocity;
                    velocityMap[index] += this.roundDecimal(acceleration);
                    velocityMap[index] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityMap[index]));
                }
            }
        }
        // TODO: refactor into utility

    }, {
        key: "roundDecimal",
        value: function roundDecimal(num) {
            return Math.round(num * 10000) / 10000;
        }
        /**
         * @return copy of height buffer
         */

    }, {
        key: "getHeightBuffer",
        value: function getHeightBuffer() {
            var i = this.heightMap.length;
            var heightBuffer = new Array(i);
            while (i--) {
                heightBuffer[i] = this.heightMap[i];
            }return heightBuffer;
        }
    }, {
        key: "initRandomHeight",
        value: function initRandomHeight() {
            var indexer = this.indexer;
            var numCols = this.COLUMNS;
            var numRows = this.ROWS;
            var heightMap = this.heightMap;
            // Seed the first cell.
            heightMap[indexer(0, 0)] = Math.floor(10 * Math.random()) * utilities_1.getRandomDirection();
            // Random walk along first row.
            for (var j = 1; j < numCols; j++) {
                var neighborHeight = heightMap[indexer(0, j - 1)];
                heightMap[indexer(0, j)] = neighborHeight + utilities_1.getRandomDirection();
            }
            // Random walk along first column.
            for (var i = 1; i < numRows; i++) {
                var _neighborHeight = heightMap[indexer(i - 1, 0)];
                heightMap[indexer(i, 0)] = _neighborHeight + utilities_1.getRandomDirection();
            }
            // Loop over inner cells, assigning height as +-1 from midpoint of top and left neighbor
            for (var _i = 1; _i < numRows; _i++) {
                for (var _j = 1; _j < numCols; _j++) {
                    var topNeighbor = heightMap[indexer(_i - 1, _j)];
                    var leftNeighbor = heightMap[indexer(_i, _j - 1)];
                    var midpoint = (topNeighbor + leftNeighbor) / 2;
                    heightMap[indexer(_i, _j)] = Math.round(midpoint) + utilities_1.getRandomDirection();
                }
            }
        }
    }]);

    return SpringModel;
}();

exports.SpringModel = SpringModel;

/***/ })
/******/ ]);