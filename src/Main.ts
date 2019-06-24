// //////////////////////////////////////////////////////////////////////////////////////
// //
// //  Copyright (c) 2014-present, Egret Technology.
// //  All rights reserved.
// //  Redistribution and use in source and binary forms, with or without
// //  modification, are permitted provided that the following conditions are met:
// //
// //     * Redistributions of source code must retain the above copyright
// //       notice, this list of conditions and the following disclaimer.
// //     * Redistributions in binary form must reproduce the above copyright
// //       notice, this list of conditions and the following disclaimer in the
// //       documentation and/or other materials provided with the distribution.
// //     * Neither the name of the Egret nor the
// //       names of its contributors may be used to endorse or promote products
// //       derived from this software without specific prior written permission.
// //
// //  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
// //  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
// //  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
// //  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
// //  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
// //  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
// //  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
// //  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
// //  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
// //  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
// //
// //////////////////////////////////////////////////////////////////////////////////////


function createCanvas(width: number, height: number): HTMLCanvasElement {
    const canvas: HTMLCanvasElement = document.createElement("canvas");
    canvas.width = +width;
    canvas.height = +height;
    return canvas;
}

function queryContainer(): HTMLDivElement {
    const list = document.querySelectorAll(".egret-player");
    if (list.length > 0) {
        return list[0] as HTMLDivElement;
    }
    return null;
}

function attachCanvasToContainer(container: HTMLElement, canvas: HTMLCanvasElement): void {
    let style = canvas.style;
    style.cursor = "inherit";
    style.position = "absolute";
    style.top = "0";
    style.bottom = "0";
    style.left = "0";
    style.right = "0";
    container.appendChild(canvas);
    style = container.style;
    style.overflow = "hidden";
    style.position = "absolute";
}

const version: string = '0.0.1';
function main(): void {
    //
    console.log('webgl2 demo version = ' + version);
    //
    const canvas = createCanvas(window.innerWidth, window.innerHeight);
    const container = queryContainer();
    attachCanvasToContainer(container, canvas);
    //
    // const ctx2d = canvas.getContext('2d');
    // ctx2d.fillStyle = 'black';
    // ctx2d.fillRect(0, 0, canvas.width, canvas.height);
}


