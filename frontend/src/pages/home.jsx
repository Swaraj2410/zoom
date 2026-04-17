import React, { useContext, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import LogoutIcon from '@mui/icons-material/Logout';
import { AuthContext } from '../contexts/AuthContext';

function HomeComponent() {


    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState("");


    const {addToUserHistory} = useContext(AuthContext);
    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode)
        navigate(`/${meetingCode}`)
    }

    return (
        <>

            <div className="navBar">

                <div style={{ display: "flex", alignItems: "center" }}>

                    <h2>Apna Video Call</h2>
                </div>

                <div style={{ display: "flex", alignItems: "center" }}>
                    <Button 
                        startIcon={<RestoreIcon />}
                        onClick={() => navigate("/history")}
                        sx={{ 
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                        }}
                    >
                        History
                    </Button>

                    <Button 
                        startIcon={<LogoutIcon />}
                        onClick={() => {
                            localStorage.removeItem("accessToken")
                            localStorage.removeItem("refreshToken")
                            localStorage.removeItem("user")
                            navigate("/auth")
                        }} 
                        sx={{ 
                            color: 'white',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                        }}
                    >
                        Logout
                    </Button>
                </div>


            </div>


            <div className="meetContainer">
                <div className="leftPanel">
                    <div>
                        <h2>Providing Quality Video Call Just Like Quality Education</h2>

                        <div style={{ display: 'flex', gap: "15px" }}>
                            <TextField 
                                onChange={e => setMeetingCode(e.target.value)} 
                                id="outlined-basic" 
                                label="Meeting Code" 
                                variant="outlined" 
                                sx={{ 
                                    flex: 1,
                                    '& .MuiOutlinedInput-root': { 
                                        borderRadius: '12px',
                                        bgcolor: 'white'
                                    } 
                                }} 
                            />
                            <Button 
                                onClick={handleJoinVideoCall} 
                                variant='contained' 
                                sx={{ 
                                    px: 4,
                                    borderRadius: '12px',
                                    textTransform: 'none',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    bgcolor: '#667eea',
                                    boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
                                    '&:hover': { 
                                        bgcolor: '#5568d3',
                                        boxShadow: '0 12px 28px rgba(102, 126, 234, 0.4)',
                                        transform: 'translateY(-2px)'
                                    }
                                }}
                            >
                                Join
                            </Button>
                        </div>
                    </div>
                </div>
                <div className='rightPanel'>
                    <img srcSet='/logo3.png' alt="" />
                </div>
            </div>
        </>
    )
}


export default withAuth(HomeComponent)