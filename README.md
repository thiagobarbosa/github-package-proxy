# Github Package Proxy

This is a simple application to proxy the Gradle/Maven requests when importing your libraries published via Github Packages in order to allow anonymous requests.

Currently Github does not allow public access to your Github Packages. So when someone is importing your Github package they need to do so like this:

```
repositories {
    maven {
        url = uri("https://maven.pkg.github.com/OWNER/REPOSITORY")
        credentials {
            username = project.findProperty("gpr.user") ?: System.getenv("USERNAME")
            password = project.findProperty("gpr.key") ?: System.getenv("TOKEN")
        }
   }
}
```

Which is basically unpractical for open sourced libraries.

So this application allows your library to be imported without credentials via Gradle or Maven. 

This entire project will be deprecated once Github allows unauthenticated requests to packages.
You can read more about this discussion [here](https://github.com/orgs/community/discussions/26634).

## How it works

1. This app exposes an endpoint to be called on Gradle/Maven import files when importing your library
2. The app then proxies the request to `maven.pkg.github.com` using your personal Github token that has access to the library
3. The responses from `maven.pkg.github.com` is then returned to the caller.

## Setup

1. Inside file `server.js`, replace the variable `GITHUB_OWNER` by your Github username/organization that owns the repository for your package, and the variable `GROUP_ID` by the group id of your package (like `com/example`).
2. Create a `.env` file and add a variable called `GITHUB_TOKEN` for your token. This token needs to have read access to packages on Github.

## Usage

When importing one of your packages, you can use the URL `https://urlForYourProxy` like this:

```
repositories {
    mavenCentral()
    maven {
        url = uri("https://urlForYourProxy")
    }
}
```

```
dependencies {
    implementation "com.{your-org-id}.{your-package-name}:{your-version}"
}
```

## Hosting your proxy

This proxy can be hosted anywhere that exposes a URL to the internet. This is an example to host it using Google Cloud Run:

### Create a docker image

You can create your image running this command:

```
docker build --tag {your-gcloud-region}-docker.pkg.dev/{your-gcloud-project-name}/{proxy-name}/main-image:latest .
```

### Push your docker image to Google Artifact Registry

Then push it to Google Cloud:
```
docker push {name-of-your-image-created-in-the-previous-step}
```

### Deploy your docker image to Google Cloud Run

Finally, deploy your docker image to a Cloud Run application
```
gcloud run deploy {app-name} --allow-unauthenticated --image "{image-name}"
```

Cloud Run will generate a public URL of your proxy app. You can create a custom domain for your app inside Cloud Run if you want to use a friendlier domain.

## License

This code is free to use under the terms of the MIT licence. See LICENSE.
