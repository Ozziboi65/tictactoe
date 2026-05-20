type Marker = "X" | "O" | " ";

interface BoardUpdateEvent {
  event: "BOARD_UPDATE";
  markers: [Marker, Marker, Marker, Marker, Marker, Marker, Marker, Marker, Marker];
}

interface BoardProps {
  markers: BoardUpdateEvent["markers"];
  onCellClick: (index: number) => void;
}

function Board({ markers, onCellClick }: BoardProps) {
  return (
    <div style={{ display: "inline-grid", gridTemplateColumns: "repeat(3, 80px)" }}>



      {markers.map((mark, i) => (
        <div
          key={i}
          onClick={() => onCellClick(i)}
          style={{
            width: 80,
            height: 80,
            border: "2px solid #333",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 36,
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          {mark.trim()}
        </div>
      ))}
    </div>
  );
}

export default Board;
export type { Marker, BoardUpdateEvent };
