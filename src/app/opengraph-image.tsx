import { ImageResponse } from 'next/og';

export const alt = 'Starsoft NFT Marketplace';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 96,
        background: '#191A20',
        color: '#FFFFFF',
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', fontSize: 44, fontWeight: 700, color: '#FF8310' }}>
        starsoft
      </div>
      <div style={{ display: 'flex', marginTop: 32, fontSize: 76, fontWeight: 600 }}>
        Marketplace de NFTs
      </div>
      <div style={{ display: 'flex', marginTop: 24, fontSize: 34, color: '#CCCCCC' }}>
        Descubra itens únicos e monte sua coleção.
      </div>
      <div
        style={{
          display: 'flex',
          width: 220,
          height: 10,
          marginTop: 56,
          borderRadius: 8,
          background: '#FF8310',
        }}
      />
    </div>,
    size,
  );
}
