import axios from "axios";
import React, {useEffect} from "react";


export const tops =[
    {id: 1, district: "In Musanze", hotel: "Hotel Saint Quentin", img: require("../assets/images/samplePng.png"), gradient: ["#2E3192", "#1BFFFF"]},
    {id: 2, district: "In Kigali", hotel: "Hotel Marriot", img: require("../assets/images/samplePng2.png"), gradient: ["#D4145A", "#FBB03B"]},
    {id: 3, district: "In Rubavu", hotel: "Saga Bay", img: require("../assets/images/samplePng6.png"), gradient: ["#009245", "#FCEE21"]},
    {id: 4, district: "In Huye", hotel: "Boni Consilli", img: require("../assets/images/samplePng4.png"), gradient: ["#662D8C", "#ED1E79"]},
    {id: 5, district: "In Nyamata", hotel: "La Palace", img: require("../assets/images/samplePng5.png"), gradient: ["#09203F", "#537895"]},
]