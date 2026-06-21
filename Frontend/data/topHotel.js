import axios from "axios";
import React, {useEffect} from "react";


export const tops =[
    {id: 1, district: "In Kigali", hotel: "Raddison Blu", img: require("../assets/images/top10.png"), gradient: ["#2E3192", "#1BFFFF"]},
    {id: 2, district: "In Kigali", hotel: "Hotel Marriot", img: require("../assets/images/top11.png"), gradient: ["#D4145A", "#FBB03B"]},
    {id: 3, district: "In Musanze", hotel: "Faraja Hotel", img: require("../assets/images/top12.png"), gradient: ["#009245", "#FCEE21"]},
    {id: 4, district: "In Kigali", hotel: "Convention Center", img: require("../assets/images/top13.png"), gradient: ["#662D8C", "#ED1E79"]},
    {id: 5, district: "In Rubavu", hotel: "Hill View", img: require("../assets/images/top14.png"), gradient: ["#09203F", "#537895"]},
]