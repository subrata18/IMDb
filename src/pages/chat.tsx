import Image from 'next/image'
import ChatCard from '@components/ChatCard'
import {MdSend} from 'react-icons/md'
import Message from '@components/Message'
import { Client, Versions } from '@stomp/stompjs'
import { useState } from 'react'

const chat = () => {

    Object.assign(global, { WebSocket: require('websocket').w3cwebsocket });

    const [message, setMessage] = useState("")

    let connection_configuration = {
        brokerURL: 'ws://192.168.0.101:2198/chat',
        stompVersions : new Versions(['1.1', '1.2']),
        reconnectDelay : 5000,
        connectionTimeout : 10000,
        heartbeatIncomming : 4000,
        heartbeatOutgoing : 4000,
        connectHeaders : {
            login : 'myuser',
            passcode : 'mypassword'
        },
        maxWebSocketChunkSize : 8*1024,
        splitLargeFrames : true,
    }
    const stompClient = new Client(connection_configuration)
    if(process.browser){
        window.onload=function(){
            createSubscription()
        }
    }
    function createSubscription(){
        console.log('Subscription running');
        
        stompClient.onConnect = function(frame){
            console.log("Connection Established");
            let subscription = stompClient.subscribe('/topic/random_topic', (msg) => {
                console.log(`Message received ${msg.body} with headers ${msg.headers}`);            
                },
                {
                    "id": String((Math.floor(Math.random()*100))),
                    "durable": "true",
                    "auto-delete": "false"
                }
            )
            console.log(`New subscription created with id ${subscription.id}`);        
        }
        stompClient.activate();
    }
    stompClient.onStompError = function(frame){
        console.log("an stomp specific error occured");
    }
    stompClient.onDisconnect = function(frame){
        console.log("stop disconnect frame received");
    }
    stompClient.onWebSocketClose = function(close_event){
        console.log(`underlying websocket connection closed with code ${close_event.code} and reason ${close_event.reason} and its clean status is ${close_event.wasClean}`);
    }
    stompClient.onWebSocketError = function(event) {
        console.log("an error occured in the underlying websocket");
    }
    stompClient.activate();
    const sendMessageHandler = (message) => {
        let receiptId = String(Math.floor(Math.random()*100))
        console.log(stompClient.connected);
        stompClient.publish({
            destination: "/app/random_topic",
            body: message,
            headers: {
                receipt: receiptId
            }
        })
        console.log('Message published')
        setMessage('')
    }
    
    return(
        <div className="text-black flex flex-row bg-white">
            <div className="flex flex-col w-4/12 border-r-2 border-gray-300">
                <div className="flex flex-row h-20 bg-gray-100">
                    <div className="my-auto mx-2">
                        <Image src="/avatar.png" height="40" width="40" className="rounded-full" />
                    </div>
                    <span className="text-lg font-semibold my-auto">Swarnendu</span>
                </div>
                <div className="flex flex-col screen-height overflow-y-auto">
                    <ChatCard />
                    <ChatCard />
                    <ChatCard />
                    <ChatCard />
                    <ChatCard />
                    <ChatCard />
                    <ChatCard />
                </div>
            </div>
            <div className="flex flex-col w-8/12 z-10">
                <div className="flex flex-row bg-gray-100 h-20">
                    <div className="my-auto mx-2">
                        <Image src="/avatar.png" height="40" width="40" className="rounded-full" />
                    </div>
                    <span className="text-lg font-semibold my-auto">User</span>
                </div>
                <div className="flex flex-col justify-end p-4 chat-window-height overflow-y-auto bg-blue-100">
                    <Message />
                    <Message />
                    <Message />
                </div>
                <div className="flex flex-row px-5 py-3 bg-gray-100">
                    <textarea cols={100} rows={2} value={message} onChange={(event)=>{setMessage(event.target.value)}} placeholder="Write a message" className="rounded-full outline-none pl-4 resize-none" />
                    <span onClick={(message) => sendMessageHandler(message)} className="my-auto mx-4 rounded-full bg-blue-400 p-1 cursor-pointer">
                        <MdSend size="1.6em" className="text-white" />
                    </span>
                </div>
            </div>
        </div>
    )
}

export default chat;