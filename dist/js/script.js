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
        this.ROWS = 20;
        this.COLUMNS = 20;
        this.PLANE_WIDTH = 100;
        this.PLANE_HEIGHT = 100;
        this.CELL_HEIGHT = this.PLANE_HEIGHT / this.ROWS;
        this.CELL_WIDTH = this.PLANE_WIDTH / this.COLUMNS;
        // Key press to trigger a simulation cycle.
        this.ITERATION_TRIGGER_KEY = 'x';
        // Instance Scene.
        this.scene = new THREE.Scene();
        // Instantiate Camera.
        this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1, 1000);
        this.camera.position.set(0, -70, 50);
        // Instantiate render.
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setClearColor(0xFFFFFF);
        this.renderer.setSize(this.width, this.height);
        document.body.appendChild(this.renderer.domElement);
        // Instantiate controls.
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        // Instantiate raycaster.
        this.raycaster = new THREE.Raycaster();
        var geometry = new THREE.PlaneGeometry(this.PLANE_WIDTH, this.PLANE_HEIGHT, this.ROWS, this.COLUMNS);
        var material = new THREE.MeshBasicMaterial({
            color: 0x333333,
            wireframe: true
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
    }

    _createClass(Engine, [{
        key: "iterate",
        value: function iterate() {
            var heightMap = this.heightMap;
            // Move height at constant speed of 1 towards 0.
            for (var i = 0; i < heightMap.length; i++) {
                var row = heightMap[i];
                for (var j = 0; j < row.length; j++) {
                    if (row[j] > 0) {
                        row[j]--;
                    } else if (row[j] < 0) {
                        row[j]++;
                    }
                    var height = row[j];
                    var verticeIndex = this.getVerticeIndex(i, j);
                    this.updateGeometry(verticeIndex, height);
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
        key: "initializeHeightMap",
        value: function initializeHeightMap() {
            var heightMap = new Array(this.ROWS + 1);
            for (var i = 0; i < heightMap.length; i++) {
                heightMap[i] = new Array(this.COLUMNS + 1).fill(0);
            }
            this.heightMap = heightMap;
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
            for (var _j = 1; _j < this.COLUMNS + 1; _j++) {
                for (var _i = 1; _i < this.ROWS + 1; _i++) {
                    var topNeighbor = heightMap[_i - 1][_j];
                    var leftNeighbor = heightMap[_i][_j - 1];
                    var midpoint = (topNeighbor + leftNeighbor) / 2;
                    heightMap[_i][_j] = Math.round(midpoint) + this.getRandomDirection();
                }
            }
            // Map heightMap to geometry
            for (var _i2 = 0; _i2 < heightMap.length; _i2++) {
                var row = heightMap[_i2];
                for (var _j2 = 0; _j2 < row.length; _j2++) {
                    var _height2 = row[_j2];
                    var verticeIndex = this.getVerticeIndex(_i2, _j2);
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
            var key = event.key;

            if (key.toLowerCase() == this.ITERATION_TRIGGER_KEY) {
                this.iterate();
            }
        }
    }, {
        key: "handleClick",
        value: function handleClick(event) {
            var _this3 = this;

            // calculate mouse position in normalized device coordinates
            // (-1 to +1) for both components
            var x = event.clientX / window.innerWidth * 2 - 1;
            var y = -(event.clientY / window.innerHeight) * 2 + 1;
            var mouse = { x: x, y: y };
            this.raycaster.setFromCamera(mouse, this.camera);
            var intersects = this.raycaster.intersectObjects(this.scene.children);
            var planeIntersect = intersects.find(function (intersect) {
                return intersect.object.uuid === _this3.planeUUID;
            });
            if (planeIntersect) {
                var _planeIntersect$point = planeIntersect.point,
                    _x = _planeIntersect$point.x,
                    _y = _planeIntersect$point.y;
                // These are sequenced to match the vertices indexing.

                var columnIndex = Math.round(_x / this.CELL_WIDTH) + this.COLUMNS / 2;
                var rowIndex = -1 * Math.round(_y / this.CELL_HEIGHT) + this.ROWS / 2;
                var verticeIndex = this.getVerticeIndex(rowIndex, columnIndex);
                this.updateGeometry(verticeIndex);
                this.refreshGeometry();
            }
        }
    }, {
        key: "getVerticeIndex",
        value: function getVerticeIndex(rowIndex, columnIndex) {
            return rowIndex * (this.COLUMNS + 1) + columnIndex;
        }
    }]);

    return Engine;
}();

exports.Engine = Engine;

/***/ })
/******/ ]);