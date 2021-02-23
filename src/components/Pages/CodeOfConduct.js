// Main Import
import React, {useState, useEffect} from 'react';
import ReactMarkdown from 'react-markdown'
import styled from 'styled-components';

// Pre-styled components
import { ContentContainer, Gutter } from '../../styled_components';

// Header and footer components
import { StaticNavbar, Footer } from '../';

// Colors
import { colors } from '../../config';

// Scoped CSS
const ConductPage = styled.div`
    background:${colors.white};
`

function CodeOfConduct(){
    // State to hold code of conduct markdown
    const [codeText, setCodeText] = useState('')

    // On initial load, fetch markdown and load body.text() of resposne into state
    useEffect(() => {
        fetch(`${process.env.PUBLIC_URL}/code-of-conduct.md`).then(r => r.text()).then(text => {
            setCodeText(text)
        })
    }, [])

    // return page, ReactMarkdown parses markdown
    return (
       <ConductPage>
           <StaticNavbar/>
           <ContentContainer>
                <ReactMarkdown>{codeText}</ReactMarkdown>
           </ContentContainer>
           <Footer/>
       </ConductPage>
    );
}
 
export default CodeOfConduct;