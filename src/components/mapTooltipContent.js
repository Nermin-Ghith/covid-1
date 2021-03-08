import React from 'react';
// This component handles and formats the map tooltip info. 
// The props passed to this component should contain an object of the hovered object (from deck, info.object by default)
const MapTooltipContent = (props) => {
    // destructure the object for cleaner formatting
    if (props.content === undefined) return;
    const properties = 
        props.content['county_1p3a.geojson']||
        props.content['county_usfacts.geojson']||
        props.content['county_nyt.geojson']||
        props.content['state_1p3a.geojson']||
        props.content['state_usafacts.geojson']||
        props.content['state_nyt.geojson']||
        props.content['global_jhu.geojson']||
        props.content['cdc.geojson']||
        props.content['safegraph.geojson']

    const cases = 
        props.content['covid_confirmed_usafacts_state']||
        props.content['covid_confirmed_usafacts']||
        props.content['covid_confirmed_1p3a_state']||
        props.content['covid_confirmed_1p3a']||
        props.content['covid_confirmed_nyt_state']||
        props.content['covid_confirmed_nyt']||
        props.content['covid_confirmed_cdc_state']||
        props.content['covid_confirmed_cdc']

    const deaths =
        props.content['covid_deaths_usafacts_state']||
        props.content['covid_deaths_usafacts']||
        props.content['covid_deaths_1p3a_state']||
        props.content['covid_deaths_1p3a']||
        props.content['covid_deaths_nyt_state']||
        props.content['covid_deaths_nyt']||
        props.content['covid_deaths_cdc_state']||
        props.content['covid_deaths_cdc']

    const { vaccine_dist_cdc, vaccine_admin1_cdc, vaccine_admin2_cdc, 
        covid_wk_pos_cdc_state, covid_wk_pos_cdc, covid_tcap_cdc_state, covid_tcap_cdc,
        covid_testing_cdc_state, covid_testing_cdc
    } = props.content;
    // const
    if (properties === undefined) {
        return <></>
    } else {
        return (
            <div>
                {properties && <h3>{+properties.GEOID > 999 ? `${properties.NAME}, ${properties.state_name}` : properties.NAME}</h3>}
                <hr/>
                {cases && <>Cases: {(cases[props.index]||0).toLocaleString('en')}<br/></>}
                {deaths && <>Deaths: {(deaths[props.index]||0).toLocaleString('en')}<br/></>}
                <br/>
                {cases && <>Daily New Cases: {((cases[props.index] - cases[props.index-1])||0).toLocaleString('en')}<br/></>}
                {deaths && <>Daily New Deaths: {((deaths[props.index] - deaths[props.index-1])||0).toLocaleString('en')}<br/></>}

                {covid_testing_cdc && <><br/>Total Tests Conducted: {(covid_testing_cdc[props.index]).toLocaleString('en')}<br/></>}
                {covid_wk_pos_cdc && <>7-Day Positivity Rate: {Math.round(covid_wk_pos_cdc[props.index]*10000)/100}%<br/></>}
                {covid_tcap_cdc && <>7-Day Testing Capacity: {Math.round(covid_tcap_cdc[props.index]*100)/100} per 100k<br/></>}
                {covid_testing_cdc_state && <><br/>7-Day Tests Conducted: {(covid_testing_cdc_state[props.index]).toLocaleString('en')}<br/></>}
                {covid_wk_pos_cdc_state && <>7-Day Positivity Rate: {Math.round(covid_wk_pos_cdc_state[props.index]*10000)/100}%<br/></>}
                {covid_tcap_cdc_state && <>7-Day Testing Capacity: {Math.round(covid_tcap_cdc_state[props.index]*100)/100} per 100k<br/></>}
                
                {vaccine_admin1_cdc && <><br/>Percent Received First Dose: {Math.round((vaccine_admin1_cdc[props.index]/properties.population)*1000)/10}%<br/></>}
                {vaccine_admin2_cdc && <>Percent Full Vaccinated: {Math.round((vaccine_admin2_cdc[props.index]/properties.population)*1000)/10}%<br/></>}
                {vaccine_dist_cdc && <>Doses to be administered per 100K: {Math.round((vaccine_dist_cdc[props.index]/properties.population)*1000)/10}%<br/></>}
            </div> 
        )
    }
}

export default MapTooltipContent