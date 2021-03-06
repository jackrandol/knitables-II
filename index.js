const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const compression = require("compression");
const cookieSession = require("cookie-session");
const server = require("http").Server(app);
const authRoutes = require("./Server/routes/authRoutes");
const knitableRoutes = require("./Server/routes/knitableRoutes");
const wallPostRoutes = require("./Server/routes/wallPostRoutes");
const basicAuth = require("basic-auth");

const cookieSessionMiddleware = cookieSession({
    secret: `I'm always angry.`,
    maxAge: 1000 * 60 * 60 * 24 * 90,
});

const auth = function (req, res, next) {
    const creds = basicAuth(req);
    if (!creds || creds.name != "knitmaster" || creds.pass != "opensesame") {
        res.setHeader(
            "WWW-Authenticate",
            'Basic realm="Enter your credentials to see this stuff."'
        );
        res.sendStatus(401);
    } else {
        next();
    }
};

app.use(auth);
app.use(cookieSessionMiddleware);
app.use(compression());
app.use(express.static("public"));
app.use(express.static("uploads"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(
    express.urlencoded({
        extendend: false,
    })
);
app.use(express.json());

app.use(require("csurf")());

app.use((req, res, next) => {
    res.set("x-frame-option", "deny");
    res.cookie("mytoken", req.csrfToken());
    next();
});

if (process.env.NODE_ENV != "production") {
    app.use(
        "/bundle.js",
        require("http-proxy-middleware")({
            target: process.env.URL || "http://localhost:8081/",
        })
    );
} else {
    app.use("/bundle.js", (req, res) => res.sendFile(`${__dirname}/bundle.js`));
}

app.get("/welcome", (req, res) => {
    if (req.session.userId) {
        res.redirect("/");
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

app.use(authRoutes);
app.use(knitableRoutes);
app.use(wallPostRoutes);

//// DONT DELETE OR COMMENT THIS OUT!!!! /////
app.get("*", function (req, res) {
    if (!req.session.userId) {
        res.redirect("/welcome");
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

server.listen(process.env.PORT || 8080, function () {
    console.log("I'm listening.");
});
