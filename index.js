import { WebSocketServer } from "ws";
import express, { json } from "express";

const app = express()

const websocketPracticeServerPrefix = "WEBSOCKET_PRACTICE_SERVER";
const webSocketPracticeServerDataKey = `webSocketPracticeServerDataKey`

const clientList = {

};

const PORT = 5000;

const server = app.listen(PORT)

const websocket_server = new WebSocketServer({
    noServer: true
})

const sendGreet = (ws, userName) => {
    let newDate = new Date()
    let hour = newDate.getHours();
    if (hour >= 0 && hour < 12) {
        ws.send(`Hi, Good Morning ${userName}.`)
    }
    else if (hour >= 12 && hour < 18) {
        ws.send(`Hi, Good Afternoon ${userName}`)
    } else if (hour >= 18 && hour < 21) {
        ws.send(`Hi, Good Evening ${userName}`)
    } else {
        ws.send(`Good Night ${userName}`)
    }
}

const getDateTime = () => {
    let dayOptions = {
        weekday: 'long',
        year: 'numeric',
        month: "short",
        day: "numeric"
    }

    let timeOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
    }

    let newDate = new Date();
    let date = newDate.toLocaleDateString('en-US', dayOptions)
    let time = newDate.toLocaleTimeString("en-US", timeOptions)

    if (new Date().getDate() > newDate.getDate()) {
        return `last seen - ${date}, ${time}`
    } else {
        return time
    }
}

websocket_server.on('connection', (ws) => {
    ws.userInfo = {};
    ws.on('message', (data) => {
        let parsedData = JSON.parse(data)

        switch (parsedData.title) {
            case "userName": {
                let { userName } = parsedData;
                ws.userInfo.userName = userName
                clientList[userName] = ws
                break;
            }
            case "sendMsg": {
                let { sendTo, sendBy, msg } = parsedData;
                if (clientList[sendTo].readyState === 1) {
                    clientList[sendTo].send(JSON.stringify({
                        title: "sending_message",
                        sendBy,
                        msg
                    }))
                }
                break;
            }
            default: {
                // case "sendOnlineStatus"
                let { sendTo, sendBy, online } = parsedData;
                if (clientList[sendTo]?.readyState === 1) {
                    clientList[sendTo].send(JSON.stringify({
                        title: "sending_onlineStatus",
                        sendBy,
                        online
                    }))
                }
                break;
            }
        }
    })
})



server.on('upgrade', async function upgrade(request, socket, head) {
    websocket_server.handleUpgrade(request, socket, head, function done(ws) {
        websocket_server.emit('connection', ws, request);
    });
})