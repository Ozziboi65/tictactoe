import { WebSocketServer, WebSocket } from "ws";

const PORT = 8080;
const wss = new WebSocketServer({ port: PORT });



let players: Player[] = []
let map: MapMarker[] = []

let lastTurn:number = 2


function disconnectClient(player: Player, code: number, message: string) {
    console.log("client disconnect info " + player + code + message)
    const newPlayers = players.filter(p => p)
    players = newPlayers
    player.socket.close(code, message)
}

const WINS = [
  [0, 1, 2],    // works i guess
  [3, 4, 5], 
  [6, 7, 8],
  [0, 3, 6], 
  [1, 4, 7], 
  [2, 5, 8], 
  [0, 4, 8],
  [2, 4, 6], 
];


class Player {
    socket: WebSocket
    name: string
    team: number
    // 0 is basically null idk
    // 1 is O 
    // 2 is X

    constructor(socket: WebSocket, name: string, team: number) {
        this.socket = socket;
        this.name = name;
        this.team = team;
    }
}

class MapMarker {
    team: number;
    display: string

    constructor(team: number) {
        this.team = team
        this.display = "X"
        if (team === 2) {
            this.display = "X"
            console.log("should be X")
        } else if (team === 1) {
            this.display = "O"
        } else {
            this.display = " "
        }
    }

}

function start_game() {
    console.log("starting game :3")
    players.forEach(p => p.socket.send(JSON.stringify({ "event": "GAME_START", "players": players.map(p => p.name) })))
    make_board()
}

function make_board() {
    if(map.length < 9){
        for (var i = 0; i < 9; i++) {
            const marker = new MapMarker(0)
            map.push(marker)
        }
    }
    players.forEach(p => p.socket.send(JSON.stringify({ "event": "BOARD_UPDATE", "markers": map.map(p => p.display) })))
}

function endGame(reason:string = "the game has ended.",code:number = 1008){
    console.log("ending game reason: " + reason)
    map = Array.from({ length: map.length }, () => new MapMarker(0))
    players.forEach(p => p.socket.send(JSON.stringify({ "event": "BOARD_UPDATE", "markers": map.map(p => p.display) })))
    players.forEach(p => disconnectClient(p,code,reason))
}

function checkWin(){
    for(const [a,b,c] of WINS){
        const t = map[a].team
        if (t !== 0 && t === map[b].team && t === map[c].team) {
            console.log("winner: " + t)
            return t
        }
    }
    return null
}

function checkDraw(){
    let count:number = 0
    map.forEach(m => {
        if(m.team !== 0){
            count++
        }
    });

    if(count === 9){
        return true
    }
    return false
}

function winGame(winPlayer:Player){
    players.forEach(player => {
        player.socket.send(JSON.stringify({ "event": "GAME_WON", "team": winPlayer.team, "winner": winPlayer.name}))    
    }); 

    endGame("game has been won")
}


wss.on("connection", (socket: WebSocket) => {


    socket.on("message", (data: Buffer) => {
        const asString: string = data.toString();
        let asJson;

        try {
            asJson = JSON.parse(asString)
        }

        catch (e) {
            console.error("failed to parse json :( error:" + e)
        }

        try {
            if (asJson.state == "request_connect") {
                var name = asJson.username
                let player: Player = new Player(socket, name, 0)

                if (players.find(p => p.team === 1)) {
                    player.team = 2 // X
                } else {
                    player.team = 1 // O
                }


                if (players.length >= 2) {
                    disconnectClient(player, 1008, "too many players")
                    return;
                }

                if (players.find(p => p.name === name)) {
                    disconnectClient(player, 1008, "player with this name is alredy playing")
                    return;
                }




                console.log("name: " + player.name)
                players.push(player)
                socket.send(JSON.stringify({ "event": "SUCESS_JOIN", "team": player.team}))



                if (players.length > 1) {
                    start_game()
                }

            }
        }

        catch (e) {
            console.error("error while trying to handle a connect request :( eror: " + e)
        }


        if (asJson.event === "MAKE_MOVE") {
            try {
                const index: number = asJson.index
                const player = players.find(p => p.socket === socket)

                if (!player) {
                    return
                }
                if (index < 0 || index >= map.length) {
                    return
                }

                if(lastTurn === player.team){
                    console.log("skipping because try last time")
                    return;
                }


                if(!(lastTurn === player.team)){
                    if(player.team === 1){
                        lastTurn = player.team

                    } else if(player.team === 2){
                        lastTurn = player.team
                    }
                }



                const m: MapMarker = new MapMarker(player.team)
                map[index] = m
                players.forEach(p => p.socket.send(JSON.stringify({ "event": "BOARD_UPDATE", "markers": map.map(p => p.display) })))
                const winner = checkWin()
                const wasDraw:boolean = checkDraw()
                if(winner !== null){
                    const player = players.find(p => p.team === winner)
                    if(player !== undefined){
                        console.log("game has been won :P")
                        winGame(player)
                    }
                }

                if(wasDraw && winner === null){
                    console.log("DRAW")
                    endGame("Game was an draw!")
                }

            } catch (e) {
                console.error("error while handling move error:" + e)
            }
        }
    });

    socket.on("close", () => {
        const leavingPlayer = players.find(p => p.socket === socket)
        const newPlayers = players.filter(p => p.socket !== socket)
        players = newPlayers
        if (leavingPlayer) {
            newPlayers.forEach(p => p.socket.send(JSON.stringify({
                "event": "PLAYER_LEFT",
                "player": leavingPlayer.name
            })))
        }

        if(players.length < 2){
            endGame("A player left the game :(")
        }
        console.log("socket closed")
    }); 
});
