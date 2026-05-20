import { useState } from 'react'
import { createPortal } from 'react-dom'
import { connect_to_game } from "./script/script"
import { useToast } from "./notif/useToast"
import { Toast } from "./notif/Toast"
import Board, { type Marker } from "./Board"

function App() {
  const { toasts, toast, dismiss } = useToast()
  const [username, setUsername] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [showName, setShowName] = useState(true);
  const [markers, setMarkers] = useState<[Marker, Marker, Marker, Marker, Marker, Marker, Marker, Marker, Marker]>(
    [" ", " ", " ", " ", " ", " ", " ", " ", " "]
  );



  function handleBoardClick(index: number) {
    console.log("board click index" + index)
    socket?.send(JSON.stringify({ "event": "MAKE_MOVE", "index": index }))

  }


  return (
    <>
      <h1>tic tac toe</h1>
      <a href="https://sigmacat123.com" target="_blank" rel="noopener noreferrer"className="text-link"> made by Sigmacat123 </a>
      <div style={{ display: showName ? 'block' : 'none' }}>      
          <div style={{ padding: '20px'}}>
          <label htmlFor="user-input">username: </label>
          <input
            id="user-input"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="sigmacat123"
          />
        </div>


        <button onClick={() => {
          const s = connect_to_game(username, toast, setMarkers, setShowName);
          setSocket(s);
        }}>
          Join
        </button>
      </div>


      <div style={{ marginTop: '40px' }}>
        <Board markers={markers} onCellClick={handleBoardClick} />
      </div>

      {typeof document !== 'undefined' && createPortal(
        <div className="toaster toaster--bottom-right">
          {toasts.map(t => (
            <Toast key={t.id} {...t} onDismiss={dismiss} />
          ))}
        </div>,
        document.body
      )}
    </>
  )
}

export default App
