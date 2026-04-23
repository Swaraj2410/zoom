import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { IconButton, TextField, InputAdornment } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import PeopleIcon from '@mui/icons-material/People';
import server from '../environment';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();
    const videoRef = useRef([]);
    const localStreamRef = useRef(null);
    const cameraStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const screenRef = useRef(false);

    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState(true);
    let [audio, setAudio] = useState(true);
    let [screen, setScreen] = useState(false);
    let [showModal, setModal] = useState(true);
    let [screenAvailable, setScreenAvailable] = useState(false);
    let [messages, setMessages] = useState([])
    let [message, setMessage] = useState("");
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    let [videos, setVideos] = useState([])
    let [screenShareOwner, setScreenShareOwner] = useState(null);
    let [participantIds, setParticipantIds] = useState([]);

    useEffect(() => {
        connections = {};
        getPermissions();

        return () => {
            stopStream(localStreamRef.current);
            stopStream(cameraStreamRef.current);
            stopStream(screenStreamRef.current);
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        updateLocalTrackState();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [video, audio])

    useEffect(() => {
        screenRef.current = screen;
    }, [screen])

    const stopStream = (stream) => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }

    const setLocalPreview = (stream) => {
        localStreamRef.current = stream;
        window.localStream = stream;

        if (localVideoref.current) {
            localVideoref.current.srcObject = stream;
        }
    }

    const buildLocalStream = (videoTrack) => {
        const stream = new MediaStream();
        if (videoTrack) {
            stream.addTrack(videoTrack);
        }

        const audioTrack = cameraStreamRef.current?.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = audio;
            stream.addTrack(audioTrack);
        }

        return stream;
    }

    const updateLocalTrackState = () => {
        cameraStreamRef.current?.getVideoTracks().forEach(track => {
            track.enabled = video;
        });
        cameraStreamRef.current?.getAudioTracks().forEach(track => {
            track.enabled = audio;
        });
    }

    const replaceOutgoingVideo = async (track) => {
        await Promise.all(Object.values(connections).map(async (connection) => {
            const sender = connection.getSenders().find(existingSender => existingSender.track?.kind === "video");

            if (sender) {
                await sender.replaceTrack(track);
            } else if (track && localStreamRef.current) {
                connection.addTrack(track, localStreamRef.current);
            }
        }));
    }

    const replaceOutgoingAudio = async (track) => {
        await Promise.all(Object.values(connections).map(async (connection) => {
            const sender = connection.getSenders().find(existingSender => existingSender.track?.kind === "audio");

            if (sender) {
                await sender.replaceTrack(track);
            } else if (track && localStreamRef.current) {
                connection.addTrack(track, localStreamRef.current);
            }
        }));
    }

    const getPermissions = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            cameraStreamRef.current = stream;
            setVideoAvailable(stream.getVideoTracks().length > 0);
            setAudioAvailable(stream.getAudioTracks().length > 0);
            setVideo(stream.getVideoTracks().length > 0);
            setAudio(stream.getAudioTracks().length > 0);
            setScreenAvailable(Boolean(navigator.mediaDevices.getDisplayMedia));
            setLocalPreview(stream);
        } catch (error) {
            console.log(error);
            setVideoAvailable(false);
            setAudioAvailable(false);
            setScreenAvailable(Boolean(navigator.mediaDevices.getDisplayMedia));
        }
    };

    const ensureLocalMedia = async () => {
        if (cameraStreamRef.current) {
            return cameraStreamRef.current;
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        cameraStreamRef.current = stream;
        setLocalPreview(stream);
        updateLocalTrackState();
        return stream;
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            ensurePeerConnection(fromId);

            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }

    const updateRemoteVideo = (socketListId, stream) => {
        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

        if (videoExists) {
            setVideos(videos => {
                const updatedVideos = videos.map(video =>
                    video.socketId === socketListId ? { ...video, stream: stream } : video
                );
                videoRef.current = updatedVideos;
                return updatedVideos;
            });
        } else {
            let newVideo = {
                socketId: socketListId,
                stream: stream,
                autoplay: true,
                playsinline: true
            };

            setVideos(videos => {
                const updatedVideos = [...videos, newVideo];
                videoRef.current = updatedVideos;
                return updatedVideos;
            });
        }
    }

    const addLocalTracks = (connection) => {
        if (!localStreamRef.current) {
            const blackSilence = (...args) => new MediaStream([black(...args), silence()])
            setLocalPreview(blackSilence());
        }

        localStreamRef.current.getTracks().forEach(track => {
            const alreadyAdded = connection.getSenders().some(sender => sender.track === track);
            if (!alreadyAdded) {
                connection.addTrack(track, localStreamRef.current);
            }
        });
    }

    const ensurePeerConnection = (socketListId) => {
        if (connections[socketListId]) {
            return connections[socketListId];
        }

        const connection = new RTCPeerConnection(peerConfigConnections);
        connections[socketListId] = connection;

        connection.onicecandidate = function (event) {
            if (event.candidate != null) {
                socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
            }
        }

        connection.ontrack = (event) => {
            const stream = event.streams[0] || new MediaStream([event.track]);
            updateRemoteVideo(socketListId, stream);
        };

        addLocalTracks(connection);
        return connection;
    }

    let connectToSocketServer = () => {
        const isSecure = server_url.startsWith('https://');
        const token = localStorage.getItem("accessToken");
        socketRef.current = io.connect(server_url, {
            secure: isSecure,
            transports: ['websocket', 'polling'],
            auth: { token }
        })

        socketRef.current.on('connect_error', (err) => {
            console.error('Socket connect error:', err.message);
        });

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('screen-share-started', (id) => {
            setScreenShareOwner(id);
        })

        socketRef.current.on('screen-share-stopped', (id) => {
            setScreenShareOwner(currentOwner => currentOwner === id ? null : currentOwner);
        })

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                delete connections[id];
                setParticipantIds(currentIds => currentIds.filter(currentId => currentId !== id));
                setVideos((videos) => {
                    const updatedVideos = videos.filter((video) => video.socketId !== id);
                    videoRef.current = updatedVideos;
                    return updatedVideos;
                })
                setScreenShareOwner(currentOwner => currentOwner === id ? null : currentOwner);
            })

            socketRef.current.on('user-joined', (id, clients) => {
                setParticipantIds(clients);
                clients
                    .filter(socketListId => socketListId !== socketIdRef.current)
                    .forEach((socketListId) => {
                        ensurePeerConnection(socketListId);
                    })

                if (id === socketIdRef.current) {
                    Object.keys(connections).forEach((id2) => {
                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                            })
                    })
                }

                if (screenRef.current) {
                    socketRef.current?.emit('screen-share-started');
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo(current => !current);
    }
    let handleAudio = async () => {
        const nextAudio = !audio;
        setAudio(nextAudio)
        const audioTrack = cameraStreamRef.current?.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = nextAudio;
            await replaceOutgoingAudio(audioTrack);
        }
    }

    const stopScreenShare = async () => {
        stopStream(screenStreamRef.current);
        screenStreamRef.current = null;

        const cameraTrack = cameraStreamRef.current?.getVideoTracks()[0] || black();
        cameraTrack.enabled = video;
        setLocalPreview(buildLocalStream(cameraTrack));
        await replaceOutgoingVideo(cameraTrack);
        socketRef.current?.emit('screen-share-stopped');
        setScreen(false);
        setScreenShareOwner(null);
    }

    const startScreenShare = async () => {
        if (!navigator.mediaDevices.getDisplayMedia) {
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
            const screenTrack = stream.getVideoTracks()[0];
            screenStreamRef.current = stream;
            setLocalPreview(buildLocalStream(screenTrack));
            await replaceOutgoingVideo(screenTrack);
            setScreen(true);
            setScreenShareOwner(socketIdRef.current);
            socketRef.current?.emit('screen-share-started');

            screenTrack.onended = () => {
                stopScreenShare();
            }
        } catch (error) {
            console.log(error);
            setScreen(false);
        }
    }

    let handleScreen = () => {
        if (screen) {
            stopScreenShare();
        } else {
            startScreenShare();
        }
    }

    let handleEndCall = () => {
        stopStream(localStreamRef.current);
        stopStream(cameraStreamRef.current);
        stopStream(screenStreamRef.current);
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        window.location.href = "/"
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            { sender: sender, data: data }
        ]);
    };

    let sendMessage = () => {
        if (!message.trim()) return;
        socketRef.current.emit('chat-message', message, username)
        setMessage("");
    }

    let connect = async () => {
        setAskForUsername(false);
        await ensureLocalMedia();
        updateLocalTrackState();
        connectToSocketServer();
    }

    const remoteScreenVideo = videos.find(video => video.socketId === screenShareOwner);
    const isLocalScreenSharing = screenShareOwner === socketIdRef.current;
    const participantCount = participantIds.length || videos.length + 1;

    return (
        <div>

            {askForUsername === true ?

                <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ background: 'white', padding: '3rem', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', textAlign: 'center', maxWidth: '500px' }}>
                        <h2 style={{ color: '#667eea', marginBottom: '1.5rem', fontSize: '2rem', fontWeight: 700 }}>Enter into Lobby</h2>
                        <TextField
                            id="outlined-basic"
                            label="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: '12px' } }}
                        />
                        <Button
                            variant="contained"
                            onClick={connect}
                            fullWidth
                            sx={{
                                py: 1.5,
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontSize: '1.1rem',
                                fontWeight: 600,
                                bgcolor: '#667eea',
                                boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                                '&:hover': { bgcolor: '#5568d3', boxShadow: '0 12px 28px rgba(102, 126, 234, 0.4)' }
                            }}
                        >
                            Connect
                        </Button>
                    </div>

                    <div style={{ background: 'white', padding: '1rem', borderRadius: '20px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}>
                        <video ref={localVideoref} autoPlay muted playsInline style={{ width: '400px', height: 'auto', borderRadius: '12px' }}></video>
                    </div>

                </div> :


                <div className={styles.meetVideoContainer}>

                    {showModal ? <div className={styles.chatRoom}>

                        <div className={styles.chatContainer}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '2px solid #f0f0f0' }}>
                                <h1 style={{ color: '#667eea', fontWeight: 700, margin: 0, fontSize: '1.5rem' }}>Chat</h1>
                                <IconButton onClick={() => setModal(false)} size="small" sx={{ color: '#999', '&:hover': { color: '#667eea', bgcolor: '#f5f7fa' } }}>
                                    <CloseIcon />
                                </IconButton>
                            </div>

                            <div className={styles.chattingDisplay}>

                                {messages.length !== 0 ? messages.map((item, index) => {
                                    const isOwnMessage = item.sender === username;
                                    return (
                                        <div
                                            style={{
                                                marginBottom: "12px",
                                                display: 'flex',
                                                justifyContent: isOwnMessage ? 'flex-end' : 'flex-start'
                                            }}
                                            key={index}
                                        >
                                            <div style={{
                                                maxWidth: '75%',
                                                background: isOwnMessage ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f5f7fa',
                                                padding: '10px 14px',
                                                borderRadius: isOwnMessage ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                                            }}>
                                                <p style={{
                                                    fontWeight: 600,
                                                    color: isOwnMessage ? 'rgba(255,255,255,0.9)' : '#667eea',
                                                    marginBottom: '4px',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {item.sender}
                                                </p>
                                                <p style={{
                                                    color: isOwnMessage ? 'white' : '#333',
                                                    margin: 0,
                                                    wordBreak: 'break-word'
                                                }}>
                                                    {item.data}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                }) : <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                                    <ChatIcon sx={{ fontSize: 60, color: '#e0e0e0', mb: 1 }} />
                                    <p style={{ color: '#999' }}>No Messages Yet</p>
                                    <p style={{ color: '#ccc', fontSize: '0.9rem' }}>Start the conversation!</p>
                                </div>}


                            </div>

                            <div className={styles.chattingArea}>
                                <TextField
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter' && message.trim()) sendMessage(); }}
                                    placeholder="Type a message..."
                                    variant="outlined"
                                    fullWidth
                                    size="small"
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    onClick={sendMessage}
                                                    disabled={!message.trim()}
                                                    sx={{
                                                        color: '#667eea',
                                                        '&:hover': { bgcolor: '#f5f7fa' },
                                                        '&.Mui-disabled': { color: '#ccc' }
                                                    }}
                                                >
                                                    <SendIcon />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '24px',
                                            bgcolor: '#f9f9f9',
                                            '&:hover': { bgcolor: 'white' },
                                            '&.Mui-focused': { bgcolor: 'white' }
                                        }
                                    }}
                                />
                            </div>


                        </div>
                    </div> : <></>}

                    <div className={styles.participantBadge}>
                        <PeopleIcon fontSize="small" />
                        <span>{participantCount}</span>
                    </div>

                    <div className={styles.buttonContainers}>
                        <IconButton
                            onClick={handleVideo}
                            disabled={!videoAvailable}
                            sx={{
                                bgcolor: video ? '#667eea' : '#f44336',
                                color: 'white',
                                mx: 1,
                                '&:hover': { bgcolor: video ? '#5568d3' : '#d32f2f', transform: 'scale(1.1)' },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                        </IconButton>
                        <IconButton
                            onClick={handleAudio}
                            disabled={!audioAvailable}
                            sx={{
                                bgcolor: audio ? '#667eea' : '#f44336',
                                color: 'white',
                                mx: 1,
                                '&:hover': { bgcolor: audio ? '#5568d3' : '#d32f2f', transform: 'scale(1.1)' },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {audio === true ? <MicIcon /> : <MicOffIcon />}
                        </IconButton>

                        {screenAvailable === true ?
                            <IconButton
                                onClick={handleScreen}
                                sx={{
                                    bgcolor: screen ? '#667eea' : 'rgba(255, 255, 255, 0.2)',
                                    color: 'white',
                                    mx: 1,
                                    '&:hover': { bgcolor: screen ? '#5568d3' : 'rgba(255, 255, 255, 0.3)', transform: 'scale(1.1)' },
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                {screen === true ? <StopScreenShareIcon /> : <ScreenShareIcon />}
                            </IconButton> : <></>}

                        <IconButton
                            onClick={() => { setModal(!showModal); }}
                            sx={{
                                bgcolor: 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                mx: 1,
                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.3)', transform: 'scale(1.1)' },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <ChatIcon />
                        </IconButton>

                        <IconButton
                            onClick={handleEndCall}
                            sx={{
                                bgcolor: '#f44336',
                                color: 'white',
                                mx: 1,
                                '&:hover': { bgcolor: '#d32f2f', transform: 'scale(1.1)' },
                                transition: 'all 0.3s ease'
                            }}
                        >
                            <CallEndIcon />
                        </IconButton>

                    </div>

                    <div className={screenShareOwner ? styles.screenShareStage : styles.screenShareStageHidden}>
                        {isLocalScreenSharing ?
                            <video className={styles.screenShareVideo} ref={localVideoref} autoPlay muted playsInline></video> :
                            remoteScreenVideo ? <video
                                className={styles.screenShareVideo}
                                data-socket={remoteScreenVideo.socketId}
                                ref={ref => {
                                    if (ref && remoteScreenVideo.stream) {
                                        ref.srcObject = remoteScreenVideo.stream;
                                    }
                                }}
                                autoPlay
                                playsInline
                            ></video> : <></>
                        }
                    </div>

                    {!isLocalScreenSharing ? <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted playsInline></video> : <></>}

                    <div className={screenShareOwner ? styles.conferenceStrip : styles.conferenceView}>
                        {videos
                            .filter(video => video.socketId !== screenShareOwner)
                            .map((video) => (
                                <div className={styles.videoTile} key={video.socketId}>
                                    <video
                                        data-socket={video.socketId}
                                        ref={ref => {
                                            if (ref && video.stream) {
                                                ref.srcObject = video.stream;
                                            }
                                        }}
                                        autoPlay
                                        playsInline
                                    >
                                    </video>
                                </div>

                            ))}

                    </div>

                </div>

            }

        </div>
    )
}
