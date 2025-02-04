import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Grid from '@material-ui/core/Grid';

import { ContentContainer, Gutter } from '../../styled_components';
import { StaticNavbar, Footer } from '../';
import { colors } from '../../config';

const InsightsPage = styled.div`
    background:white;
    min-height:100vh;
    footer {
        bottom:0;
    }
`

const ArticleCard = styled(Grid)`
    padding:0;
    margin-bottom:20px;
    transition:250ms all;
    border:1px solid ${colors.lightgray};
    background:white;
    .thumbnailContainer {
        overflow: hidden;
        height: 0;
        padding-top: 56.25%;
    }
    img {
        margin-top:-56.25%;
        width:100%;
        display:block;
    }
    h2.cardTitle {
        letter-spacing:0;
        font-size:1.25rem;
        color:${colors.black};
        transition:250ms all;
        padding:10px 40px 0px 10px;
        margin:0;
    }
    p.date {
        padding:0px 40px 10px 10px;
        font-size:0.75rem;
    }
    p.description {
        text-overflow: ellipsis;
        max-height:2rem;
    }
    &:hover {
        @media (min-width:1024px){
            transform:scale(1.1) translateY(-10%);
            box-shadow:2px 2px 5px rgba(0,0,0,0.1);
        }
        h2.cardTitle {
            color: ${colors.pink};
        }
    }
`


const ProductCard = styled(Grid)`
    padding:0;
    margin-bottom:20px;
    transition:250ms all;
    background:white;
    .thumbnailContainer {
        overflow: hidden;
        height: 0;
        padding-top: 56.25%;
    }
    img {
        width:100%;
    }
    h2 {
        letter-spacing:0;
        font-size:2rem;
        color:${colors.black};
    }
    p.description {
        text-overflow: ellipsis;
        max-height:2rem;
    }
`

const TabBar = styled.div`
`

const Tab = styled.button`
    background:${props => props.active ? colors.yellow : colors.white};
    font-size:2rem;
    font-family:'Playfair Display', serif;
    outline:none;
    border:none;
    border-bottom:1px solid ${colors.gray};
    padding:5px 10px;
    margin:0 10px;
    cursor:pointer;
    transition:250ms all;

`

const TabPanel = styled.div`
    display:${props => props.display ? 'initial' : 'none'};
`

const products = [
    {
        'title':'All Our US Covid Deaths',
        'description':<p>
            When COVID-19 related deaths in the US passed 100,000, the loss was described as "incalculable." 
            Recently, the nation surpassed 500,000 deaths, a loss that is no longer just incalculable, but incomprehensible. 
            <br/><br/>
            This visualization attempts to place this loss in space, around parks and cities you might know or remember, from trips, growing up, or daily life. 
            Remembering and facing the price of COVID-19 is not easy, but forgetting it may cost even more.
            <br/><br/>
        </p>,
        'thumbnail':`${process.env.PUBLIC_URL}/products/500000.png`,
        'alt':'A group of figures stands near the St Louis Gateway arch, a massive 630 foot tall monument. Each one represents a life in the us lost to COVID19.',
        'link':`${process.env.PUBLIC_URL}/500000`,
    }
]
  
function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function Insights(){

    const [ rssFeed, setRssFeed] = useState({
        feed: {},
        items: []
    })

    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        fetch('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/covidatlas')
            .then(r => r.json())
            .then(r => {
                setRssFeed(r)
            })
    }, [])

    return (
       <InsightsPage>
           <StaticNavbar/>
           <ContentContainer>
           <TabBar position="static">
                <Tab {...a11yProps(0)} active={tabValue === 0} onClick={() => setTabValue(0)}>Blog</Tab>
                <Tab {...a11yProps(1)} active={tabValue === 1} onClick={() => setTabValue(1)}>Stories</Tab>
            </TabBar>
            <TabPanel display={tabValue===0}>
                <Gutter h={20}/>
                {
                    rssFeed.items.map(article => 
                        <ArticleCard container spacing={0}>
                            <Grid item xs={12} md={4} lg={2}>
                                <a href={article.link} target="_blank" rel="noopener noreferrer">
                                    <div className="thumbnailContainer">
                                        <img src={article.thumbnail} alt={`Thumbnail for ${article.title}`} />
                                    </div>
                                </a>
                            </Grid>
                            <Grid item xs={12} md={8} lg={10}>
                                <a href={article.link} target="_blank" rel="noopener noreferrer">
                                    <h2 className="cardTitle" dangerouslySetInnerHTML={{__html:article.title}}></h2>
                                    <p className="date">{article.pubDate?.split(' ')[0]}</p>
                                    
                                </a>
                                
                            </Grid>
                        </ArticleCard>
                    )
                }  
                <hr/>
                <p>Read more at <a href="https://medium.com/covidatlas" target="_blank" rel="noopener noreferrer">Medium.com/CovidAtlas</a></p>
            </TabPanel>      
            <TabPanel display={tabValue===1}>
                <Gutter h={20}/>
                <p>
                    Not every COVID-19 story fits neatly in the Atlas, so the projects below are narrative, research, and exploratory
                    efforts to better understand the complex relationships between health, places, and people. 
                </p>
                <hr/>
                <Gutter h={20}/>
                {products.map(entry => 
                    <ProductCard container spacing={2}>
                        <Grid item xs={12} md={4}>
                            <a href={entry.link}>
                                <img src={entry.thumbnail} alt={entry.alt}/>
                            </a>
                        </Grid>
                        <Grid item xs={12} md={8}>
                            <a href={entry.link}>
                                <h2>{entry.title}</h2>
                            </a>
                            {entry.description}
                            <a href={entry.link}>See more</a>
                        </Grid>
                    </ProductCard>)}
            </TabPanel>              
           </ContentContainer>
           <Footer/>
       </InsightsPage>
    );
}