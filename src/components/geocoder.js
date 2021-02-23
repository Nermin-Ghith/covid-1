// This component contains the alternative option to the Mapbox built-in geocoder
// The built-in geocoder is somewhat sketchy in react, particularly with the z-index layer
// we used to overcome labelling while still having separate canvases.
// This component is largely based on the Material UI autocomplete Google Maps API example

// General imports, state
import React, { useState } from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import styled from 'styled-components';

// Throttle function to preserve API calls
import throttle from 'lodash/throttle';

// Config
import { colors } from '../config';

// Scoped CSS
const Container = styled.div`
    flex:auto;
    width:100%;
    .MuiFormControl-root {
        margin:0;
    }
    .MuiAutocomplete-inputRoot {
        background:white;
        height:36px;
        border-radius:0px;
        padding:0 35px;
    }
    .MuiAutocomplete-inputRoot[class*="MuiInput-root"] .MuiAutocomplete-input:first-child {
        padding:0;
    }
    .MuiInput-underline:hover:not(.Mui-disabled):before {
        border-bottom:2px solid ${colors.yellow};
    }
    .MuiInput-underline:after {
        border-bottom:2px solid ${colors.strongOrange};

    }
    .MuiFormControl-root .MuiInputBase-adornedEnd:before {
        display: block;
        content: ' ';
        background-image: url("${process.env.PUBLIC_URL}/assets/img/search.svg");
        background-size: 20px 20px;
        height: 20px;
        width: 20px;
        transform:translate(8px, -9px);
        border-bottom:none !important;
    }

`

const StyledOption = styled.span`
    span {
        display:block;
        font-size:12px;
        &:first-child {
            font-size:16px;
            font-weight:bold;
        }

    }
`

// Geocoder function. Props include API key , input styles, and callback
function Geocoder(props){
    // Stateful search results
    const [searchState, setSearchState] = useState({
        results: [],
        value: '',
    })

    // Helper function to load in results
    const loadResults = (results) => {
        setSearchState(prev => ({
            ...prev,
            results
        }))
    }

    // reset component
    const clearInput = () => {
        setSearchState({
            results: [],
            value: '',
        })
    }
    
    // Simple arrow function to return mapbox API url
    const buildAddress = (text) => `https://api.mapbox.com/geocoding/v5/mapbox.places/${text}.json?access_token=${props.API_KEY}&country=US&autocomplete=true&types=region%2Cdistrict%2Cpostcode%2Clocality%2Cplace%2Caddress`

    // Promise to build URL then get results and callback on features
    const getMapboxResults = async (text, callback) => fetch(buildAddress(text)).then(r => r.json()).then(r => callback(r.features))

    // Memoized query to reduce calls
    const queryMapbox = React.useMemo(
        () =>
          throttle((text, callback) => {
                getMapboxResults(text, callback)
          }, 200),
        [],
      );
      
    // Query mapbox based on value, if longer than 3 characters, then load results from
    // mapbox API into state
    const handleSearch = async (e) => {
        if (e.target.value.length > 3) {
            queryMapbox(e.target.value, (r) => loadResults(r))

        }
    }

    // helper function to format conditionally based on what information 
    // is available from the return
    const formatPlaceContext = (contextArray) => {
        let returnString = ``
        for (let i=0; i<contextArray.length; i++) {
            if (
                contextArray[i].id.includes('region')
                ||
                contextArray[i].id.includes('country')
                ||
                contextArray[i].id.includes('place')
                ||
                contextArray[i].id.includes('neighborhood')
            ) {
                returnString += `${contextArray[i].text}, `
            }
        }
        return returnString.slice(0,-2)
    }
    
    // main return
    return (
        <Container>
            <Autocomplete
                id="geocoder search"
                freeSolo
                disableClearable
                // No filter on options, since options are already the API results
                filterOptions={(x) => x}
                autoComplete
                clearOnEscape
                inputValue={searchState.value}
                options={searchState.results}
                getOptionLabel={option => option.place_name}
                // Callback to props
                onChange={(source, selectedOption) => {
                    clearInput();
                    props.onChange(selectedOption);
                }}
                // Rendering style for list options
                renderOption={(option, idx) => (
                    <React.Fragment>
                        <StyledOption id={idx}>
                            <span>{option.place_name.split(',')[0]}</span>
                            <span>{formatPlaceContext(option.context)}</span>
                        </StyledOption>
                    </React.Fragment>
                )}
                // Rendering style for main input
                renderInput={(params) => (
                    <TextField
                    {...params}
                    margin="normal"
                    placeholder={props.placeholder}
                    InputProps={{ ...params.InputProps, type: 'search' }}
                    onChange={(e) => {               
                        setSearchState(prev => ({
                            ...prev,
                            value: e.target.value,
                        }));
                        handleSearch(e)}
                    }
                    />
                )}
                style={props.style}
            />
        </Container>
    )
}

export default Geocoder