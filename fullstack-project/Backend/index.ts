import express, {
    Request,
    Response,
} from 'express';

import {
    routeHello,
    routeAPINames,
    routeWeather,
} from './src/routes.js';

const app = express();
const port = 3000;

app.get('/', (_req: Request, res: Response) => {
    res.send("root");
});

app.get('/Hello-World', function (_req: Request, res: Response): void {
    const response = routeHello();
    res.send(response);
});

app.get("/api/names",
    async function (_req: Request, res: Response) {
        let response: string;
        try {
            response = await routeAPINames();
            res.send(response);
        } catch (error) {
            console.log(error);
        }
    });

app.get(
    "/api/weather/:zipcode",
    function (req: Request, res: Response): void {
        const response = routeWeather({ zipcode: req.params.zipcode ?? "" });
        res.send(response);
    }
);

app.listen(port, function (): void {
    console.log(`listening on: http://localhost:${port}/`);
    console.log(`Press Ctrl+C to stop the server`);
});
