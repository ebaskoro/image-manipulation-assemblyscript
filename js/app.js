class PageObject {

    constructor() {
        this.canvases = document.getElementById("canvases");
        this.originals = document.querySelectorAll('[x-id="original"]');
        this.originalCanvas = document.getElementById('original');
        this.redAdjustmentSlider = document.querySelector('[x-id="redAdjustment"]');
        this.redAdjustmentTooltip = document.querySelector('output[for="redAdjustment"]');
        this.greenAdjustmentSlider = document.querySelector('[x-id="greenAdjustment"]');
        this.greenAdjustmentTooltip = document.querySelector('output[for="greenAdjustment"]');
        this.blueAdjustmentSlider = document.querySelector('[x-id="blueAdjustment"]');
        this.blueAdjustmentTooltip = document.querySelector('output[for="blueAdjustment"]');
        this.alphaAdjustmentSlider = document.querySelector('[x-id="alphaAdjustment"]');
        this.alphaAdjustmentTooltip = document.querySelector('output[for="alphaAdjustment"]');
        this.loader = document.getElementById('loader');
        this.download = document.getElementById('download');
    }


    showOriginalImages(imageBitmap) {
        this.originalImageBitmap = imageBitmap;

        const div = document.createElement("div");
        div.className = "tile is-2 is-clipped";
        this.canvases.appendChild(div);
        
        const canvas = document.createElement("canvas");
        canvas.width = imageBitmap.width;
        canvas.height = imageBitmap.height;
        div.appendChild(canvas);

        const context = canvas.getContext("2d");
        context.drawImage(imageBitmap, 0, 0);

        this.originals.forEach(element => {
            const canvas = document.createElement("canvas");
            canvas.width = imageBitmap.width;
            canvas.height = imageBitmap.height;
            element.appendChild(canvas);

            const context = canvas.getContext("2d");
            context.drawImage(imageBitmap, 0, 0);
        });

        this.originalImageData = context.getImageData(0, 0, imageBitmap.width, imageBitmap.height);
    }


    createCanvas(data) {
        const div = document.createElement("div");
        div.className = "tile is-2 is-clipped";
        this.canvases.appendChild(div);

        const canvas = document.createElement("canvas");
        canvas.width = this.originalImageBitmap.width;
        canvas.height = this.originalImageBitmap.height;
        div.appendChild(canvas);
        
        const context = canvas.getContext("2d");
        var imageData = context.createImageData(this.originalImageBitmap.width, this.originalImageBitmap.height);
        imageData.data.set(data);
        context.putImageData(imageData, 0, 0);
    }


    showImageSliders(slidersChangedHandler) {
        this.originalCanvas.width = this.originalImageData.width;
        this.originalCanvas.height = this.originalImageData.height;
        const context = this.originalCanvas.getContext('2d');
        var imageData = context.createImageData(this.originalImageData.width, this.originalImageData.height);
        imageData.data.set(this.originalImageData.data);
        context.putImageData(imageData, 0, 0)

        const updateImage = () => {
            const rAdjustment = this.redAdjustmentSlider.value;
            this.redAdjustmentTooltip.textContent = rAdjustment;

            const gAdjustment = this.greenAdjustmentSlider.value;
            this.greenAdjustmentTooltip.textContent = gAdjustment;

            const bAdjustment = this.blueAdjustmentSlider.value;
            this.blueAdjustmentTooltip.textContent = bAdjustment;

            const aAdjustment = this.alphaAdjustmentSlider.value;
            this.alphaAdjustmentTooltip.textContent = aAdjustment;

            const data = slidersChangedHandler(rAdjustment, gAdjustment, bAdjustment, aAdjustment);
            imageData.data.set(data);

            context.putImageData(imageData, 0, 0);
        }

        this.redAdjustmentSlider.addEventListener('input', updateImage);
        this.greenAdjustmentSlider.addEventListener('input', updateImage);
        this.blueAdjustmentSlider.addEventListener('input', updateImage);
        this.alphaAdjustmentSlider.addEventListener('input', updateImage);

        this.download.addEventListener('click', () => {
            this.download.href = this.originalCanvas.toDataURL();
        });
    }


    hideLoader() {
        this.loader.className = 'pageloader';
    }

}


class WasmApp {

    constructor(pageObject) {
        this.pageObject = pageObject;
    }


    async initialiseApp() {
        await this.loadImage('./img/image.jpg');
        this.pageObject.showOriginalImages(this.imageBitmap);

        const { length } = this.pageObject.originalImageData.data;
        const memory = new WebAssembly.Memory({
            initial: ((length + 0xffff) & ~0xffff) >>> 16
        });

        this.wasm = await WebAssembly.instantiateStreaming(fetch('./build/release.wasm'), {
            env: {
                memory,
                abort: (_message, _file, line, column) => console.error(`Abort at ${line}:${column}`),
                seed: () => new Date().getTime()
            }
        });

        this.buffer = new Uint8ClampedArray(memory.buffer);

        this.applyFilterAndShow('adjust', 0.5, 0.5, 0.9, 0.0);
        this.applyFilterAndShow('sephia');
        this.applyFilterAndShow('grayScale');
        this.applyFilterAndShow('invert');
        this.applyFilterAndShow('noise');

        this.pageObject.showImageSliders((rAdjustment, gAdjustment, bAdjustment, aAdjustment) => this.applyFilter('adjust', rAdjustment, gAdjustment, bAdjustment, aAdjustment));
        
        this.pageObject.hideLoader();
    }


    applyFilter(filter) {
        this.buffer.set(this.pageObject.originalImageData.data);

        const { length } = this.pageObject.originalImageData.data;
        const args = [length].concat(...Array.prototype.slice.call(arguments, 1));
        this.wasm.instance.exports[filter](...args);

        return this.buffer.subarray(0, length);
    }


    applyFilterAndShow(filter) {
        this.pageObject.createCanvas(this.applyFilter(filter, ...Array.prototype.slice.call(arguments, 1)));
    }


    async loadImage(url) {
        const response = await fetch(url);
        const blob = await response.blob();
        this.imageBitmap = await createImageBitmap(blob);
    }

}


export {
    PageObject,
    WasmApp
};