const socket = io ('/')
const videoGrid = document.getElementById('video-grid')

const myPeer = new Peer (undefined, {
    host: '/',
    port: 3001
})
console.log ("my peer:" + myPeer)
const peers = {}

const myVideo = document.createElement ('video')
myVideo.muted = true
    
navigator.mediaDevices.getUserMedia ({
    video: true,
    audio: true
}).then (stream => {
    addVideoStream (myVideo, stream)

    myPeer.on ('call', function (call) {
        console.log ('calling answering: ' + call)
        call.answer(stream)

        const video = document.createElement ('video')
        call.on ('stream', function (userVideoStream) {
            addVideoStream (video, userVideoStream)
        })
    })

    socket.on ('user-connected', userId => {
        console.log ('user connected:' + userId)
        setTimeout(connectToNewUser, 1000, userId, stream)
    })    
})

socket.on ('user-disconnected', userId => {
    console.log ('user disconnected : ' + userId)
    if (peers [userId]) {
        peers[userId].close ()
    }
})


myPeer.on ('open', id =>{
    socket.emit ('join-room', ROOM_ID, id)
})

function connectToNewUser (userId, stream) {
    console.log ('calling : ' + userId)
    const call = myPeer.call (userId, stream)
    const video = document.createElement ('video')
    call.on ('stream', userVideoStream => {
        console.log ("calling addVideoStream:" + video)
        addVideoStream (video, userVideoStream)
    })

    call.on ('close', () => {
        video.remove ()
    })

    peers [userId] = call
}
var i = 0;
function addVideoStream (video, stream) {
    video.srcObject = stream
    video.addEventListener ('loadedmetadata', () => {
        video.play ()
    })
    video.id = "videoId-" + i;
    i++
    console.log ("about to append:" + video)
    videoGrid.appendChild(video)
}

function closeRoom () {
    console.log ('leaving room:' + ROOM_ID)
    window.location.replace('/discon');
}

function muteEnable () {
    myVideo.srcObject.getAudioTracks().map(track => track.enabled = !track.enabled);
}

function videoEnable () {
    myVideo.srcObject.getVideoTracks().map(track => track.enabled = !track.enabled);
}
