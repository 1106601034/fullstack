var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import express from 'express';
import { routeHello, routeAPINames, routeWeather, } from './src/routes.js';
const app = express();
const port = 3000;
app.get('/', (_req, res) => {
    res.send("root");
});
app.get('/Hello-World', function (_req, res) {
    const response = routeHello();
    res.send(response);
});
app.get("/api/names", function (_req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        let response;
        try {
            response = yield routeAPINames();
            res.send(response);
        }
        catch (error) {
            console.log(error);
        }
    });
});
app.get("/api/weather/:zipcode", function (req, res) {
    var _a;
    const response = routeWeather({ zipcode: (_a = req.params.zipcode) !== null && _a !== void 0 ? _a : "" });
    res.send(response);
});
app.listen(port, function () {
    console.log(`listening on: http://localhost:${port}/`);
    console.log(`Press Ctrl+C to stop the server`);
});
//# sourceMappingURL=index.js.map