import fetch from "node-fetch";

const routeHello = (): string => "Hello World!";

const routeAPINames = async (): Promise<string> => {
    let data: responseItemType[];
    try {
        const url = 'https://www.usemodernfullstack.dev/api/v1/users';
        const response = await fetch(url);
        data = (await response.json()) as responseItemType[];
    } catch (error) {
        return `Error: ${error}`;
    }
    const names = data
        .map((item) => `<li>${item.id}. ${item.name}</li>`)
        .join("<br>");
    return names;
};

const routeWeather = (query: WeatherQueryInterface): WeatherDetailType =>
    queryWeatherData(query);

const queryWeatherData = (query: WeatherQueryInterface): WeatherDetailType => {
    return {
        zipcode: query.zipcode,
        weather: "sunny",
        temp: 35
    };
};
export {
    routeHello,
    routeAPINames,
    routeWeather,
};