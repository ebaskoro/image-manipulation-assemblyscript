# Image Manipulation using AssemblyScript

## Introduction
This repository is a demonstration how we can use [AssemblyScript](https://www.assemblyscript.org) to manipulate an image in a browser.

This is an adaptation of [Image Manipulation using WebAssembly and C](https://github.com/ebaskoro/image-manipulation-wasm-c) project.

## Getting Started
Clone this repository using Codespace.
```
$ git clone https://github.com/ebaskoro/image-manipulation-assemblyscript
```

Build the project:
```
$ npm run asbuild
```

Run the project:
```
$ npm start
```

Open a browser and browse to `http://localhost:3000`

## Walkthrough
Initiate an AssemblyScript project in the current directory:
```
$ npx asinit .
```

Create additional folder structure as below:
```
.
├── img
└── js
```

Edit `index.ts` file in the `assembly` folder. Create the first exportable function to adjust the RGBA channels of an image:
```TypeScript
export function adjust(length: i32, rAdjustment: f32, gAdjustment: f32, bAdjustment: f32, aAdjustment: f32): void {
    for (let i = 0; i < length; i += 4) {
        const r = load<u8>(i);
        let newR = <u8>(r * rAdjustment);
        newR = (newR > 255) ? 255 : ((newR < 0) ? 0 : newR);
        store<u8>(i, newR);

        const g = load<u8>(i + 1);
        let newG = <u8>(g * gAdjustment);
        newG = (newG > 255) ? 255 : ((newG < 0) ? 0 : newG);
        store<u8>(i + 1, newG);
        
        const b = load<u8>(i + 2);
        let newB = <u8>(b * bAdjustment);
        newB = (newB > 255) ? 255 : ((newB < 0) ? 0 : newB);
        store<u8>(i + 2, newB);

        const a = load<u8>(i + 3);
        let newA = <u8>(a * (1 - aAdjustment));
        newA = (newA > 255) ? 255 : ((newA < 0) ? 0 : newA);
        store<u8>(i + 3, newA);
    }
}
```
Here we will be using imported memory to load and store the image data passed from the JavaScript API.

Next we define the _Sephia_ filter:
```TypeScript
export function sephia(length: i32): void {
    for (let i = 0; i < length; i += 4) {
        const r = load<u8>(i);
        const g = load<u8>(i + 1);
        const b = load<u8>(i + 2);

        const y = <u8>((r * 0.3) + (g * 0.59) + (b * 0.11));

        store<u8>(i, y);
        store<u8>(i + 1, y);
        store<u8>(i + 2, y);
    }
}
```

Next we define the _gray scale_ filter:
```TypeScript
export function grayScale(length: i32): void {
    for (let i = 0; i < length; i += 4) {
        const r = load<u8>(i);
        const g = load<u8>(i + 1);
        const b = load<u8>(i + 2);
        const a = load<u8>(i + 3);

        store<u8>(i, r);
        store<u8>(i + 1, r);
        store<u8>(i + 2, r);
        store<u8>(i + 3, a);
    }
}
```

Next we define the _invert_ filter:
```TypeScript
export function invert(length: i32): void {
    for (let i = 0; i < length; i += 4) {
        const r = load<u8>(i);
        const g = load<u8>(i + 1);
        const b = load<u8>(i + 2);

        store<u8>(i, 255 - r);
        store<u8>(i + 1, 255 - g);
        store<u8>(i + 2, 255 - b);
    }
}
```

Next we define the _noise_ filter:
```TypeScript
export function noise(length: i32): void {
    for (let i = 0; i < length; i += 4) {
        const r = load<u8>(i);
        const g = load<u8>(i + 1);
        const b = load<u8>(i + 2);

        const random = <u8>((Math.random() * 100 % 70) - 35);

        store<u8>(i, r + random);
        store<u8>(i + 1, g + random);
        store<u8>(i + 2, b + random);
    }
}
```

Edit `asconfig.json` to add an option to the compiler to import memory:
```json
{
  "targets": {
    "debug": {
      "outFile": "build/debug.wasm",
      "textFile": "build/debug.wat",
      "sourceMap": true,
      "debug": true
    },
    "release": {
      "outFile": "build/release.wasm",
      "textFile": "build/release.wat",
      "sourceMap": true,
      "optimizeLevel": 3,
      "shrinkLevel": 0,
      "converge": false,
      "noAssert": false
    }
  },
  "options": {
    "bindings": "esm",
    "importMemory": true
  }
}
```

Build the project:
```
$ npm run asbuild
```

Copy [image.jpg](./img/image.jpg) to the `img` folder.

Copy [index.html](./index.html) and replace the existing file with this version.

Copy [app.js](./js/app.js) to the `js` folder.