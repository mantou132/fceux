/* FCE Ultra - NES/Famicom Emulator - Emscripten video/window
 *
 * Copyright notice for this file:
 *  Copyright (C) 2002 Xodnizel
 *  Copyright (C) 2015 Valtteri "tsone" Heikkila
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301  USA
 */
#include "em.h"
#include "es2.h"
#include "../../fceu.h"
#include "../../video.h"
#include "../../utils/memory.h"
#include <emscripten.h>
#include <emscripten/html5.h>


extern uint8 *XBuf;
extern uint8 deempScan[240];
extern uint8 PALRAM[0x20];

static int s_inited;

static int s_canvas_width, s_canvas_height;


// Functions only needed for linking.
void SetOpenGLPalette(uint8*) {}
void FCEUD_SetPalette(uint8, uint8, uint8, uint8) {}
void FCEUD_GetPalette(uint8 index, uint8 *r, uint8 *g, uint8 *b)
{
    *r = *g = *b = 0;
}

bool FCEUD_ShouldDrawInputAids()
{
    return false;
}

static double GetAspect()
{
    // Aspect is adjusted with CRT TV pixel aspect to get proper look.
    // In-depth details can be found here:
    //   http://wiki.nesdev.com/w/index.php/Overscan
    // While 8:7 pixel aspect is probably correct, this uses 292:256 as it
    // looks better on LCD. This assumes square pixel aspect in output.
    return (256.0/em_scanlines) * (292.0/256.0);
}

static void Resize(int width, int height)
{
    s_canvas_width = width;
    s_canvas_height = height;

    ES2_SetViewport(s_canvas_width, s_canvas_height);
}

void FCEUD_VideoChanged()
{
    PAL = FSettings.PAL ? 1 : 0;
    em_scanlines = FSettings.PAL ? 240 : 224;

    ES2_VideoChanged();
}

void RefreshThrottleFPS()
{
    FCEUD_VideoChanged();
}

void Video_ResizeCanvas()
{
    int width = EM_ASM_INT({ return Module.ctx.canvas.width; });
    int height = EM_ASM_INT({ return Module.ctx.canvas.height; });
    Resize(width, height);
}

void Video_Render()
{
    ES2_Render(XBuf, deempScan, PALRAM[0]);
}

// Return 0 on success, -1 on failure.
int Video_Init(const char* canvasQuerySelector)
{
    if (s_inited) {
        return 0;
    }

    FCEU_printf("Initializing WebGL.\n");
    if (!ES2_Init(canvasQuerySelector, GetAspect())) {
        FCEUD_PrintError("Failed to initialize video, WebGL not supported.");
        return 0;
    }

    s_inited = 1;
    return 0;
}

void Video_CanvasToNESCoords(uint32 *x, uint32 *y)
{
    *x = INPUT_W * (*x) / s_canvas_width;
    *y = em_scanlines * (*y) / s_canvas_height;
    *y += (INPUT_H - em_scanlines) / 2;
}
