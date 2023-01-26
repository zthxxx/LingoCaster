#!/bin/bash

# fade effect 0.3s between each pictures per 1.5s
ffmpeg \
  -loop 1 -i metadata/lingo-caster-1.png \
  -loop 1 -i metadata/lingo-caster-2.png \
  -loop 1 -i metadata/lingo-caster-3.png \
  -loop 1 -i metadata/lingo-caster-4.png \
  -filter_complex "
    [1:v]fade=t=in:st=$((1.8*1-0.3)):d=0.3:alpha=1[fade1];
    [2:v]fade=t=in:st=$((1.8*2-0.3)):d=0.3:alpha=1[fade2];
    [3:v]fade=t=in:st=$((1.8*3-0.3)):d=0.3:alpha=1[fade3];
    [0:v]fade=t=in:st=$((1.8*4-0.3)):d=0.3:alpha=1[fade4];
        [0:v][fade1]overlay[fade0-1];
    [fade0-1][fade2]overlay[fade1-2];
    [fade1-2][fade3]overlay[fade2-3];
    [fade2-3][fade4]overlay
  " \
  -t 7.2 -c:v libwebp -r 20 -loop 0 -preset default \
  -lossless 0 -compression_level 6 -q:v 30 -an \
  metadata/preview.webp
