import zlib
import struct
import math
import os

def create_png(width, height, filename, is_maskable=False):
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk: width (4 bytes), height (4 bytes), depth=8, color_type=6 (RGBA), compression=0, filter=0, interlace=0
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = struct.pack('>I', zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff)
    png += struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + ihdr_crc

    # Raw pixel data
    raw_data = bytearray()
    
    cx, cy = width / 2.0, height / 2.0
    r_max = width / 2.0

    for y in range(height):
        raw_data.append(0) # filter byte: None
        for x in range(width):
            # Normalized coordinates
            nx = (x - cx) / r_max
            ny = (y - cy) / r_max
            dist = math.sqrt(nx*nx + ny*ny)
            
            # Base gradient: #0284c7 (top) to #0369a1 (bottom)
            factor = y / float(height)
            r = int(2 * (1 - factor) + 3 * factor)
            g = int(132 * (1 - factor) + 105 * factor)
            b = int(199 * (1 - factor) + 161 * factor)
            a = 255
            
            # For non-maskable rounded squircle corners
            if not is_maskable:
                # Rounded corner mask
                corner_radius = width * 0.22
                in_corner = False
                corner_d = 0
                if x < corner_radius and y < corner_radius:
                    corner_d = math.sqrt((x - corner_radius)**2 + (y - corner_radius)**2)
                    in_corner = True
                elif x > width - corner_radius and y < corner_radius:
                    corner_d = math.sqrt((x - (width - corner_radius))**2 + (y - corner_radius)**2)
                    in_corner = True
                elif x < corner_radius and y > height - corner_radius:
                    corner_d = math.sqrt((x - corner_radius)**2 + (y - (height - corner_radius))**2)
                    in_corner = True
                elif x > width - corner_radius and y > height - corner_radius:
                    corner_d = math.sqrt((x - (width - corner_radius))**2 + (y - (height - corner_radius))**2)
                    in_corner = True
                    
                if in_corner and corner_d > corner_radius:
                    a = 0

            # Central badge: sound icon & dollar badge
            # Sound waves
            if a > 0:
                dist_wave1 = math.sqrt((nx - 0.25)**2 + ny**2)
                dist_wave2 = math.sqrt((nx - 0.15)**2 + ny**2)
                
                # Speaker cone
                if -0.55 <= nx <= -0.15 and -0.35 <= ny <= 0.35:
                    if nx <= -0.35:
                        # Speaker box
                        if -0.2 <= ny <= 0.2:
                            r, g, b = 255, 255, 255
                    else:
                        # Triangle expansion
                        slope = (nx - (-0.35)) / 0.20
                        if abs(ny) <= 0.2 + 0.18 * slope:
                            r, g, b = 255, 255, 255

                # Sound arcs
                if 0.35 <= dist_wave1 <= 0.45 and -0.4 <= ny <= 0.4 and nx > 0:
                    r, g, b = 224, 242, 254
                if 0.55 <= dist_wave2 <= 0.65 and -0.5 <= ny <= 0.5 and nx > 0:
                    r, g, b = 186, 230, 253

                # Dollar coin badge in bottom-left
                coin_dist = math.sqrt((nx - (-0.25))**2 + (ny - 0.35)**2)
                if coin_dist <= 0.26:
                    # Emerald-Cyan glowing coin
                    r, g, b = 16, 185, 129
                    # Inner circle
                    if coin_dist <= 0.22:
                        r, g, b = 56, 189, 248
                    # Dollar symbol stroke
                    if abs(nx - (-0.25)) <= 0.04 and abs(ny - 0.35) <= 0.14:
                        r, g, b = 3, 43, 67
                    if abs(ny - 0.35) <= 0.03 and abs(nx - (-0.25)) <= 0.1:
                        r, g, b = 3, 43, 67
                    if abs(ny - 0.27) <= 0.03 and abs(nx - (-0.25)) <= 0.09:
                        r, g, b = 3, 43, 67
                    if abs(ny - 0.43) <= 0.03 and abs(nx - (-0.25)) <= 0.09:
                        r, g, b = 3, 43, 67

            raw_data.extend([r, g, b, a])

    # Compress raw data with zlib
    compressed = zlib.compress(bytes(raw_data), 9)
    idat_crc = struct.pack('>I', zlib.crc32(b'IDAT' + compressed) & 0xffffffff)
    png += struct.pack('>I', len(compressed)) + b'IDAT' + compressed + idat_crc

    # IEND chunk
    iend_crc = struct.pack('>I', zlib.crc32(b'IEND') & 0xffffffff)
    png += struct.pack('>I', 0) + b'IEND' + iend_crc

    os.makedirs(os.path.dirname(os.path.abspath(filename)), exist_ok=True)
    with open(filename, 'wb') as f:
        f.write(png)
    print(f"Generated {filename} ({width}x{height}, {len(png)} bytes)")

if __name__ == '__main__':
    create_png(192, 192, 'public/pwa-192x192.png', is_maskable=False)
    create_png(512, 512, 'public/pwa-512x512.png', is_maskable=False)
    create_png(180, 180, 'public/apple-touch-icon.png', is_maskable=False)
    create_png(512, 512, 'public/pwa-maskable-512x512.png', is_maskable=True)
