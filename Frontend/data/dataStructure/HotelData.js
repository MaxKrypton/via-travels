const hotels = [
    {
        id: 1,
        name: "Hotel Palace",
        description: {
            long: "In Kigali",
            short: "The Gentil",
        },
        rating: 4,
        stars: 5,
        builtYear: 1995,
        renovationYear: 2023,
        address: {
            street: "KK 737 St",
            city: "Kigali",
            province: "Kigali",
            gps: {
                latitude: 1.9456,
                longitude: 30.0587,
            },
            mapUrl: "https://...",
        },
        category: "city hotel",
        sponsored: true,
        paymentOptions: ["Visa", "MasterCard", "Momo", "Irembo"],
        checkIn: "2017-02-12",
        checkOut: "2017-02-12",
        media: {
            photos: {
                landscape: [],
                portrait: [],
                profile: [],
                room: [],
                gallery: [],
                sponsored: [],
            },
            videos: {
                landscape: [],
                portrait: [],
                virtualTours: [],
            },
        },
        services: {
            rooms: [
                {
                    id: 1,
                    type: "single",
                    count: 23,
                    price: 22,
                    description: "",
                    photos: [],
                },
                {
                    id: 2,
                    type: "double",
                    count: 20,
                    price: 20,
                    description: "",
                    photos: [],
                },
            ],
            availability: {
                singleRooms: 10,
                doubleRooms: 5,
                kingRooms: 1,
            },
            menuDownloadUrl: "https://...",
        },
        reviews: [
            {
                id: "324234ada",
                userName: "Alain Quentin",
                profilePicture: "",
                date: "2024-12-24",
                content: "Decent experience overall, but there's room for improvement in performance.",
            },
        ],
    },
];
