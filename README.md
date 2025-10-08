
# Preview
![preview](https://raw.githubusercontent.com/varrockbank/WaveSimulator/master/preview.gif)

### [Live Demo](https://varrockbank.github.io/WaveSimulator/dist/index.html)

# Commentary
This project is intended to demonstrate my abilities spanning:

- Numerical computation 
- ES6 JavaScript
- TypeScript and, more generally, type-safe languages
- DOM, events and miscellaneous aspects of the browser platform
- Programming style and code quality
- Writing clean and maintainable code, albeit the subject (wave simulation) is non-trivial
- OOP design
- Functional programming and minimizing state
- Object mutations vs cloning
- Refactoring (see commit history)
- Submitting small incremental commits (see commit history)
- Performance optimizations (see commit history):
  - Reduce function calls
  - Reduce object dereferences and store reference locally
  - Use 1-d buffer to represent 2-d matrix
  - Special-case looping styles
  - Avoiding premature optimizations, programming against higher abstractions first

# Stack
- three.js 88dev
  - OrbitControls
  - Detector
  - Lighting
  - Shadows
- typescript 2.x
- webpack 3.x

## Get started
```
npm install # or yarn
npm run build
```

## Build
```
npm run build
```

## Commands
```
npm install # or yarn
npm run build
npm run watch
```
