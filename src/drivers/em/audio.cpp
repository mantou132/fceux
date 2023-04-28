/* FCE Ultra - NES/Famicom Emulator - Emscripten audio
 *
 * Copyright notice for this file:
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
#include "../../utils/memory.h"
#include "../../fceu.h"
#include <emscripten.h>

// DEBUG: Define a test to output a sine tone.
#define TEST_SINE_AT_FILL   0
#define TEST_SINE_AT_WRITE  0

extern int EmulationPaused; // defined in fceu.cpp

int em_audio_rate = 44100;

static float *s_buffer = 0;
static int s_buffer_read = 0;
static int s_buffer_write = 0;
static int s_buffer_count = 0;

static bool s_muted = false;

#if TEST_SINE_AT_FILL || TEST_SINE_AT_WRITE
#include <math.h>
static double test_sine_phase = 0.0;
#endif

// Callback for filling HW audio buffer, exposed to js.
extern "C" float* audioBufferCallback()
{
    return s_buffer;
}

static void SetSampleRate(int sample_rate)
{
    em_audio_rate = sample_rate;
    FCEUI_Sound(em_audio_rate);
}

bool Audio_Init()
{
    if (s_buffer) {
        return true;
    }

    s_buffer = (float*) FCEU_dmalloc(sizeof(float) * AUDIO_BUF_MAX);
    if (!s_buffer) {
        FCEUD_PrintError("Failed to create audio buffer.");
        return false;
    }
    s_buffer_read = s_buffer_write = s_buffer_count = 0;

    FCEUI_SetSoundVolume(150); // Maximum volume.
    FCEUI_SetSoundQuality(0); // Low quality.
    SetSampleRate(44100);
    FCEUI_SetTriangleVolume(256);
    FCEUI_SetSquare1Volume(256);
    FCEUI_SetSquare2Volume(256);
    FCEUI_SetNoiseVolume(256);
    FCEUI_SetPCMVolume(256);
    return true;
}

void Audio_Write(int32 *buf, int count)
{
    if (EmulationPaused || (count <= 0)) {
        return;
    }

    for (int i = 0; i < 44100 / 60; i++) {
        if (i < count) {
            s_buffer[i] = buf[i] * (1 / 32768.0);
        } else {
            s_buffer[i] = buf[count - 1] * (1 / 32768.0);
        }
    }
}

void Audio_SetMuted(bool muted)
{
    s_muted = muted;
}

bool Audio_Muted()
{
    return s_muted;
}
