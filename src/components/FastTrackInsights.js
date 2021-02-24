import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { colors } from '../config';
const Container = styled.div`
    width:100%;
    background-color:#1A1A1A;
    padding:20px;
    margin:40px 0;
    h2 {
        text-align:center;
        color:white;
        font-size:2rem;
        padding:0 0 20px 0;
    }
`

const ButtonContainer = styled.div`
    max-width:1140px;
    display:block;
    margin: 0 auto;
`

const fillBar = keyframes`  
  from { width: 0; }
  to { width: 100%; }
`; 

const CTAButton = styled.button`
    width:32%;
    margin:0;
    background:none;
    border:1px solid ${colors.white};
    border-radius:5px;
    position:relative;
    color:white;
    min-height:60px;
    &:nth-of-type(2) {
        margin:0 2%;
    }

    span.progressBar {
        position:absolute;
        left:0;
        top:0;
        height:100%;
        z-index:0;
    }
    span.text {
        position:absolute;
        left:50%;
        top:20px;
        width:100%;
        transform:translateX(-50%);
        z-index:1;
        color:white !important;
        text-transform:uppercase;
        font-weight:bold;
        font-size:1rem;
    }
    &.active {
        border-color:${colors.teal};
        span.progressBar {
            background:${colors.teal};
            animation: ${fillBar} 10s linear 1;
        }
    }
`

const SummaryContainer = styled.div`
`

function FastTrackInsights(){
    const [activeButton, setActiveButton] = useState(0)
    const [timerID, setTimerID] = useState(null)

    useEffect(() => {
        clearInterval(timerID)
        setTimerID(setInterval(() => {
            setActiveButton(prev => (prev+1)%3)
        }, 10000))
    }, [])
    
    return (
        <Container>
            <h2>Fast-track your COVID Insights</h2>
            <ButtonContainer>
                <CTAButton className={activeButton===0 ? 'active' : ''}>
                    <span className="text">Track Vaccination Progress</span>
                    <span className="progressBar"></span>
                </CTAButton>
                <CTAButton className={activeButton===1 ? 'active' : ''}>
                    <span className="text">Analyze Mobility Trends</span>
                    <span className="progressBar"></span>
                </CTAButton>
                <CTAButton className={activeButton===2 ? 'active' : ''}>
                    <span className="text">Understand Health Contexts</span>
                    <span className="progressBar"></span>
                </CTAButton>
            </ButtonContainer>
            <SummaryContainer>

            </SummaryContainer>
        </Container>
    )
}

export default FastTrackInsights