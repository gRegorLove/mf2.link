const express = require("express");
const ejs = require("ejs");

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const PORT = process.env.PORT || 3010;

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
// allow json
app.use(express.json());

const SERVICES = {
    "mastodon": "mastodon"
}

app.route("/").get(async (req, res) => {
    res.render("home");
});

app.route("/").post(async (req, res) => {
    // get fromjson body
    var url = req.body.url;
    var service = req.body.service;

    if (!url) {
        // load home.ejs
        res.render("home");
        return;
    }

    if (!service || !SERVICES[service]) {
        res.render("home", {
            error: "Invalid service"
        });
        return;
    }

    res.redirect("/" + SERVICES[service] + "?url=" + url);
    return;
});


app.route("/mastodon").get(async (req, res) => {
    var url = req.query.url;

    if (!url) {
        // load home.ejs
        res.render("home");
        return;
    }

    // https://indieweb.social/@capjamesg/110157549435454148

    var domain = new URL(url).hostname;

    var status_id = new URL(url).pathname.split("/");
    
    status_id = status_id[status_id.length - 1];

    var query_url = "https://" + domain + "/api/v1/statuses/" + status_id;

    fetch(query_url, {
        method: "GET",
        headers: {
            "Content-Type": "application/json"
        }
    }).then((response) => {
        response.json().then((data) => {
            console.log(data);
            res.render("mastodon", {
                data: data
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});
