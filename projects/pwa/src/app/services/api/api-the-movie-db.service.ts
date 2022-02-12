import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { forkJoin, of,tap } from "rxjs";

export interface ITheMovieDbShow {
    backdrop_path: string | null; //  "/8Xs20y8gFR0W9u8Yy9NKdpZtSu7.jpg"
    first_air_date: string; //  "2022-01-28"
    genre_ids: number[]; // [18, 10765];
    id: number; //  99966;
    name: string; //  "All of Us Are Dead"
    origin_country: string[]; //['KR']
    original_language: string; //  "ko"
    original_name: string; //  "지금 우리 학교는"
    overview: string; //  "A high school becomes ground zero for a zombie virus outbreak. Trapped students must fight their way out — or turn into one of the rabid infected."
    popularity: number; //  6313.212
    poster_path: string; //  "/pTEFqAjLd5YTsMD6NSUxV6Dq7A6.jpg"
    vote_average: number; //  8.8
    vote_count: number; //  1017
}

export interface ITheMovieDbPopular {
    page: number;
    results: ITheMovieDbShow[];
    total_pages: number;
    total_results: number;
}

export interface ITheMovieDbExternalIds {
    id: number; // 110492 // themoviedb
    imdb_id: string; // "tt13146488";
    tvdb_id: number; // 391153;
    facebook_id: string; // "DCPeacemaker";
    instagram_id: string; // "hbomaxpeacemaker";
    twitter_id: string; // "DCpeacemaker";
}
export interface ITheMovieDbGenre
{
    genres:{id: number; name: string}[]
}
export interface ITheMovieDbConfiguration
{
    change_keys: string[];
    images: {
        backdrop_sizes: string[]; // ['w300', 'w780', 'w1280', 'original']
        base_url: string; // "http://image.tmdb.org/t/p/"
        logo_sizes: string[]; // (7) ['w45', 'w92', 'w154', 'w185', 'w300', 'w500', 'original']
        poster_sizes: string[]; //  (7) ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original']
        profile_sizes: string[]; // (4) ['w45', 'w185', 'h632', 'original']
        secure_base_url: string; // "https://image.tmdb.org/t/p/"
        still_sizes: string[]; //  (4) ['w92', 'w185', 'w300', 'original']}
    }
}

/**
 * https://developers.themoviedb.org/3/tv/get-popular-tv-shows
 */
@Injectable({ providedIn: 'root' })
export class ApiTheMovieDbService {
    constructor(private http: HttpClient,) { }
    private apiKey = '1313d18d670b66715fb862d8eff63c5c';

    getPopularWithReference() {
        return forkJoin([
            this.getConfiguration(),
            this.getGenres(),
            this.getPopular()
        ])
    }

    getPopular() {
        // return of(popularMock)
        return this.http.get<ITheMovieDbPopular>(`https://api.themoviedb.org/3/tv/popular?api_key=${this.apiKey}&language=en-US&page=1`);
    }

    getExternal(tv_id:number) {
        return this.http.get<ITheMovieDbExternalIds>(`https://api.themoviedb.org/3/tv/${tv_id}/external_ids?api_key=${this.apiKey}&language=en-US`)
    }

    getGenres() {
        // return of(genreMock);
        return this.http.get<ITheMovieDbGenre>(`https://api.themoviedb.org/3/genre/tv/list?api_key=${this.apiKey}&language=en-US`);
    }

    getConfiguration() {
        // return of(configurationMock);
        return this.http.get<ITheMovieDbConfiguration>(`https://api.themoviedb.org/3/configuration?api_key=${this.apiKey}`);
    }
}

