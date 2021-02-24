import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import Grid from '@material-ui/core/Grid';
import { colors } from '../config';
import * as SVG from '../config/svg'
const Container = styled.div`
    width:100%;
    background-color:#1A1A1A;
    padding:60px 0;
    margin:40px 0;
    h2 {
        text-align:center;
        color:white;
        font-size:3.5rem;
        font-weight:bold;
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
    transition:250ms all;
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
            background: ${colors.teal};
            animation: ${fillBar} 10s linear 1;
        }
    }
    &.subtleActive {
        background:${colors.teal};
        border:1px solid rgba(0,0,0,0);
    }
`

const SummaryContainer = styled.div`
    border:1px solid white;
    padding:20px;
    max-width:1140px;
    width:100vw;
    display:block;
    margin:20px auto;
    position:relative;
`
const SummaryItem = styled.div`
    color:white;
    h3, h4 {
        font-weight:bold;
    }
    h3 {
        font-size:1rem;
    }
    h4 {
        font-size:3.5rem;
        padding-left:10px;
    }
`
const TextContainer = styled.div`
    display:inline-block;
`

const GoToMap = styled.a`
    position:absolute;
    right:20px;
    top:50%;
    transform:translateY(-50%);
    text-decoration:none;
    text-transform:uppercase;
    color:${colors.white};
    font-family:"Lato", arial, sans-serif;
    font-weight:bold;
    transition:250ms all;
    font-size:1rem;
    svg {
        display:inline-block;
        fill:white;
        height:1rem;
        width:1rem;
        transform:translateY(2px);
        transition:250ms all;
    }
    &:hover {
        color:${colors.yellow};
        svg {
            fill:${colors.yellow};
        }
    }
`

function FastTrackInsights(){
    const [passiveAnimation, setPassiveAnimation] = useState(true);
    const [activeButton, setActiveButton] = useState(0);
    const [timerID, setTimerID] = useState(null);
    const [summaryInsights, setSummaryInsights] = useState({})

    useEffect(() => {
        if (timerID === null && passiveAnimation) {
            clearInterval(timerID)
            setTimerID(setInterval(() => {
                setActiveButton(prev => (prev+1)%3)
            }, 10000))
            fetch(`${process.env.PUBLIC_URL}/json/summary.json`)
                .then(r => r.json())
                .then(r => setSummaryInsights(r))
        }
    }, [timerID, passiveAnimation])

    const handleButton = (buttonIndex) => {
        if (passiveAnimation) {
            clearInterval(timerID);
            setPassiveAnimation(false);
        }
        setActiveButton(buttonIndex)
    }
    
    return (
        <Container>
            <h2>Fast-track your COVID Insights</h2>
            <ButtonContainer>
                <CTAButton 
                    className={activeButton===0 && passiveAnimation 
                        ? 'active' : activeButton===0 ? 'subtleActive' : ''}
                    onMouseEnter={() => handleButton(0)}
                    onClick={() => handleButton(0)}
                >
                    <span className="text">Track Vaccination Progress</span>
                    <span className="progressBar"></span>
                </CTAButton>
                <CTAButton                     
                    className={activeButton===1 && passiveAnimation 
                        ? 'active' : activeButton===1 ? 'subtleActive' : ''}
                    onMouseEnter={() => handleButton(1)}
                    onClick={() => handleButton(1)}
                >
                    <span className="text">Analyze Mobility Trends</span>
                    <span className="progressBar"></span>
                </CTAButton>
                <CTAButton 
                    className={activeButton===2 && passiveAnimation 
                        ? 'active' : activeButton===2 ? 'subtleActive' : ''}
                    onMouseEnter={() => handleButton(2)}
                    onClick={() => handleButton(2)}
                >
                    <span className="text">Understand Health Contexts</span>
                    <span className="progressBar"></span>
                </CTAButton>
            </ButtonContainer>
            <SummaryContainer buttonIndex={activeButton}>
                {activeButton === 0 && 
                    <SummaryItem>
                        <Grid container spacing={5}>
                            <Grid item xs={12} md={3}>
                                <TextContainer>
                                    <h3 className="metricTitle">
                                        Nationwide<br/>1st Dose
                                    </h3>
                                </TextContainer>
                                    <TextContainer>
                                    <h4>
                                        {summaryInsights.vaccineDose1}%
                                    </h4>
                                </TextContainer>
                            </Grid>
                            <Grid item xs={12} md={3}>
                                <TextContainer>
                                    <h3 className="metricTitle">
                                        Nationwide<br/>Fully Vaccination
                                    </h3>
                                </TextContainer>
                                <TextContainer>
                                    <h4>
                                        {summaryInsights.vaccineDose2}%
                                    </h4>
                                </TextContainer>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextContainer>
                                    <h3 className="metricTitle">
                                        Average doses on hand <br/>per 100 people
                                    </h3>
                                </TextContainer>
                                <TextContainer>
                                    <h4>
                                        {summaryInsights.vaccineDist}
                                    </h4>
                                </TextContainer>
                            </Grid>
                        </Grid>
                    </SummaryItem>}
                    {activeButton === 1 && 
                    <SummaryItem>
                        <Grid container spacing={5}>
                            <Grid item xs={12} md={3}>
                                <TextContainer>
                                    <h3 className="metricTitle">
                                        Daily % of <br/> of Full Time Behavior
                                    </h3>
                                </TextContainer>
                                    <TextContainer>
                                    <h4>
                                        {summaryInsights.pctFulltime}%
                                    </h4>
                                </TextContainer>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextContainer>
                                    <h3 className="metricTitle">
                                        Daily % of <br/> Part Time Behavior
                                    </h3>
                                </TextContainer>
                                <TextContainer>
                                    <h4>
                                        {summaryInsights.pctParttime}%
                                    </h4>
                                </TextContainer>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <TextContainer>
                                    <h3 className="metricTitle">
                                        Daily % of <br/> of At-Home Behavior
                                    </h3>
                                </TextContainer>
                                <TextContainer>
                                    <h4>
                                        {summaryInsights.pctHometime}%
                                    </h4>
                                </TextContainer>
                            </Grid>
                        </Grid>
                    </SummaryItem>}
                    {activeButton === 2 && 
                    <SummaryItem>
                        <Grid container spacing={5}>
                            <Grid item xs={12} md={4}>
                                <TextContainer>
                                    <h3 className="metricTitle">
                                        Median % of People <br/>with no Health Insurance
                                    </h3>
                                </TextContainer>
                                    <TextContainer>
                                    <h4>
                                        {summaryInsights.uninsured}%
                                    </h4>
                                </TextContainer>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextContainer>
                                    <h3 className="metricTitle">
                                        Median Ratio of People<br/> to Primary Care Physicians 
                                    </h3>
                                </TextContainer>
                                <TextContainer>
                                    <h4>
                                        {summaryInsights.pcpRatio.toLocaleString('en')}:1
                                    </h4>
                                </TextContainer>
                            </Grid>
                        </Grid>
                    </SummaryItem>}
                <GoToMap 
                    href={activeButton === 0 ? '' : activeButton === 1 ? '' : ''}
                > Go To Map {SVG.arrow} </GoToMap>
            </SummaryContainer>
        </Container>
    )
}

export default FastTrackInsights