# _tools

## pingpong.swift

Makes a seamless background loop out of a short clip by writing it forward and
then in reverse, so the last frame is one step away from the first and the loop
has no visible cut.

    swift _tools/pingpong.swift <source.mp4> <out.mp4> [bitrate]

`hero-loop.mp4` was built from `hero-video.mp4` at 2,200,000 bps: 122 frames in,
242 out, 10.1s, 2.9 MB. Output is H.264 so every browser can play it.

Note the source clip carries the Vidu AI watermark in the bottom right corner,
hidden by a crop in `.env-video` in style.css rather than removed from the file.
