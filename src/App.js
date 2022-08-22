import React, { useEffect, useState } from 'react';
import {
  MenuItem,
  FormControl,
  Select,
  Card,
  CardContent,
} from "@material-ui/core";
import numeral from "numeral";
import Infobox from './components/Infobox/InfoBox';
import LineGraph from './components/LineGraph/LineGraph';
import Map from './components/Map/Map';
import Table from './components/Table/Table';
import { sortData, prettyPrintStat } from './components/utils/utils';
import "leaflet/dist/leaflet.css"
import './App.css'

function App() {
  const [country, setInputCountry] = useState("worldwide");
  const [countryInfo, setCountryInfo] = useState({});
  const [countries, setCountries] = useState([]);
  const [mapCountries, setMapCountries] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [casesType, setCasesType] = useState("cases");
  const [mapCenter, setMapCenter] = useState({ lat: -33.462701, lng:-70.618864 });
  const [mapZoom, setMapZoom] = useState(3);

  
  useEffect(() => {
    fetch("https://disease.sh/v3/covid-19/all")
      .then((response) => response.json())
      .then((data) => {
        setCountryInfo(data);
      });
  }, []);

  useEffect(() => {
    const getCountriesData = async () => {
      fetch("https://disease.sh/v3/covid-19/countries")
        .then((response) => response.json())
        .then((data) => {
          const countries = data.map((country) => ({
            name: country.country,
            value: country.countryInfo.iso2,
          }));
          let sortedData = sortData(data);
          setCountries(countries);
          setMapCountries(data);
          setTableData(sortedData);
        });
    };

    getCountriesData();
  }, []);

  console.log(casesType);

  const onCountryChange = async (e) => {
    const countryCode = e.target.value;

    const url =
      countryCode === "worldwide"
        ? "https://disease.sh/v3/covid-19/all"
        : `https://disease.sh/v3/covid-19/countries/${countryCode}`;
    await fetch(url)
      .then((response) => response.json())
      .then((data) => {
        setInputCountry(countryCode);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
        setMapZoom(4);
      });
  };

  return (
    <div className="app">
      <div className="app_left">
        <div className="app_header">
          <h1>Covid Tracker</h1>
          <FormControl className="app_dropdown">
            <Select
            variant="outlined"
            value={country}
            onChange={onCountryChange}
            >
              <MenuItem value="worldwide"> Paises</MenuItem>
              {countries.map((country) =>{
                <MenuItem value={country.value}>{country.name}</MenuItem>
              })}
            </Select>
          </FormControl>
        </div>
        <div className="app_stats">
        <Infobox
            onClick={(e) => setCasesType("cases")}
            title="Casos activos de coronavirus"
            isRed
            active={casesType === "cases"}
            cases={prettyPrintStat(countryInfo.todayCases)}
            total={numeral(countryInfo.cases).format("0.0a")}
          />
          <Infobox
            onClick={(e) => setCasesType("recovered")}
            title="Recuperados"
            active={casesType === "recovered"}
            cases={prettyPrintStat(countryInfo.todayRecovered)}
            total={numeral(countryInfo.recovered).format("0.0a")}
          />
          <Infobox
            onClick={(e) => setCasesType("deaths")}
            title="Muertes por coronavirus"
            isRed
            active={casesType === "deaths"}
            cases={prettyPrintStat(countryInfo.todayDeaths)}
            total={numeral(countryInfo.deaths).format("0.0a")}
          />
        </div>
          <Map
            countries={mapCountries}
            casesType={casesType}
            center={mapCenter}
            zoom={mapZoom}
          />
        </div>
        <Card className="app__right">
          <CardContent>
            <div className="app__information">
              <h3>Casos por país</h3>
                <Table countries={tableData} />
              <h3>Nuevos casos a nivel mundial {casesType}</h3>
              <LineGraph casesType={casesType} />
            </div>
          </CardContent>
      </Card>
    </div>
  );
}

export default App;
