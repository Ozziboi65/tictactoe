import type { Marker } from "../Board"

type ToastFn = (message: string, duration?: number) => void
type BoardUpdateFn = (markers: [Marker, Marker, Marker, Marker, Marker, Marker, Marker, Marker, Marker]) => void
type VisibilityFn = (show: boolean) => void

function getTeamFromNumber(team:number){
    if(team === 1){
        return "O"
    }else if(team === 2){
        return "X"
    } else{
        return null
    }

}






export function connect_to_game(username: string, toast: ToastFn, onBoardUpdate?: BoardUpdateFn, onVisibilityChange?: VisibilityFn) {
    let protocol:string
    let ourTeam:string

    if(window.location.protocol === "https:"){
        protocol = "wss://"
    } else {
        protocol = "ws://"
    }
    const url =  protocol + window.location.hostname + ":8080"
    const socket = new WebSocket(url);

    socket.onopen = () => {
        socket.send(JSON.stringify({ "state": "request_connect", "username": username }))
        toast('connecting')
    }

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log("received " + event.data)
        if (data.event === "GAME_START") {
            const players: string[] = data.players
            console.log("starting players:" + players.forEach(player => console.log(player)))
            toast(`game starting, players: ${players.join(' and ')}`,3500)
        }
        if (data.event === "BOARD_UPDATE" && onBoardUpdate) {
            onBoardUpdate(data.markers)
        }
        if (data.event === "SUCESS_JOIN") {
            let team = getTeamFromNumber(data.team)
            if(team !== null){
                ourTeam = team
            }
            toast("connected sucessfully :3, your team: " + team)
            if (onVisibilityChange) {
                onVisibilityChange(false)
            }
        }
        
        if(data.event === "GAME_WON"){
            const winnerTeam = data.team
            const winnerName = data.winner 
            if(ourTeam !== getTeamFromNumber(winnerTeam)){
                toast("You Lost The Game to " + winnerName + "  :(",6000)
            }
            if(ourTeam === getTeamFromNumber(winnerTeam)){
                toast("You WON The Game :P",6000)
            }
        }

        if(data.event === "PLAYER_LEFT"){
            toast("player: " + data.player + " has left the gane")
        }
        
        if(data.event === "GAME_END"){
            toast("Game Ended reason:" + data.reason)
        }

    }
    socket.onclose = (event) => {
        console.log("closed :( code: " + event.code + "msg: " + event.reason)
        toast(`You have been disconnected reason: ${event.reason}`)

        if (onVisibilityChange) {
            onVisibilityChange(true)
        }
    }
    return socket;
}
export default connect_to_game
