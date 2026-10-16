type PreparedVoice = {
  durationSeconds: number
  file: File
}

function writeAscii(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index))
  }
}

function encodeWave(channels: Float32Array[], sampleRate: number) {
  const channelCount = channels.length
  const frameCount = channels[0]?.length ?? 0
  const bytesPerSample = 2
  const blockAlign = channelCount * bytesPerSample
  const buffer = new ArrayBuffer(44 + frameCount * blockAlign)
  const view = new DataView(buffer)

  writeAscii(view, 0, 'RIFF')
  view.setUint32(4, 36 + frameCount * blockAlign, true)
  writeAscii(view, 8, 'WAVE')
  writeAscii(view, 12, 'fmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, channelCount, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true)
  writeAscii(view, 36, 'data')
  view.setUint32(40, frameCount * blockAlign, true)

  let offset = 44
  for (let frame = 0; frame < frameCount; frame += 1) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channels[channel][frame] ?? 0))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += bytesPerSample
    }
  }

  return new Blob([buffer], { type: 'audio/wav' })
}

async function decodeBlobs(blobs: Blob[]) {
  const context = new AudioContext()
  try {
    return await Promise.all(
      blobs.map(async (blob) => context.decodeAudioData(await blob.arrayBuffer())),
    )
  } finally {
    await context.close()
  }
}

export async function joinVoiceParts(parts: Blob[]): Promise<PreparedVoice> {
  const buffers = await decodeBlobs(parts)
  const sampleRate = buffers[0]?.sampleRate ?? 48_000
  const channelCount = Math.max(1, ...buffers.map((buffer) => buffer.numberOfChannels))
  const frameCount = buffers.reduce((sum, buffer) => sum + buffer.length, 0)
  const channels = Array.from({ length: channelCount }, () => new Float32Array(frameCount))
  let writeOffset = 0

  for (const buffer of buffers) {
    for (let channel = 0; channel < channelCount; channel += 1) {
      const sourceChannel = buffer.getChannelData(Math.min(channel, buffer.numberOfChannels - 1))
      channels[channel].set(sourceChannel, writeOffset)
    }
    writeOffset += buffer.length
  }

  const blob = encodeWave(channels, sampleRate)
  return {
    durationSeconds: Math.ceil(frameCount / sampleRate),
    file: new File([blob], `voice-combined-${Date.now()}.wav`, { type: blob.type }),
  }
}

export async function trimVoicePart(
  source: Blob,
  startSeconds: number,
  endSeconds: number,
): Promise<PreparedVoice> {
  const [buffer] = await decodeBlobs([source])
  const startFrame = Math.max(0, Math.floor(startSeconds * buffer.sampleRate))
  const endFrame = Math.min(buffer.length, Math.ceil(endSeconds * buffer.sampleRate))
  if (endFrame <= startFrame) throw new Error('Конец фрагмента должен быть позже начала.')

  const channels = Array.from({ length: buffer.numberOfChannels }, (_, channel) =>
    buffer.getChannelData(channel).slice(startFrame, endFrame),
  )
  const blob = encodeWave(channels, buffer.sampleRate)
  return {
    durationSeconds: Math.ceil((endFrame - startFrame) / buffer.sampleRate),
    file: new File([blob], `voice-trimmed-${Date.now()}.wav`, { type: blob.type }),
  }
}
