# angular-cli with mock API server seed

Recently I was tech lead of a team working on an Angular SPA that relied heavily on RESTful API services that were hosted in ASP.NET.  The vast majority of these services required an access token in the request header.  Now I am not a fan of including code in my applications that skip authentication if an environment variable is set.  In my opinion applications shouldn't care about the environment they run in they should just work and connection strings or similar settings that are environment dependent should be handled through configuraiton that is looked up.  Similarly if we want members of the team to work without having to worry about authentication I believe they should be able to run it in an environment that does not require authentication.

In the above mentioned team we had people responsible for UX who need to run the app without authentication on non Windows devices. They need to be able to focus on the HTML, CSS and to a smaller extent TypeScript and run the app without having to worry about authentication or real data access.  So I had to figure out how they were going to do this.  With the help of Google and StackFlow I came up with the solution contained in this repo and thought I would share it as a seed project for others in a similar situation.

## Getting started

First clone this repo to a folder on your local storage.

With a terminal or command console open execute

```
npm start
```

You will see *npm install* run twice, then you a mock API server will run followed by the angular application.

Fire up a browser and point it to http://localhost:4200.  You should see the angular application running happily.

Change the url in the browser address bar to http://localhost:4200/api/v1/user.  You should now see the following:

```
[{
    "id": 1,
    "username": "user1"
},{
    "id": 2,
    "username": "user2"
}]
```

Change the url in the browser address bar to http://localhost:4200/api/v1/user/1.  You should now see the following:

```
{
    "id": 1,
    "username": "user1"
}
```

If you got this far then you are all setup to develop your angular application and provide mock data through JSON files.

## Deeper dive
So the solution I came up with was to have a mock api server running along side the angular app serving static JSON files from the file system that correspond to the API urls that the application will be using.  Additionally the angular application is configured to proxy all API requests to the mock server.  So all developers have to do is mimic the RESTful API urls as folders and add an index.json file to each folder.  The mock server will serve these files up in response to request.  Lets take a closer look start from the command that gets it all running.

In *package.json* at the root of the repo you will find the following in the *scripts* section

```
    "client": "ng serve --proxy-config proxy.config.json",
    "server": "cd mock-server && npm start",
    "start": "concurrent \"npm run server\" \"npm run client\"",
    "prestart": "npm install"
```

The *client* script runs the angular app using the webpack dev server using the angular-cli *serve* command.  Notice the parameter passed to the command this tells the webpack dev server to use *progy.config.json* to configure proxying of some requests.  We will look at this shortly.

The *server* script changes to the *mock-server* folder in the repo and run *npm start*.  This folder contains another package that contains the mock API server.  We will look at this shortly.

The *start* script has been modified from the default angular-cli generated script to run the two above mentioned scripts concurrently.

The *prestart* script simply executes *npm install* to make sure dependencies are installed.  You can remove this if you like but you will then need to make sure that *npm install* is run manually before trying to start the package.

The contents of *proxy.config.json* looks like this:

```
{
    "/api/*": {
        "target": "http://localhost:3000",
        "secure": false,
        "logLevel": "debug"
    }
}
```

It tells the webpack dev server to proxy all requests for a url starting with */api* to the mock API server running on port 3000.  So our earlier requests for http://localhost:4000/api/v1/user were proxied to http://localhost:3000/api/v1/user and the response returned as if it were local to server hosting the angular app.

### Mock API server

So if you look in the *mock-server* folder you will notice it is another node.js package and the scripts section in *package.json* looks like the following:

```
    "start": "node server.js",
    "prestart": "npm install"
```

Like our main package we have the *prestart* script to make sure dependencies are installed.  The *start* script tells node to run *server.js*, which sets up the mock API server to server static files.  I will leave you to investigate the contents, suffice to know that it creates an HTTP server that parses the url of each request and matches it to a file.  It treats the url as a folder and appends */{httpMethod}.json* to it, then if a file exists at this relative path it serves it up with a content type of *application/json*.

### Providing mock data

So how do developers provide mock data from API services you ask.  Simple I say.

All you have to do is create a file called *{method}.json* in a folder that matches the url that will be requested by the angular app, where *{method}* is the HTTP method you want a response for (get, post, put etc).  Take a look inside the *mock-server* folder, you will find the following:

```
    api
      v1
        user
          get.json
          1
            get.json
```

When a get for the url */api/v1/user* is requested the file /api/v1/user/get.json will be served
When a get for the url */api/v1/user/1* is requested the file /api/v1/user/1/get.json will be served
When a post to the url */api/v1/user* is requested the file /api/v1/user/post.json will be served

It may not cover every scenario but it worked well for me and my team and I think will work well to allow UX members of a team to do their thing without dependencies or authentication getting in the way.

Feel free to raise issues or pull requests to help improve this seed.  I will try to keep it up to date with the latest angular-cli and angular builds as it progresses.