// const configurationMock: ITheMovieDbConfiguration =
// {
//     "images": {
//         "base_url": "http://image.tmdb.org/t/p/",
//         "secure_base_url": "https://image.tmdb.org/t/p/",
//         "backdrop_sizes": [
//             "w300",
//             "w780",
//             "w1280",
//             "original"
//         ],
//         "logo_sizes": [
//             "w45",
//             "w92",
//             "w154",
//             "w185",
//             "w300",
//             "w500",
//             "original"
//         ],
//         "poster_sizes": [
//             "w92",
//             "w154",
//             "w185",
//             "w342",
//             "w500",
//             "w780",
//             "original"
//         ],
//         "profile_sizes": [
//             "w45",
//             "w185",
//             "h632",
//             "original"
//         ],
//         "still_sizes": [
//             "w92",
//             "w185",
//             "w300",
//             "original"
//         ]
//     },
//     "change_keys": [
//         "adult",
//         "air_date",
//         "also_known_as",
//         "alternative_titles",
//         "biography",
//         "birthday",
//         "budget",
//         "cast",
//         "certifications",
//         "character_names",
//         "created_by",
//         "crew",
//         "deathday",
//         "episode",
//         "episode_number",
//         "episode_run_time",
//         "freebase_id",
//         "freebase_mid",
//         "general",
//         "genres",
//         "guest_stars",
//         "homepage",
//         "images",
//         "imdb_id",
//         "languages",
//         "name",
//         "network",
//         "origin_country",
//         "original_name",
//         "original_title",
//         "overview",
//         "parts",
//         "place_of_birth",
//         "plot_keywords",
//         "production_code",
//         "production_companies",
//         "production_countries",
//         "releases",
//         "revenue",
//         "runtime",
//         "season",
//         "season_number",
//         "season_regular",
//         "spoken_languages",
//         "status",
//         "tagline",
//         "title",
//         "translations",
//         "tvdb_id",
//         "tvrage_id",
//         "type",
//         "video",
//         "videos"
//     ]
// }
// const genreMock: ITheMovieDbGenre =
// {
//     "genres": [
//         {
//             "id": 10759,
//             "name": "Action & Adventure"
//         },
//         {
//             "id": 16,
//             "name": "Animation"
//         },
//         {
//             "id": 35,
//             "name": "Comedy"
//         },
//         {
//             "id": 80,
//             "name": "Crime"
//         },
//         {
//             "id": 99,
//             "name": "Documentary"
//         },
//         {
//             "id": 18,
//             "name": "Drama"
//         },
//         {
//             "id": 10751,
//             "name": "Family"
//         },
//         {
//             "id": 10762,
//             "name": "Kids"
//         },
//         {
//             "id": 9648,
//             "name": "Mystery"
//         },
//         {
//             "id": 10763,
//             "name": "News"
//         },
//         {
//             "id": 10764,
//             "name": "Reality"
//         },
//         {
//             "id": 10765,
//             "name": "Sci-Fi & Fantasy"
//         },
//         {
//             "id": 10766,
//             "name": "Soap"
//         },
//         {
//             "id": 10767,
//             "name": "Talk"
//         },
//         {
//             "id": 10768,
//             "name": "War & Politics"
//         },
//         {
//             "id": 37,
//             "name": "Western"
//         }
//     ]
// }
// const popularMock: ITheMovieDbPopular =
// {
//     "page": 1,
//     "results": [{
//         "backdrop_path": "/8Xs20y8gFR0W9u8Yy9NKdpZtSu7.jpg",
//         "first_air_date": "2022-01-28",
//         "genre_ids": [18, 10765],
//         "id": 99966,
//         "name": "All of Us Are Dead",
//         "origin_country": ["KR"],
//         "original_language": "ko",
//         "original_name": "지금 우리 학교는",
//         "overview": "A high school becomes ground zero for a zombie virus outbreak. Trapped students must fight their way out — or turn into one of the rabid infected.",
//         "popularity": 6313.212,
//         "poster_path": "/pTEFqAjLd5YTsMD6NSUxV6Dq7A6.jpg",
//         "vote_average": 8.8,
//         "vote_count": 1017
//     }, {
//         "backdrop_path": "/oKt4J3TFjWirVwBqoHyIvv5IImd.jpg",
//         "first_air_date": "2019-06-16",
//         "genre_ids": [18],
//         "id": 85552,
//         "name": "Euphoria",
//         "origin_country": ["US"],
//         "original_language": "en",
//         "original_name": "Euphoria",
//         "overview": "A group of high school students navigate love and friendships in a world of drugs, sex, trauma, and social media.",
//         "popularity": 5096.003,
//         "poster_path": "/jtnfNzqZwN4E32FGGxx1YZaBWWf.jpg",
//         "vote_average": 8.4,
//         "vote_count": 6403
//     }, {
//         "backdrop_path": "/r8CGqB8IJNbA1IruHWquS7YttNB.jpg",
//         "first_air_date": "1995-10-23",
//         "genre_ids": [10766],
//         "id": 966,
//         "name": "Hollyoaks",
//         "origin_country": ["GB"],
//         "original_language": "en",
//         "original_name": "Hollyoaks",
//         "overview": "The daily soap that follows the loves, lives and misdemeanours of a group of people living in the Chester village of Hollyoaks where anything could, and frequently does, happen...",
//         "popularity": 3201.997,
//         "poster_path": "/bpmLMZP3M1vLujPqHnOTnKVjRJY.jpg",
//         "vote_average": 5.2,
//         "vote_count": 36
//     }, {
//         "backdrop_path": "/sjx6zjQI2dLGtEL0HGWsnq6UyLU.jpg",
//         "first_air_date": "2021-12-29",
//         "genre_ids": [10759, 10765],
//         "id": 115036,
//         "name": "The Book of Boba Fett",
//         "origin_country": ["US"],
//         "original_language": "en",
//         "original_name": "The Book of Boba Fett",
//         "overview": "Legendary bounty hunter Boba Fett and mercenary Fennec Shand must navigate the galaxy’s underworld when they return to the sands of Tatooine to stake their claim on the territory once ruled by Jabba the Hutt and his crime syndicate.",
//         "popularity": 3114.342,
//         "poster_path": "/gNbdjDi1HamTCrfvM9JeA94bNi2.jpg",
//         "vote_average": 8.3,
//         "vote_count": 872
//     }, {
//         "backdrop_path": "/ctxm191q5o3axFzQsvNPlbKoSYv.jpg",
//         "first_air_date": "2022-01-13",
//         "genre_ids": [10759, 35, 10765],
//         "id": 110492,
//         "name": "Peacemaker",
//         "origin_country": ["US"],
//         "original_language": "en",
//         "original_name": "Peacemaker",
//         "overview": "The continuing story of Peacemaker – a compellingly vainglorious man who believes in peace at any cost, no matter how many people he has to kill to get it – in the aftermath of the events of “The Suicide Squad.”",
//         "popularity": 3535.059,
//         "poster_path": "/hE3LRZAY84fG19a18pzpkZERjTE.jpg",
//         "vote_average": 8.7,
//         "vote_count": 721
//     }, {
//         "backdrop_path": "/pkOSjcllDSs4WP9i8DGkw9VgF5Q.jpg",
//         "first_air_date": "2015-07-06",
//         "genre_ids": [10764, 10751],
//         "id": 63452,
//         "name": "Wer weiß denn sowas?",
//         "origin_country": ["DE"],
//         "original_language": "de",
//         "original_name": "Wer weiß denn sowas?",
//         "overview": "",
//         "popularity": 1950.706,
//         "poster_path": "/abKjah96esLWObidBcWmvKJv61E.jpg",
//         "vote_average": 7.7,
//         "vote_count": 9
//     }, {
//         "backdrop_path": "/4tYspgwxmK2XRjhi71tuY6R2iGv.jpg",
//         "first_air_date": "2020-07-15",
//         "genre_ids": [9648, 18],
//         "id": 105214,
//         "name": "Dark Desire",
//         "origin_country": ["MX"],
//         "original_language": "es",
//         "original_name": "Oscuro deseo",
//         "overview": "Married Alma spends a fateful weekend away from home that ignites passion, ends in tragedy and leads her to question the truth about those close to her.",
//         "popularity": 1646.7,
//         "poster_path": "/uxFNAo2A6ZRcgNASLk02hJUbybn.jpg",
//         "vote_average": 7.3,
//         "vote_count": 3812
//     }, {
//         "backdrop_path": "/pkKUW6wk2yfPc66YF7647ARi6uv.jpg",
//         "first_air_date": "2009-10-05",
//         "genre_ids": [],
//         "id": 114439,
//         "name": "Let's Make a Deal",
//         "origin_country": ["US"],
//         "original_language": "en",
//         "original_name": "Let's Make a Deal",
//         "overview": "Audience members dress up in outlandish costumes to get host Wayne Brady's attention in an attempt to make deals for trips, prizes, cars or cash, while trying to avoid the dreaded Zonks.",
//         "popularity": 1444.496,
//         "poster_path": "/8lQkzJCwPpB0P6GieQeojUOW6PU.jpg",
//         "vote_average": 5.5,
//         "vote_count": 4
//     }, {
//         "backdrop_path": "/bX6embf0yknbV6R5NVUwM60FQXG.jpg",
//         "first_air_date": "2021-11-22",
//         "genre_ids": [10766, 35],
//         "id": 139009,
//         "name": "Quanto Mais Vida, Melhor!",
//         "origin_country": ["BR"],
//         "original_language": "pt",
//         "original_name": "Quanto Mais Vida, Melhor!",
//         "overview": "",
//         "popularity": 1328.054,
//         "poster_path": "/ydtfMZMu04L5noElS35BespN8rV.jpg",
//         "vote_average": 4.5,
//         "vote_count": 2
//     }, {
//         "backdrop_path": "/l6zdjUDOaklBWfxqa7AtbLr2EnA.jpg",
//         "first_air_date": "2021-12-13",
//         "genre_ids": [10751, 35, 18],
//         "id": 135753,
//         "name": "Love Twist",
//         "origin_country": ["KR"],
//         "original_language": "ko",
//         "original_name": "사랑의 꽈배기",
//         "overview": "A drama depicting a sweet twist in love between the parents and children of three families around the love of two main characters.",
//         "popularity": 1322.65,
//         "poster_path": "/5bTF522eYn6g6r7aYqFpTZzmQq6.jpg",
//         "vote_average": 4.5,
//         "vote_count": 2
//     }, {
//         "backdrop_path": "/4dqq8nB8xmdam9UoCDGSJ1dElE9.jpg",
//         "first_air_date": "2021-02-22",
//         "genre_ids": [],
//         "id": 6455,
//         "name": "Chain Reaction",
//         "origin_country": ["US"],
//         "original_language": "en",
//         "original_name": "Chain Reaction",
//         "overview": "Chain Reaction is an American game show created by Bob Stewart, in which players compete to form chains composed of two-word phrases.\n\nThe show aired three separate runs: Bill Cullen hosted the original series on NBC from January 14 to June 20, 1980. The second version aired on the USA Network from September 29, 1986 to December 27, 1991 and was hosted first by Blake Emmons and later by Geoff Edwards. Another version, hosted by Dylan Lane, premiered on August 1, 2006 on GSN. This version aired its final original episode on June 9, 2007 but has continued to air in reruns since, currently airing Mondays through Fridays at 3:00 PM and 3:30 PM ET on GSN. Starting August 2, 2013, it will air Fridays at 8:00 PM to 10:00 PM on GSN.",
//         "popularity": 651.632,
//         "poster_path": "/xhjoXm1WEvfQGYBGXKk8xk75z6s.jpg",
//         "vote_average": 4.3,
//         "vote_count": 3
//     }, {
//         "backdrop_path": "/wiE9doxiLwq3WCGamDIOb2PqBqc.jpg",
//         "first_air_date": "2013-09-12",
//         "genre_ids": [18, 80],
//         "id": 60574,
//         "name": "Peaky Blinders",
//         "origin_country": ["GB"],
//         "original_language": "en",
//         "original_name": "Peaky Blinders",
//         "overview": "A gangster family epic set in 1919 Birmingham, England and centered on a gang who sew razor blades in the peaks of their caps, and their fierce boss Tommy Shelby, who means to move up in the world.",
//         "popularity": 1086.698,
//         "poster_path": "/pE8CScObQURsFZ723PSW1K9EGYp.jpg",
//         "vote_average": 8.6,
//         "vote_count": 5242
//     }, {
//         "backdrop_path": "/ktDJ21QQscbMNQfPpZBsNORxdDx.jpg",
//         "first_air_date": "2016-01-25",
//         "genre_ids": [80, 10765],
//         "id": 63174,
//         "name": "Lucifer",
//         "origin_country": ["US"],
//         "original_language": "en",
//         "original_name": "Lucifer",
//         "overview": "Bored and unhappy as the Lord of Hell, Lucifer Morningstar abandoned his throne and retired to Los Angeles, where he has teamed up with LAPD detective Chloe Decker to take down criminals. But the longer he's away from the underworld, the greater the threat that the worst of humanity could escape.",
//         "popularity": 1065.864,
//         "poster_path": "/ekZobS8isE6mA53RAiGDG93hBxL.jpg",
//         "vote_average": 8.5,
//         "vote_count": 11468
//     }, {
//         "backdrop_path": "/6KlAnAzUj86UWcFGuTAOKmrAWKx.jpg",
//         "first_air_date": "2022-01-11",
//         "genre_ids": [18, 10765],
//         "id": 125474,
//         "name": "Naomi",
//         "origin_country": ["US"],
//         "original_language": "en",
//         "original_name": "Naomi",
//         "overview": "Follow a teen girl’s journey from her small northwestern town to the heights of the multiverse. When a supernatural event shakes her hometown to the core, Naomi sets out to uncover its origins, and what she discovers will challenge everything we believe about our heroes",
//         "popularity": 912.773,
//         "poster_path": "/xwS6ggTI8hTkVTz1I4U6BZ48pgZ.jpg",
//         "vote_average": 0,
//         "vote_count": 0
//     }, {
//         "backdrop_path": null,
//         "first_air_date": "1991-01-02",
//         "genre_ids": [10767],
//         "id": 62992,
//         "name": "DAS!",
//         "origin_country": ["DE"],
//         "original_language": "de",
//         "original_name": "DAS!",
//         "overview": "",
//         "popularity": 998.749,
//         "poster_path": "/yMg0l6hxCnR94Fcl1F1IEkmG26V.jpg",
//         "vote_average": 1,
//         "vote_count": 2
//     }, {
//         "backdrop_path": "/uro2Khv7JxlzXtLb8tCIbRhkb9E.jpg",
//         "first_air_date": "2010-10-31",
//         "genre_ids": [10759, 18, 10765],
//         "id": 1402,
//         "name": "The Walking Dead",
//         "origin_country": ["US"],
//         "original_language": "en",
//         "original_name": "The Walking Dead",
//         "overview": "Sheriff's deputy Rick Grimes awakens from a coma to find a post-apocalyptic world dominated by flesh-eating zombies. He sets out to find his family and encounters many other survivors along the way.",
//         "popularity": 900.276,
//         "poster_path": "/w21lgYIi9GeUH5dO8l3B9ARZbCB.jpg",
//         "vote_average": 8.1,
//         "vote_count": 12472
//     }, {
//         "backdrop_path": "/akuD37ySZGUkXR7LNb1oOHCboy8.jpg",
//         "first_air_date": "2014-10-07",
//         "genre_ids": [18, 10765],
//         "id": 60735,
//         "name": "The Flash",
//         "origin_country": ["US"],
//         "original_language": "en",
//         "original_name": "The Flash",
//         "overview": "After a particle accelerator causes a freak storm, CSI Investigator Barry Allen is struck by lightning and falls into a coma. Months later he awakens with the power of super speed, granting him the ability to move through Central City like an unseen guardian angel. Though initially excited by his newfound powers, Barry is shocked to discover he is not the only \"meta-human\" who was created in the wake of the accelerator explosion -- and not everyone is using their new powers for good. Barry partners with S.T.A.R. Labs and dedicates his life to protect the innocent. For now, only a few close friends and associates know that Barry is literally the fastest man alive, but it won't be long before the world learns what Barry Allen has become...The Flash.",
//         "popularity": 901.998,
//         "poster_path": "/lJA2RCMfsWoskqlQhXPSLFQGXEJ.jpg",
//         "vote_average": 7.8,
//         "vote_count": 9248
//     }, {
//         "backdrop_path": "/gIApbx2ffXVhJb2D4tiEx2b06nl.jpg",
//         "first_air_date": "2005-03-27",
//         "genre_ids": [18],
//         "id": 1416,
//         "name": "Grey's Anatomy",
//         "origin_country": ["US"],
//         "original_language": "en",
//         "original_name": "Grey's Anatomy",
//         "overview": "Follows the personal and professional lives of a group of doctors at Seattle’s Grey Sloan Memorial Hospital.",
//         "popularity": 947.65,
//         "poster_path": "/zPIug5giU8oug6Xes5K1sTfQJxY.jpg",
//         "vote_average": 8.3,
//         "vote_count": 7598
//     }, {
//         "backdrop_path": "/35SS0nlBhu28cSe7TiO3ZiywZhl.jpg",
//         "first_air_date": "2018-05-02",
//         "genre_ids": [10759, 18],
//         "id": 77169,
//         "name": "Cobra Kai",
//         "origin_country": ["US"],
//         "original_language": "en",
//         "original_name": "Cobra Kai",
//         "overview": "This Karate Kid sequel series picks up 30 years after the events of the 1984 All Valley Karate Tournament and finds Johnny Lawrence on the hunt for redemption by reopening the infamous Cobra Kai karate dojo. This reignites his old rivalry with the successful Daniel LaRusso, who has been working to maintain the balance in his life without mentor Mr. Miyagi.",
//         "popularity": 813.113,
//         "poster_path": "/6POBWybSBDBKjSs1VAQcnQC1qyt.jpg",
//         "vote_average": 8.2,
//         "vote_count": 4261
//     }, {
//         "backdrop_path": "/vjcuLy14kxgxCaBToAudZWrGQQh.jpg",
//         "first_air_date": "2021-01-18",
//         "genre_ids": [10764],
//         "id": 117031,
//         "name": "People Puzzler",
//         "origin_country": [],
//         "original_language": "en",
//         "original_name": "People Puzzler",
//         "overview": "Three lucky contestants put their pop culture knowledge to the test to complete iconic, People Puzzler crosswords. The player with the most points at the end of three rounds wins the game and goes on to play the \"Fast Puzzle Round\" for an enormous cash prize.",
//         "popularity": 1229.332,
//         "poster_path": "/gELQSCY5KKIGQAmOHbcgcRGNlp5.jpg",
//         "vote_average": 5.5,
//         "vote_count": 11
//     }],
//     "total_pages": 6216,
//     "total_results": 124304
// }
