import AVFoundation
import CoreMedia

// Reads a clip, then writes it forward followed by its own reverse, so the
// end of the file is identical to its start and the loop has no seam.

let src = URL(fileURLWithPath: CommandLine.arguments[1])
let dst = URL(fileURLWithPath: CommandLine.arguments[2])
let bitrate = Int(CommandLine.arguments[3]) ?? 2_200_000

let asset = AVURLAsset(url: src)
guard let track = asset.tracks(withMediaType: .video).first else {
    print("no video track"); exit(1)
}
let size = track.naturalSize
let fps  = track.nominalFrameRate > 0 ? track.nominalFrameRate : 25

let reader = try AVAssetReader(asset: asset)
let output = AVAssetReaderTrackOutput(
    track: track,
    outputSettings: [kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA])
reader.add(output)
reader.startReading()

var frames: [CVPixelBuffer] = []
while let sample = output.copyNextSampleBuffer() {
    if let pb = CMSampleBufferGetImageBuffer(sample) { frames.append(pb) }
}
print("read \(frames.count) frames at \(Int(size.width))x\(Int(size.height)), \(fps) fps")
guard frames.count > 2 else { print("too few frames"); exit(1) }

// Forward, then back down without repeating either endpoint: a repeated
// first or last frame reads as a stutter at the turn.
let sequence = frames + frames.dropFirst().dropLast().reversed()

try? FileManager.default.removeItem(at: dst)
let writer = try AVAssetWriter(outputURL: dst, fileType: .mp4)
let input = AVAssetWriterInput(mediaType: .video, outputSettings: [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: Int(size.width),
    AVVideoHeightKey: Int(size.height),
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: bitrate,
        AVVideoMaxKeyFrameIntervalKey: 60,
        AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel
    ]
])
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(
    assetWriterInput: input,
    sourcePixelBufferAttributes: [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
        kCVPixelBufferWidthKey as String: Int(size.width),
        kCVPixelBufferHeightKey as String: Int(size.height)
    ])
writer.add(input)
writer.startWriting()
writer.startSession(atSourceTime: .zero)

let frameDuration = CMTime(value: 1, timescale: CMTimeScale(round(fps)))
for (i, pb) in sequence.enumerated() {
    while !input.isReadyForMoreMediaData { usleep(2000) }
    let t = CMTimeMultiply(frameDuration, multiplier: Int32(i))
    if !adaptor.append(pb, withPresentationTime: t) {
        print("append failed at \(i): \(writer.error?.localizedDescription ?? "?")"); exit(1)
    }
}
input.markAsFinished()

let done = DispatchSemaphore(value: 0)
writer.finishWriting { done.signal() }
done.wait()

if writer.status == .completed {
    let bytes = (try? FileManager.default.attributesOfItem(atPath: dst.path)[.size] as? Int) ?? 0
    print("wrote \(sequence.count) frames, \(String(format: "%.1f", Double(sequence.count) / Double(fps)))s, \(String(format: "%.2f", Double(bytes ?? 0) / 1e6)) MB")
} else {
    print("failed: \(writer.error?.localizedDescription ?? "?")"); exit(1)
}
