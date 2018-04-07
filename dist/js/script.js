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
function isMobile() {
    return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    );
}
exports.isMobile = isMobile;
;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/// <reference types='../typings/three' /> 

Object.defineProperty(exports, "__esModule", { value: true });
var engine_1 = __webpack_require__(2);
var init = function init() {
    var numRows = 50;
    var numColumns = 50;
    var engine = new engine_1.Engine(numRows, numColumns);
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
var utilities_1 = __webpack_require__(0);
var EVENT_KEYS = {
    ITERATE: 'x',
    RUN: 'y',
    RANDOM: 'z'
};
var BUTTON_IDS = {
    // ElementIDs of Button
    SPLASH: 'splash',
    START: 'start',
    STOP: 'stop',
    RANDOM: 'random'
};
var WalkthroughState;
(function (WalkthroughState) {
    WalkthroughState[WalkthroughState["Initial"] = 0] = "Initial";
    WalkthroughState[WalkthroughState["Halfway"] = 1] = "Halfway";
    WalkthroughState[WalkthroughState["HighlightStop"] = 2] = "HighlightStop";
    WalkthroughState[WalkthroughState["Complete"] = 3] = "Complete";
})(WalkthroughState || (WalkthroughState = {}));

var Engine = function () {
    function Engine(ROWS, COLUMNS) {
        _classCallCheck(this, Engine);

        this.ROWS = ROWS;
        this.COLUMNS = COLUMNS;
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.ROW_VERTICES = this.ROWS + 1;
        this.COLUMN_VERTICES = this.COLUMNS + 1;
        this.NUM_VERTICES = this.ROW_VERTICES * this.COLUMN_VERTICES;
        this.PLANE_WIDTH = 100;
        this.PLANE_HEIGHT = 100;
        this.CELL_HEIGHT = this.PLANE_HEIGHT / this.ROWS;
        this.CELL_WIDTH = this.PLANE_WIDTH / this.COLUMNS;
        this.walkthroughState = WalkthroughState.Initial;
        this.isMobile = utilities_1.isMobile();
        console.assert(this.ROWS > 0);
        console.assert(this.COLUMNS > 0);
        // Instance Scene.
        this.scene = new THREE.Scene();
        // Instantiate Camera.
        this.camera = new THREE.PerspectiveCamera(80, this.width / this.height, 1, 500);
        this.camera.position.set(10, -71, 40);
        // Instantiate render.
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0xfff6e6);
        if (this.isMobile) {
            this.renderer.setSize(this.width, this.height * 3 / 4);
            document.getElementById('controls').classList.add('mobile');
            document.getElementById('container').classList.add('mobile');
        } else {
            this.renderer.setSize(this.width * 3 / 4, this.height * 3 / 4);
        }
        document.getElementById('container').appendChild(this.renderer.domElement);
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
        this.camera.rotation.x = 1.04;
        this.camera.rotation.y = .083;
        this.camera.rotation.z = -.14;
        var plane = new THREE.Mesh(geometry, material);
        plane.position.y = -5;
        plane.position.z = 2;
        this.planeUUID = plane.uuid;
        this.geometry = plane.geometry;
        this.scene.add(plane);
        var axes = new THREE.AxisHelper(100);
        this.scene.add(axes);
        this.animate();
        this.addEventListeners();
        this.propagationSpringModel = new propagation_spring_model_1.PropagationSpringModel(this.ROWS + 1, this.COLUMNS + 1);
        this.heightMap = new Array(this.ROW_VERTICES * this.COLUMN_VERTICES).fill(0);
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
            var rippleHeightBuffer = this.rippleModel.heightField;
            this.heightMap = this.propagationSpringModel.getHeightBuffer();
            var i = this.heightMap.length;
            while (i--) {
                this.heightMap[i] += rippleHeightBuffer[i];
            }this.digestGeometry();
        }
    }, {
        key: "digestGeometry",
        value: function digestGeometry() {
            var heightMap = this.heightMap;
            var i = heightMap.length;
            while (i--) {
                this.geometry.vertices[i].z = this.heightMap[i];
            }this.geometry.verticesNeedUpdate = true;
        }
    }, {
        key: "initRandomHeightmap",
        value: function initRandomHeightmap() {
            this.propagationSpringModel.initRandomHeight();
            this.heightMap = this.propagationSpringModel.getHeightBuffer();
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
        key: "addEventListeners",
        value: function addEventListeners() {
            var _this2 = this;

            window.addEventListener('mouseup', function (e) {
                _this2.handleMouseup(e);
            }, false);
            window.addEventListener('keyup', function (e) {
                _this2.handleKeyUp(e);
            }, false);
            document.getElementById(BUTTON_IDS.RANDOM).addEventListener('click', function (e) {
                _this2.initRandomHeightmap();
                if (_this2.walkthroughState == WalkthroughState.Halfway) {
                    var interval = setInterval(function () {
                        _this2.initRandomHeightmap();
                    }, 200);
                    setTimeout(function () {
                        clearInterval(interval);
                    }, 2000);
                    document.getElementById(BUTTON_IDS.RANDOM).classList.remove('bounce');
                    setTimeout(function () {
                        document.getElementById(BUTTON_IDS.START).classList.remove('hidden');
                        document.getElementById(BUTTON_IDS.START).classList.add('bounce');
                    }, 1000);
                }
            });
            document.getElementById(BUTTON_IDS.SPLASH).addEventListener('click', function (e) {
                if (_this2.walkthroughState == WalkthroughState.Initial) {
                    _this2.rippleModel.applyImpression(_this2.ROWS / 2, _this2.COLUMNS / 2);
                    _this2.play();
                    document.getElementById(BUTTON_IDS.SPLASH).classList.remove('bounce');
                    setTimeout(function () {
                        _this2.stop();
                        document.getElementById(BUTTON_IDS.RANDOM).classList.remove('hidden');
                        document.getElementById(BUTTON_IDS.RANDOM).classList.add('bounce');
                        _this2.walkthroughState = WalkthroughState.Halfway;
                    }, 2000);
                } else {
                    var rowIndex = Math.floor(_this2.ROWS * Math.random());
                    var columnIndex = Math.floor(_this2.ROWS * Math.random());
                    _this2.rippleModel.applyImpression(rowIndex, columnIndex);
                }
            });
            document.getElementById(BUTTON_IDS.START).addEventListener('click', function (e) {
                _this2.play();
                document.getElementById(BUTTON_IDS.START).classList.add('hidden');
                document.getElementById(BUTTON_IDS.STOP).classList.remove('hidden');
                if (_this2.walkthroughState == WalkthroughState.Halfway) {
                    _this2.walkthroughState = WalkthroughState.HighlightStop;
                    document.getElementById(BUTTON_IDS.START).classList.remove('bounce');
                    document.getElementById(BUTTON_IDS.STOP).classList.add('bounce');
                    setTimeout(function () {
                        document.getElementById(BUTTON_IDS.STOP).classList.remove('bounce');
                    }, 5000);
                }
            });
            document.getElementById(BUTTON_IDS.STOP).addEventListener('click', function (e) {
                _this2.stop();
                document.getElementById(BUTTON_IDS.START).classList.remove('hidden');
                document.getElementById(BUTTON_IDS.STOP).classList.add('hidden');
                if (_this2.walkthroughState == WalkthroughState.HighlightStop) {
                    document.getElementById(BUTTON_IDS.STOP).classList.remove('bounce');
                    _this2.walkthroughState = WalkthroughState.Complete;
                }
            });
        }
    }, {
        key: "stop",
        value: function stop() {
            clearInterval(this.interval);
        }
    }, {
        key: "play",
        value: function play() {
            var _this3 = this;

            this.interval = setInterval(function () {
                _this3.iterate();
            }, 100);
        }
    }, {
        key: "handleKeyUp",
        value: function handleKeyUp(_ref) {
            var _this4 = this;

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
                        this.play();
                        setInterval(function () {
                            _this4.iterate();
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
            var _this5 = this;

            var clientX = _ref2.clientX,
                clientY = _ref2.clientY;

            var rect = this.renderer.domElement.getBoundingClientRect();
            var mouse = {
                x: 2 * ((clientX - rect.left) / (rect.right - rect.left)) - 1,
                y: -((clientY - rect.top) / (rect.bottom - rect.top)) * 2 + 1
            };
            this.raycaster.setFromCamera(mouse, this.camera);
            var planeIntersect = this.raycaster.intersectObjects(this.scene.children).find(function (_ref3) {
                var uuid = _ref3.object.uuid;
                return uuid === _this5.planeUUID;
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
            var heightField = this.heightField;
            var velocityField = this.velocityField;
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
                for (var i = 0; i < this.N; i++) {
                    // Left velocity propagation.
                    for (var j = 1; j < this.M; j++) {
                        var index = indexer(i, j);
                        leftDelta[index] = this.roundDecimal(this.S * (heightField[index] - heightField[indexer(i, j - 1)]));
                        velocityField[index] += leftDelta[index];
                        // Clamp to 0.
                        if (velocityField[index] < 0) {
                            velocityField[index] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityField[index]));
                        } else if (velocityField[index] > 0) {
                            velocityField[index] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityField[index]));
                        }
                    }
                    // Right velocity propagation.
                    for (var _j = 0; _j < this.M - 1; _j++) {
                        var _index = indexer(i, _j);
                        rightDelta[_index] = this.roundDecimal(this.S * (heightField[_index] - heightField[indexer(i, _j + 1)]));
                        velocityField[_index] += rightDelta[_index];
                        if (velocityField[_index] < 0) {
                            velocityField[_index] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityField[_index]));
                        } else if (velocityField[_index] > 0) {
                            velocityField[_index] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityField[_index]));
                        }
                    }
                    // Left height propagation
                    for (var _j2 = 1; _j2 < this.M - 1; _j2++) {
                        heightField[indexer(i, _j2 - 1)] += leftDelta[indexer(i, _j2)];
                    }
                    // Right height propagation
                    for (var _j3 = 0; _j3 < this.M - 1; _j3++) {
                        heightField[indexer(i, _j3 + 1)] += rightDelta[indexer(i, _j3)];
                    }
                }
                // End Horizontal propagation.
                // Vertical propagation.
                for (var _j4 = 0; _j4 < this.M; _j4++) {
                    for (var _i = 1; _i < this.N; _i++) {
                        var _index2 = indexer(_i, _j4);
                        topDelta[_index2] = this.roundDecimal(this.S * (heightField[_index2] - heightField[indexer(_i - 1, _j4)]));
                        velocityField[_index2] += topDelta[_index2];
                        if (velocityField[_index2] < 0) {
                            velocityField[_index2] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityField[_index2]));
                        } else if (velocityField[_index2] > 0) {
                            velocityField[_index2] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityField[_index2]));
                        }
                    }
                    for (var _i2 = 0; _i2 < this.N - 1; _i2++) {
                        var _index3 = indexer(_i2, _j4);
                        bottomDelta[_index3] = this.S * (heightField[_index3] - heightField[indexer(_i2 + 1, _j4)]);
                        velocityField[_index3] += bottomDelta[_index3];
                        if (velocityField[_index3] < 0) {
                            velocityField[_index3] = Math.max(-1 * this.TERMINAL_VELOCITY, this.roundDecimal(velocityField[_index3]));
                        } else if (velocityField[_index3] > 0) {
                            velocityField[_index3] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityField[_index3]));
                        }
                    }
                    for (var _i3 = 1; _i3 < this.N; _i3++) {
                        heightField[indexer(_i3 - 1, _j4)] += topDelta[indexer(_i3, _j4)];
                    }
                    for (var _i4 = 0; _i4 < this.N - 1; _i4++) {
                        heightField[indexer(_i4 + 1, _j4)] += bottomDelta[indexer(_i4, _j4)];
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
    function SpringModel(N, M) {
        _classCallCheck(this, SpringModel);

        this.N = N;
        this.M = M;
        // Physics parameters.
        this.K = 0.03; // Hooke's constant
        this.D = 0.025; // Dampening Factor
        this.TERMINAL_VELOCITY = 1.5;
        this.heightField = new Array(N * M).fill(0);
        this.velocityField = new Array(N * M).fill(0);
        this.indexer = utilities_1.getSingleBufferRowMajorMatrixIndexer(M);
    }

    _createClass(SpringModel, [{
        key: "iterate",
        value: function iterate() {
            var indexer = this.indexer;
            var heightField = this.heightField;
            var velocityField = this.velocityField;
            var rowNum = this.N;
            while (rowNum--) {
                var colNum = this.M;
                while (colNum--) {
                    var index = indexer(rowNum, colNum);
                    var velocity = velocityField[index];
                    heightField[index] += velocity;
                    var targetHeight = 0;
                    var height = heightField[index];
                    var x = height - targetHeight;
                    var acceleration = -1 * this.K * x - this.D * velocity;
                    velocityField[index] += this.roundDecimal(acceleration);
                    velocityField[index] = Math.min(this.TERMINAL_VELOCITY, this.roundDecimal(velocityField[index]));
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
            var i = this.heightField.length;
            var heightBuffer = new Array(i);
            while (i--) {
                heightBuffer[i] = this.heightField[i];
            }return heightBuffer;
        }
    }, {
        key: "initRandomHeight",
        value: function initRandomHeight() {
            var indexer = this.indexer;
            var m = this.M;
            var n = this.N;
            var heightField = this.heightField;
            // Seed the first cell.
            heightField[indexer(0, 0)] = Math.floor(10 * Math.random()) * utilities_1.getRandomDirection();
            // Random walk along first row.
            for (var j = 1; j < m; j++) {
                var neighborHeight = heightField[indexer(0, j - 1)];
                heightField[indexer(0, j)] = neighborHeight + utilities_1.getRandomDirection();
            }
            // Random walk along first column.
            for (var i = 1; i < n; i++) {
                var _neighborHeight = heightField[indexer(i - 1, 0)];
                heightField[indexer(i, 0)] = _neighborHeight + utilities_1.getRandomDirection();
            }
            // Loop over inner cells, assigning height as +-1 from midpoint of top and left neighbor
            for (var _i = 1; _i < n; _i++) {
                for (var _j = 1; _j < m; _j++) {
                    var topNeighbor = heightField[indexer(_i - 1, _j)];
                    var leftNeighbor = heightField[indexer(_i, _j - 1)];
                    var midpoint = (topNeighbor + leftNeighbor) / 2;
                    heightField[indexer(_i, _j)] = Math.round(midpoint) + utilities_1.getRandomDirection();
                }
            }
        }
    }]);

    return SpringModel;
}();

exports.SpringModel = SpringModel;

/***/ })
/******/ ]);