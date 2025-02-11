## Guardoni simple crash course

``` 
$ node bin/guardoni.js
Configuration options is read via: environment, --longopt, and static/config.json file
Three modes exists to launch Guardoni:

1— With --auto: It start a browser offering you to join existing experiments (currently two).
2— With --csv option and one between --shadowban and --comparison: Register an experiment.
3— With --experiment it would fetch what have been registered in the case n.2 ^^^^^^^^^^^.

Consult https://youtube.tracking.exposed/guardoni for the full documentation.
You need to have a reliable internet connection to ensure a proper data collection!
``` 

Three foundamental commands exists, and at least one is required. How do they works?


``` 
$ node bin/guardoni.js --csv examples/climateChange/greta-v2.csv
CSV mode: mandatory --comparison or --shadowban; --profile, --evidencetag OPTIONAL
``` 

When you use the --csv command you are SENDING your CSV to the server, and this would answer you with an experimentId. Every guardoni execution with --experiment <experimentId> would repeat the same configuration of your uploaded CSV.

After the upload, it 

``` 
$ node bin/guardoni.js --csv examples/climateChange/greta-v2.csv --comparison 
CSV mode: mandatory --comparison or --shadowban; Guardoni exit after upload
  guardoni:yt-cli Getting ready for directive type [comparison] +0ms
  guardoni:yt-cli Registering CSV examples/climateChange/greta-v2.csv as comparison +2ms
  guardoni:yt-cli Read input from file examples/climateChange/greta-v2.csv (407 bytes) 6 records +8ms
  guardoni:yt-cli CSV validated in [comparison] format specifications +3ms
CSV exist, experimentId d75f9eaf465d2cd555de65eaf61a770c82d59451 exists since 2021-09-27T21:30:28.903Z
``` 

as you can see, it tell you if the CSV registered already exists or since how long it is there.


### Effectively executing guardoni

Once you've an experimentId, you can run, for example:

``` 
$ node bin/guardoni.js --experiment d75f9eaf465d2cd555de65eaf61a770c82d59451 
``` 


... and now a less tutorialish README:

# Methodology folder, what's about?

If you pose the Question: *How to run your own algoritmh accountability experiment?*...

... the answer would be: *by controlling a methodology*

This directory contains a list of scripts that Tracking Exposed team is using to test the youtube algorithm. **Guardoni** is the tool built to allow an easy ripetition of action, evidence collection, and data analysis.

### Build the extension

By default guardoni downloads an extension version `.99` already built and places it in `yttrex/methodology/extension` which has default opt-in (meant for robots). 
By default this extension sends the results to the server.
To get an extension which sends the resuts to the local mongo database you have to build it yourself as explained in the project README , and then move the local built to methodology/extension:

```
cd yttrex/extension
npm install
npm run build
cd build
cp * ../../methodology/extension
```

**Load the extension in browser**

The extension should be enabled with the popup the first time. (otherwise checkout to `extension-default-opt-in` branch before building)
Before you can use it, you need to load it by hand: 
- Open chromium (or whichever browser you are using for the experiment)
- Go to chrome://extensions
- Enable 'developer mode' with the toggle button on the top right
- A new bar bar menu appears, from which you can pick 'load packaged extension'
- Click, and then select the whole folder `yttrex/methodology/extension` where the new build has just been added
- Click OK - the extension should load. To see it, click the puzzle piece and pin it to the extension bar.
- Open the extension and turn on the evidence collection.

Before this can work, you need to start the backend server, the mongo database and the parser process.


## "--comparison" kind of CSV

Comparison is the technique you use when a bunch of profiles should perform the exact same actions so they results might be easily compared.

#### CSV format details

$ cat examples/climateChange/greta-v2.csv
urltag,watchFor,url
greta1,end,https://www.youtube.com/watch?v=v33ro5lGHQg
greta2,end,https://www.youtube.com/watch?v=GlfW7aYouYQ
greta3,end,https://www.youtube.com/watch?v=2fycgrYgXpA
greta4,21s,https://www.youtube.com/watch?v=DQWMDWWYVz4
climate change,6s,https://www.youtube.com/results?search_query=climate+change
climate alarmism,6s,https://www.youtube.com/results?search_query=climate+alarmism

watchFor might be a number of seconds (s), minutes (m), or *end* to specify the video should play till the end.

## "--shadowban" kind of CSV (chiaroscuro test)

ChiaroScuro is one of the techniques used to test shadowban or what's alike. Other techniques exists beside ChiaroScuro.

#### CSV format details

you need a CSV with this format:

  videoURL,title

the videoURL should start with http and must be a valid youtube video Id
the title should be the title of that video (hint: they might be translated)


# TODO review below 

### ChiaroScuro design

1. from the CSV + the nickname guardoni defines the local paths, names, IDs. Same people with same csv = same experiment
2. guardoni invokes an API (POST to /api/v3/chiaroscuro) that upload the CSV and the hash. the server save the list of video and title, and thanks to this would produce a guardoni directive. this API avoid duplication of the same experiments. in the backend, is the collection 'chiaroscuro' containing these entries.
3. guardoni uses the same experiment API to mark contribution with 'nickname'
4. it would then access to the directive API, and by using the experimentId, will then perform the searches as instructed.


# API testing 

The APIs are listed is `yttrex/backend/bin/server.js` and defined in `backend/routes/`

To test them locally, make sure that you have:
- A local version of the backend server running (`npm run watch` in `backend`)
- A local version of the parserver running. Do: 
<br>`DEBUG=*,-parser:home:warning node bin/parserv2.js --minutesago 100000`<br>
Where `minutesago` indicates the server to also parse the upstanding HTMLS which where collected less than X minutes ago.
- A `mongod` server running. You can also launch Robo3T for a nice visual interface.

Then you can query the local API by running things like:
`http://localhost:9000/api/v1/last/`

