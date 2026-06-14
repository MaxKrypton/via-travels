import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Foundation from '@expo/vector-icons/Foundation';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export const categories = [
    {id: 1, icon: <MaterialCommunityIcons name="city" size={40} color="#1995AD" style={{marginRight: 10}}/>, category: "City Hotels"},
    {id: 2, icon:<MaterialCommunityIcons name="beach" size={40} color="#1995AD" style={{marginRight: 10}}/>, category: "Beach"},
    {id: 3, icon:<Foundation name="mountains" size={40} color="#1995AD" style={{marginRight: 10}}/>, category: "Mountain"},
    {id: 4, icon:<MaterialCommunityIcons name="forest" size={40} color="#1995AD" style={{marginRight: 10}}/>, category: "Countryside"},
    {id: 5, icon:<MaterialIcons name="casino" size={40} color="#1995AD" style={{marginRight: 10}}/>, category: "Casino"},
]