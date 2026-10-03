// Zero-dependency pure TypeScript PKZIP generator
// Compatible with all operating systems (macOS Archive Utility, Windows Explorer, Linux unzip)

export interface ZipFileEntry {
  filename: string;
  content: string | Uint8Array;
}

// Pre-computed CRC32 table
const CRC32_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC32_TABLE[i] = c >>> 0;
}

function computeCrc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ CRC32_TABLE[(crc ^ data[i]) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Convert Date to MS-DOS Time and Date
function getDosTimeAndDate(date: Date = new Date()): { time: number; date: number } {
  const time =
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((Math.floor(date.getSeconds() / 2) & 0x1f) << 0);
  const dosDate =
    (((date.getFullYear() - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    ((date.getDate() & 0x1f) << 0);
  return { time, date: dosDate };
}

export function createZipArchive(files: ZipFileEntry[]): Blob {
  const encoder = new TextEncoder();
  const fileRecords: {
    filenameBytes: Uint8Array;
    dataBytes: Uint8Array;
    crc: number;
    offset: number;
    time: number;
    date: number;
  }[] = [];

  const parts: any[] = [];
  let currentOffset = 0;
  const now = new Date();
  const { time: dosTime, date: dosDate } = getDosTimeAndDate(now);

  // 1. Write Local File Headers & Data
  for (const file of files) {
    const filenameBytes = encoder.encode(file.filename);
    const dataBytes =
      typeof file.content === 'string' ? encoder.encode(file.content) : file.content;
    const crc = computeCrc32(dataBytes);
    const offset = currentOffset;

    const header = new Uint8Array(30 + filenameBytes.length);
    const view = new DataView(header.buffer);

    view.setUint32(0, 0x04034b50, true); // Local file header signature
    view.setUint16(4, 20, true); // Version needed to extract (2.0)
    view.setUint16(6, 0x0800, true); // Flags (bit 11 = UTF-8 filename)
    view.setUint16(8, 0, true); // Compression method (0 = Store / uncompressed)
    view.setUint16(10, dosTime, true);
    view.setUint16(12, dosDate, true);
    view.setUint32(14, crc, true); // CRC-32
    view.setUint32(18, dataBytes.length, true); // Compressed size
    view.setUint32(22, dataBytes.length, true); // Uncompressed size
    view.setUint16(26, filenameBytes.length, true); // Filename length
    view.setUint16(28, 0, true); // Extra field length

    header.set(filenameBytes, 30);

    parts.push(header);
    parts.push(dataBytes);

    currentOffset += header.length + dataBytes.length;

    fileRecords.push({
      filenameBytes,
      dataBytes,
      crc,
      offset,
      time: dosTime,
      date: dosDate,
    });
  }

  // 2. Write Central Directory Headers
  const centralDirStartOffset = currentOffset;
  let centralDirSize = 0;

  for (const record of fileRecords) {
    const cdHeader = new Uint8Array(46 + record.filenameBytes.length);
    const view = new DataView(cdHeader.buffer);

    view.setUint32(0, 0x02014b50, true); // Central directory file header signature
    view.setUint16(4, 20, true); // Version made by
    view.setUint16(6, 20, true); // Version needed to extract
    view.setUint16(8, 0x0800, true); // Flags (UTF-8)
    view.setUint16(10, 0, true); // Compression method (0 = Store)
    view.setUint16(12, record.time, true);
    view.setUint16(14, record.date, true);
    view.setUint32(16, record.crc, true); // CRC-32
    view.setUint32(20, record.dataBytes.length, true); // Compressed size
    view.setUint32(24, record.dataBytes.length, true); // Uncompressed size
    view.setUint16(28, record.filenameBytes.length, true); // Filename length
    view.setUint16(30, 0, true); // Extra field length
    view.setUint16(32, 0, true); // File comment length
    view.setUint16(34, 0, true); // Disk number start
    view.setUint16(36, 0, true); // Internal file attributes
    view.setUint32(38, 0, true); // External file attributes
    view.setUint32(42, record.offset, true); // Relative offset of local header

    cdHeader.set(record.filenameBytes, 46);

    parts.push(cdHeader);
    centralDirSize += cdHeader.length;
    currentOffset += cdHeader.length;
  }

  // 3. Write End of Central Directory Record (EOCD)
  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);

  eocdView.setUint32(0, 0x06054b50, true); // End of central dir signature
  eocdView.setUint16(4, 0, true); // Number of this disk
  eocdView.setUint16(6, 0, true); // Disk where central directory starts
  eocdView.setUint16(8, fileRecords.length, true); // Number of central directory records on this disk
  eocdView.setUint16(10, fileRecords.length, true); // Total number of central directory records
  eocdView.setUint32(12, centralDirSize, true); // Size of central directory
  eocdView.setUint32(16, centralDirStartOffset, true); // Offset of start of central directory
  eocdView.setUint16(20, 0, true); // Comment length

  parts.push(eocd);

  return new Blob(parts, { type: 'application/zip' });
}
