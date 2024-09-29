#!/usr/bin/env ts-node
// SPDX-License-Identifier: BSD-2-Clause
// Copyright (c) 2018 Jakub Červený

export default function gilbert2d(width: number, height: number): Array<[number, number]> {
    /**
     * Generalized Hilbert ('gilbert') space-filling curve for arbitrary-sized
     * 2D rectangular grids. Generates discrete 2D coordinates to fill a rectangle
     * of size (width x height).
     */
    const curve = new Array<[number, number]>;

    if (width >= height) {
        generate2d(0, 0, width, 0, 0, height, curve);
    } else {
        generate2d(0, 0, 0, height, width, 0, curve);
    }

    return curve;
}

function sgn(x: number): number {
    return x < 0 ? -1 : (x > 0 ? 1 : 0);
}

function generate2d(x: number, y: number, ax: number, ay: number, bx: number, by: number, curve: Array<[number, number]>) {
    const w = Math.abs(ax + ay);
    const h = Math.abs(bx + by);

    const dax = sgn(ax), day = sgn(ay); // unit major direction
    const dbx = sgn(bx), dby = sgn(by); // unit orthogonal direction

    if (h === 1) {
        // trivial row fill
        for (let i = 0; i < w; i++) {
            curve.push([x, y]);
            x += dax;
            y += day;
        }
        return;
    }

    if (w === 1) {
        // trivial column fill
        for (let i = 0; i < h; i++) {
            curve.push([x, y]);
            x += dbx;
            y += dby;
        }
        return;
    }

    let ax2 = Math.floor(ax / 2), ay2 = Math.floor(ay / 2);
    let bx2 = Math.floor(bx / 2), by2 = Math.floor(by / 2);

    const w2 = Math.abs(ax2 + ay2);
    const h2 = Math.abs(bx2 + by2);

    if (2 * w > 3 * h) {
        if (w2 % 2 !== 0 && w > 2) {
            // prefer even steps
            ax2 += dax;
            ay2 += day;
        }

        // long case: split in two parts only
        generate2d(x, y, ax2, ay2, bx, by, curve);
        generate2d(x + ax2, y + ay2, ax - ax2, ay - ay2, bx, by, curve);
    } else {
        if (h2 % 2 !== 0 && h > 2) {
            // prefer even steps
            bx2 += dbx;
            by2 += dby;
        }

        // standard case: one step up, one long horizontal, one step down
        generate2d(x, y, bx2, by2, ax2, ay2, curve);
        generate2d(x + bx2, y + by2, ax, ay, bx - bx2, by - by2, curve);
        generate2d(x + (ax - dax) + (bx2 - dbx), y + (ay - day) + (by2 - dby), -bx2, -by2, -(ax - ax2), -(ay - ay2), curve);
    }
}